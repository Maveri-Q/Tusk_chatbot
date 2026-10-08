import { streamText } from "ai";
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
import { extractDurableFacts } from "@/lib/extract";
import { buildSystemPrompt } from "@/lib/prompts";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * Normalizes user-specified or environment model IDs to valid, active Gemini endpoints.
 */
function normalizeModelId(requested?: string): string {
  if (!requested) return "gemini-flash-lite-latest";
  const lower = requested.toLowerCase().trim();
  if (
    lower === "gemini-1.5-flash" ||
    lower === "gemini-1.5-flash-latest" ||
    lower === "gemini-1.5-pro" ||
    lower === "gemini-pro" ||
    lower === "gemini-flash"
  ) {
    return "gemini-flash-lite-latest";
  }
  return requested.trim();
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

    // Sanitize API key (strip any stray quotes or whitespace from copy-paste)
    const apiKey = rawApiKey.replace(/^["']|["']$/g, "").trim();
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
      // Query-specific semantic matches
      const recalled = recallQuery.trim()
        ? await recallMemoriesSafely(recallQuery, namespace, 8, 0.95)
        : [];

      // Complete profile of all durable memories previously saved for this user
      const allDurable = await getAllUserMemories(namespace);

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

    // 5. Stream response with high-speed Gemini with automatic resilience
    let result;
    try {
      result = streamText({
        model: google(modelId),
        system: systemPrompt,
        messages: validMessages,
        maxRetries: 2,
      });
    } catch (e) {
      console.warn(`Primary model ${modelId} failed, falling back to gemini-2.5-flash:`, e);
      result = streamText({
        model: google("gemini-2.5-flash"),
        system: systemPrompt,
        messages: validMessages,
        maxRetries: 2,
      });
    }

    // 6. Background Asynchronous Fact Extraction and Walrus Storage
    if (memoryEnabled && lastUserMsg.trim()) {
      (async () => {
        try {
          const facts = await extractDurableFacts(lastUserMsg);

          for (const fact of facts) {
            // Write-side screening
            if (fact.risk === "suspicious") continue;

            const screened = await screenWriteFact(userId, fact.text);
            if (!screened.allowed) continue;

            // Deduplication: skip only if exact text already stored
            const existing = await recallMemoriesSafely(screened.sanitizedText, namespace, 1, 0.5);
            if (
              existing.length > 0 &&
              (existing[0].text.toLowerCase() === screened.sanitizedText.toLowerCase() ||
                (existing[0].status === "saved" && existing[0].distance < 0.06))
            ) {
              continue; // exact duplicate
            }

            // Save to Walrus Memory
            const saveRes = await rememberFactSafely(screened.sanitizedText, namespace);
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

    // 7. Robust error-capturing stream pipe: ensures tokens stream and errors are transparent
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let chunkCount = 0;
        try {
          for await (const chunk of result.textStream) {
            chunkCount++;
            controller.enqueue(encoder.encode(chunk));
          }
          if (chunkCount === 0) {
            controller.enqueue(
              encoder.encode("I received your message, but the model generated 0 tokens. Please check your model settings.")
            );
          }
          controller.close();
        } catch (streamErr: any) {
          console.error("AI text stream error:", streamErr);
          const errorNotice = chunkCount > 0
            ? `\n\n⚠️ [Streaming disconnected: ${streamErr?.message || "connection error"}]`
            : `⚠️ AI Error: ${streamErr?.message || "Model failed to generate response. Please verify your Google Gemini API key and model quota."}`;
          controller.enqueue(encoder.encode(errorNotice));
          controller.close();
        }
      },
    });

    const headers: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
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
