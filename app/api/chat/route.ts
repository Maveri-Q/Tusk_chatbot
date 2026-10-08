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
import { getUserStoredSessions } from "../sessions/route";

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
      otherSessions = [],
      activeSessionId = "",
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

      // Prioritize high-value facts (identity, project, goal, preference) over generic items
      usableMemories.sort((a, b) => {
        const catOrder: Record<string, number> = {
          identity: 1,
          project: 2,
          goal: 3,
          employment: 4,
          preference: 5,
        };
        const aVal = catOrder[a.category || ""] || 10;
        const bVal = catOrder[b.category || ""] || 10;
        return aVal - bVal;
      });

      if (usableMemories.length > 25) {
        usableMemories = usableMemories.slice(0, 25);
      }
    }

    // 3. Synchronize cross-chat histories for this account
    let crossChatSessions = Array.isArray(otherSessions) && otherSessions.length > 0 ? otherSessions : [];
    if (crossChatSessions.length === 0) {
      try {
        const stored = await getUserStoredSessions(userId);
        if (Array.isArray(stored) && stored.length > 0) {
          crossChatSessions = stored
            .filter((s: any) => s.id !== activeSessionId && Array.isArray(s.messages) && s.messages.length > 0)
            .map((s: any) => ({
              id: s.id,
              title: s.title,
              updatedAt: s.updatedAt,
              messages: s.messages.slice(-8).map((m: any) => ({
                role: m.role,
                content: typeof m.content === "string" ? m.content : "",
              })),
            }));
        }
      } catch (_) {}
    }

    // 4. Construct System Prompt with packaged memory context, user identity & other chat histories
    const systemPrompt = buildSystemPrompt(
      usableMemories.map((m) => ({ text: m.text, scope: m.scope })),
      {
        userId,
        userName,
        userEmail,
        isLoggedIn: Boolean(isLoggedIn && userId !== "guest"),
      },
      crossChatSessions
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

    // 6. Multi-model resilient streaming engine with zero-token auto-recovery
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
      "Access-Control-Expose-Headers": "x-recalled-memories",
    };

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
