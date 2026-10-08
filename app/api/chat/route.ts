import { streamText, generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
  recallMemoriesSafely,
  rememberFactSafely,
  getAllUserMemories,
  RecallResultItem,
} from "@/lib/memwal";
import { getPersonalNamespace } from "@/lib/namespaces";
import { checkRateLimit } from "@/lib/rate-limit";
import { isForgotten, setMemoryMetadata } from "@/lib/redis";
import { screenReadMemory, screenWriteFact } from "@/lib/firewall";
import { extractDurableFacts, extractFastFacts } from "@/lib/extract";
import { buildSystemPrompt } from "@/lib/prompts";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Aggressively sanitizes API keys from environment variables.
 * Automatically cleans:
 * - Trailing/leading whitespace and newlines
 * - Enclosing single or double quotes
 * - Accidental variable prefixes if user pasted "GOOGLE_GENERATIVE_AI_API_KEY=..." into the value field
 * - "Bearer " prefixes
 */
export function cleanApiKey(raw?: string): string {
  if (!raw) return "";
  let key = raw.trim();
  key = key.replace(/^["']|["']$/g, "").trim();
  if (key.includes("=")) {
    const parts = key.split("=");
    key = parts[parts.length - 1].trim();
    key = key.replace(/^["']|["']$/g, "").trim();
  }
  if (key.toLowerCase().startsWith("bearer ")) {
    key = key.slice(7).trim();
  }
  return key;
}

/**
 * Normalizes user-specified or environment model IDs to valid, active Gemini endpoints.
 * Protects against deprecated models (e.g. gemini-1.5-*, gemini-2.0-*, gemini-2.5-*, gemini-pro-*).
 */
export function normalizeModelId(requested?: string): string {
  if (!requested) return "gemini-flash-lite-latest";
  const cleaned = requested.replace(/^["']|["']$/g, "").trim();
  const lower = cleaned.toLowerCase();

  // If user or environment specifies any retired/deprecated model
  if (
    lower.includes("1.5") ||
    lower.includes("2.0") ||
    lower.includes("2.5") ||
    lower === "gemini-pro" ||
    lower === "gemini-pro-latest" ||
    lower === "gemini-flash"
  ) {
    return "gemini-flash-lite-latest";
  }

  // Known verified active models
  if (
    lower === "gemini-flash-lite-latest" ||
    lower === "gemini-flash-latest" ||
    lower === "gemini-3.5-flash" ||
    lower === "gemini-3.8-flash"
  ) {
    return lower;
  }

  // Safe fallback for any unknown string
  return "gemini-flash-lite-latest";
}

/**
 * Returns prioritized model fallback cascade in order of speed and stability.
 */
function getModelCascade(primary: string): string[] {
  const verifiedList = [
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-3.5-flash",
  ];
  const cascade = [primary];
  for (const m of verifiedList) {
    if (!cascade.includes(m)) {
      cascade.push(m);
    }
  }
  return cascade;
}

export async function POST(req: Request) {
  try {
    const {
      messages,
      memoryEnabled = true,
      userId = "guest",
      userName = "Guest",
      userEmail = "",
      isLoggedIn = false,
    } = await req.json();

    // 1. Rate Limiting Check
    const rateCheck = await checkRateLimit(userId);
    if (!rateCheck.success) {
      return new Response(
        JSON.stringify({
          error: "Too many messages sent. Please slow down and try again in a minute.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const rawApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!rawApiKey) {
      return new Response(
        JSON.stringify({ error: "Missing GOOGLE_GENERATIVE_AI_API_KEY in environment" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sanitize API key (strip variable names, enclosing quotes, "Bearer", or whitespace)
    const apiKey = cleanApiKey(rawApiKey);
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Invalid GOOGLE_GENERATIVE_AI_API_KEY value provided." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const google = createGoogleGenerativeAI({ apiKey });

    const rawModelId = process.env.TUSK_MODEL_ID;
    const modelId = normalizeModelId(rawModelId?.replace(/^["']|["']$/g, "").trim());
    const namespace = getPersonalNamespace(userId);

    // Find the last user message for recall & query expansion
    const userMessages = messages.filter((m: any) => m.role === "user");
    const lastUserItem = userMessages[userMessages.length - 1];
    let lastUserMsg = typeof lastUserItem?.content === "string" ? lastUserItem.content : "";
    if (lastUserItem?.attachments?.length && !lastUserMsg) {
      const names = lastUserItem.attachments.map((a: any) => a.name).join(", ");
      lastUserMsg = `Attached files: ${names}`;
    }

    const prevUserItem = userMessages[userMessages.length - 2];
    const prevUserMsg = typeof prevUserItem?.content === "string" ? prevUserItem.content : "";

    // Short-follow-up query expansion (< 6 words)
    let recallQuery = lastUserMsg;
    if (lastUserMsg.split(/\s+/).length < 6 && prevUserMsg) {
      recallQuery = `${prevUserMsg} ${lastUserMsg}`;
    }

    let usableMemories: RecallResultItem[] = [];

    // 2. Read-Side Memory Recall & Firewall (cross-chat durable memory)
    if (memoryEnabled) {
      // Parallel recall: query-specific matches and background durable facts execute concurrently
      const [recalled, allDurable] = await Promise.all([
        recallQuery.trim()
          ? recallMemoriesSafely(recallQuery, namespace, 8, 0.95)
          : Promise.resolve([]),
        getAllUserMemories(namespace),
      ]);

      // Merge: specific query matches first, followed by all background user facts
      const mergedItems: RecallResultItem[] = [...recalled];
      for (const item of allDurable) {
        if (
          !mergedItems.some(
            (m) => m.text.toLowerCase().trim() === item.text.toLowerCase().trim()
          )
        ) {
          mergedItems.push(item);
        }
      }

      for (const item of mergedItems) {
        // Drop forgotten items
        const forgotten = await isForgotten(userId, item.blob_id);
        if (forgotten) continue;

        // Read-side firewall check
        const firewallResult = await screenReadMemory(userId, item.text);
        if (firewallResult.allowed) {
          usableMemories.push({
            ...item,
            text: firewallResult.sanitizedText,
            scope: "personal",
          });
        }
      }
    }

    // 3. Construct System Prompt with packaged memory context & true user identity
    const systemPrompt = buildSystemPrompt(
      usableMemories.map((m) => ({ text: m.text, scope: m.scope })),
      {
        userId,
        userName,
        userEmail,
        isLoggedIn: Boolean(isLoggedIn && userId !== "guest"),
      }
    );

    // 4. Transform messages to support multimodal content (images & documents)
    const formattedMessages: any[] = messages.map((m: any) => {
      let promptText = typeof m.content === "string" ? m.content : "";
      const attachments = Array.isArray(m.attachments) ? m.attachments : [];

      // Append text documents to prompt text
      const docAttachments = attachments.filter((a: any) => a.type === "document");
      for (const doc of docAttachments) {
        if (doc.textContent) {
          promptText += `\n\n[Attached Document: "${doc.name}"]\n"""\n${doc.textContent.slice(0, 32000)}\n"""`;
        } else if (doc.name) {
          promptText += `\n\n[Attached File: "${doc.name}"]`;
        }
      }

      // Check for image attachments with dataUrl
      const imgAttachments = attachments.filter((a: any) => a.type === "image" && a.dataUrl);
      if (imgAttachments.length > 0) {
        const parts: any[] = [{ type: "text", text: promptText || "Please analyze this image." }];
        for (const img of imgAttachments) {
          parts.push({
            type: "image",
            image: img.dataUrl,
          });
        }
        return {
          role: m.role,
          content: parts,
        };
      }

      return {
        role: m.role,
        content: promptText,
      };
    });

    // Filter out empty messages that cause Gemini API errors
    const validMessages = formattedMessages.filter((m: any) => {
      if (Array.isArray(m.content)) return m.content.length > 0;
      return typeof m.content === "string" && m.content.trim().length > 0;
    });

    if (validMessages.length === 0) {
      validMessages.push({
        role: "user",
        content: lastUserMsg || "Hello",
      });
    }

    // 5. Get model cascade
    const candidateModels = getModelCascade(modelId);

    // 6. Record Every User Request in Walrus Memory with its own Blob ID + Extract Granular Facts
    let recordedRequestMemory: any = null;

    if (memoryEnabled && lastUserMsg.trim()) {
      // 6a. Record the user request itself directly into Walrus Memory (guarantees every request has its own blob ID)
      try {
        const screened = await screenWriteFact(userId, lastUserMsg.trim());
        if (screened.allowed) {
          const reqSave = await rememberFactSafely(screened.sanitizedText, namespace, "request");
          if (reqSave.success && reqSave.blob_id) {
            await setMemoryMetadata(userId, reqSave.blob_id, {
              category: "request",
              createdAt: new Date().toISOString(),
              scope: "personal",
              jobId: reqSave.job_id,
            });

            recordedRequestMemory = {
              blob_id: reqSave.blob_id,
              text: screened.sanitizedText,
              category: "request",
              createdAt: new Date().toLocaleDateString(),
              relevance: 1.0,
              status: "saved",
            };
          }
        }
      } catch (err) {
        console.error("Error recording user request to Walrus:", err);
      }

      // 6b. Fast-Path (0ms): Instant rule-based facts saved immediately to disk & Walrus
      try {
        const immediateFacts = extractFastFacts(lastUserMsg);
        for (const fact of immediateFacts) {
          // Skip if exact text is the same as the full user message we just recorded
          if (fact.text.toLowerCase().trim() === lastUserMsg.toLowerCase().trim()) continue;

          (async () => {
            try {
              const screened = await screenWriteFact(userId, fact.text);
              if (screened.allowed) {
                const saveRes = await rememberFactSafely(screened.sanitizedText, namespace, fact.category);
                if (saveRes.success && saveRes.blob_id) {
                  await setMemoryMetadata(userId, saveRes.blob_id, {
                    category: fact.category,
                    createdAt: new Date().toISOString(),
                    scope: "personal",
                    jobId: saveRes.job_id,
                  });
                }
              }
            } catch (_) {}
          })();
        }
      } catch (_) {}

      // 6c. Deep extraction for conversational nuances via Gemini
      (async () => {
        try {
          const facts = await extractDurableFacts(lastUserMsg);

          for (const fact of facts) {
            if (fact.risk === "suspicious") continue;
            if (fact.text.toLowerCase().trim() === lastUserMsg.toLowerCase().trim()) continue;

            const screened = await screenWriteFact(userId, fact.text);
            if (!screened.allowed) continue;

            const saveRes = await rememberFactSafely(screened.sanitizedText, namespace, fact.category);
            if (saveRes.success && saveRes.blob_id) {
              await setMemoryMetadata(userId, saveRes.blob_id, {
                category: fact.category,
                createdAt: new Date().toISOString(),
                scope: "personal",
                jobId: saveRes.job_id,
              });
            }
          }
        } catch (err) {
          console.error("Background fact extraction and store error:", err);
        }
      })();
    }

    // 7. Multi-model resilient streaming engine with zero-token auto-recovery
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let chunksSent = 0;
        let lastError: any = null;

        // Try streaming candidates in priority cascade
        for (const candidate of candidateModels) {
          if (chunksSent > 0) break;

          try {
            let candidateError: any = null;
            const result = streamText({
              model: google(candidate),
              system: systemPrompt,
              messages: validMessages,
              maxRetries: 1,
              onError: ({ error }) => {
                candidateError = error;
              },
            });

            for await (const chunk of result.textStream) {
              chunksSent++;
              controller.enqueue(encoder.encode(chunk));
            }

            // If tokens were emitted and no error aborted it, stream finished successfully
            if (chunksSent > 0 && !candidateError) {
              controller.close();
              return;
            }

            if (candidateError) {
              lastError = candidateError;
              console.warn(`Model candidate ${candidate} error:`, candidateError?.message);
            }
          } catch (modelErr: any) {
            lastError = modelErr;
            console.warn(`Model candidate ${candidate} threw:`, modelErr?.message);
          }
        }

        // Secondary Fallback: Non-streaming generateText if streaming produced 0 chunks
        if (chunksSent === 0) {
          try {
            console.warn("Stream yielded 0 chunks. Attempting generateText fallback...");
            const fallbackRes = await generateText({
              model: google("gemini-flash-lite-latest"),
              system: systemPrompt,
              messages: validMessages,
            });

            if (fallbackRes.text && fallbackRes.text.trim().length > 0) {
              controller.enqueue(encoder.encode(fallbackRes.text));
              controller.close();
              return;
            }
          } catch (fallbackErr: any) {
            lastError = fallbackErr;
            console.error("generateText fallback failed:", fallbackErr?.message);
          }
        }

        // Tertiary: Transparent diagnostic error if all models fail
        if (chunksSent === 0) {
          const detail =
            lastError?.message ||
            "Unable to generate response from Google Gemini. Please verify your GOOGLE_GENERATIVE_AI_API_KEY and model quota.";
          controller.enqueue(
            encoder.encode(
              `⚠️ AI Model Error: ${detail}\n\nPlease check your Google Gemini API key or quota settings in your Vercel deployment dashboard.`
            )
          );
        }

        controller.close();
      },
    });

    const headers: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "Access-Control-Expose-Headers": "x-recorded-memory, x-recalled-memories",
    };

    if (recordedRequestMemory) {
      headers["x-recorded-memory"] = encodeURIComponent(JSON.stringify(recordedRequestMemory));
    }

    if (usableMemories.length > 0) {
      const metadataPayload = usableMemories.slice(0, 5).map((m) => ({
        text: m.text,
        relevance: m.relevance,
        blob_id: m.blob_id,
        scope: m.scope,
      }));
      headers["x-recalled-memories"] = encodeURIComponent(JSON.stringify(metadataPayload));
    }

    return new Response(stream, { headers });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
