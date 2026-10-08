import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { recallMemoriesSafely, rememberFactSafely, RecallResultItem } from "@/lib/memwal";
import { getPersonalNamespace } from "@/lib/namespaces";
import { checkRateLimit } from "@/lib/rate-limit";
import { isForgotten, setMemoryMetadata } from "@/lib/redis";
import { screenReadMemory, screenWriteFact } from "@/lib/firewall";
import { extractDurableFacts } from "@/lib/extract";
import { buildSystemPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const { messages, memoryEnabled = true, userId = "user_default" } = await req.json();

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

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing GOOGLE_GENERATIVE_AI_API_KEY in environment" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const modelId = process.env.TUSK_MODEL_ID || "gemini-flash-lite-latest";
    const namespace = getPersonalNamespace(userId);

    // Find the last user message for recall & query expansion
    const userMessages = messages.filter((m: any) => m.role === "user");
    const lastUserMsg = userMessages[userMessages.length - 1]?.content || "";
    const prevUserMsg = userMessages[userMessages.length - 2]?.content || "";

    // Short-follow-up query expansion (< 6 words)
    let recallQuery = lastUserMsg;
    if (lastUserMsg.split(/\s+/).length < 6 && prevUserMsg) {
      recallQuery = `${prevUserMsg} ${lastUserMsg}`;
    }

    let usableMemories: RecallResultItem[] = [];

    // 2. Read-Side Memory Recall & Firewall
    if (memoryEnabled && recallQuery.trim()) {
      const recalled = await recallMemoriesSafely(recallQuery, namespace, 6, 0.7);

      for (const item of recalled) {
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

    // 3. Construct System Prompt with packaged memory context
    const systemPrompt = buildSystemPrompt(
      usableMemories.map((m) => ({ text: m.text, scope: m.scope }))
    );

    // 4. Stream response with high-speed Gemini
    const result = streamText({
      model: google(modelId),
      system: systemPrompt,
      messages,
      maxRetries: 1,
    });

    // 5. Background Asynchronous Fact Extraction and Walrus Storage
    if (memoryEnabled && lastUserMsg.trim()) {
      // Fire-and-forget background pipeline
      (async () => {
        try {
          const facts = await extractDurableFacts(lastUserMsg);

          for (const fact of facts) {
            // Write-side screening
            if (fact.risk === "suspicious") continue;

            const screened = await screenWriteFact(userId, fact.text);
            if (!screened.allowed) continue;

            // Deduplication: vector search top 1; skip if cosine distance < 0.12
            const existing = await recallMemoriesSafely(screened.sanitizedText, namespace, 1, 0.5);
            if (existing.length > 0 && existing[0].distance < 0.12) {
              continue; // near duplicate
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

    // Return text stream with recalled memories encoded in header
    const response = result.toTextStreamResponse();
    if (usableMemories.length > 0) {
      const metadataPayload = usableMemories.slice(0, 5).map((m) => ({
        text: m.text,
        relevance: m.relevance,
        blob_id: m.blob_id,
        scope: m.scope,
      }));
      response.headers.set(
        "x-recalled-memories",
        encodeURIComponent(JSON.stringify(metadataPayload))
      );
    }

    return response;
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
