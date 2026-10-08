import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { rememberFactSafely, getInstantFacts } from "@/lib/memwal";
import { getPersonalNamespace } from "@/lib/namespaces";
import { setMemoryMetadata } from "@/lib/redis";
import { extractFastFacts } from "@/lib/extract";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function cleanApiKey(raw?: string): string {
  if (!raw) return "";
  let key = raw.trim().replace(/^["']|["']$/g, "").trim();
  if (key.includes("=")) {
    const parts = key.split("=");
    key = parts[parts.length - 1].trim();
  }
  if (key.toLowerCase().startsWith("bearer ")) {
    key = key.slice(7).trim();
  }
  return key;
}

function normalizeModelId(requested?: string): string {
  if (!requested) return "gemini-flash-lite-latest";
  const cleaned = requested.replace(/^["']|["']$/g, "").trim();
  return cleaned || "gemini-flash-lite-latest";
}

/**
 * Filter out sensitive info: passwords, API keys, card numbers
 */
function containsSensitiveData(text: string): boolean {
  // Passwords
  if (/\b(?:password|passwd|pwd)\s*[:=]\s*\S+/i.test(text)) return true;
  // API keys / tokens / private keys
  if (/(?:api[_-]?key|secret[_-]?key|private[_-]?key|access[_-]?token|bearer)\s*[:=]\s*\S+/i.test(text)) return true;
  if (/\b(?:sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|AIza[0-9A-Za-z-_]{35})\b/.test(text)) return true;
  // Card numbers (13-19 digits or keywords)
  if (/\b(?:\d[ -]?){13,19}\b/.test(text)) return true;
  if (/\b(?:card\s*number|credit\s*card|debit\s*card|cvv|cvc)\b/i.test(text)) return true;
  return false;
}

function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?'"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userMessage, userId = "guest" } = body;

    const messageText = typeof userMessage === "string" ? userMessage.trim() : "";
    const namespace = getPersonalNamespace(userId);

    console.log(`[Extraction] Starting extraction for user message: "${messageText}", userId: "${userId}", namespace: "${namespace}"`);

    if (!messageText || messageText.length < 3) {
      console.log("[Extraction] Message is too short to contain durable facts. Returning [].");
      return NextResponse.json({ success: true, facts: [], newMemories: [] });
    }

    // 1. Call Gemini LLM for durable fact extraction
    const apiKey = cleanApiKey(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    let rawText = "";

    if (apiKey) {
      const google = createGoogleGenerativeAI({ apiKey });
      const modelId = normalizeModelId(process.env.TUSK_MODEL_ID);

      const prompt = `You are an AI memory extraction system for Tusk chatbot.
Analyze the user's message and extract any durable, permanent facts they share about themselves (such as name, identity, preferences, projects, goals, location, employment, or background).

Rules:
1. Return ONLY a valid JSON array of concise third-person declarative statements (e.g. ["The user's name is Alex", "The user prefers dark mode", "The user is building a Web3 payment app", "The user lives in Oslo"]).
2. If the user did NOT share any durable facts (e.g. simple questions, greetings, temporary remarks, code requests, general chat), return exactly [].
3. NEVER extract passwords, API keys, access tokens, secrets, or credit card numbers.
4. Do NOT output any explanations, markdown headers, or text outside the JSON array.

User message:
"""
${messageText}
"""`;

      console.log(`[Extraction] Calling LLM model: ${modelId}`);
      try {
        const result = await generateText({
          model: google(modelId),
          prompt,
          maxRetries: 1,
        });
        rawText = result.text || "";
        console.log(`[Extraction] LLM raw output: ${rawText}`);
      } catch (llmErr: any) {
        console.error(`[Extraction Error] Primary LLM call failed: ${llmErr.message}`);
        try {
          console.log("[Extraction] Trying fallback model: gemini-flash-latest");
          const fallbackResult = await generateText({
            model: google("gemini-flash-latest"),
            prompt,
            maxRetries: 1,
          });
          rawText = fallbackResult.text || "";
          console.log(`[Extraction] Fallback LLM raw output: ${rawText}`);
        } catch (fbErr: any) {
          console.error(`[Extraction Error] Fallback LLM call failed: ${fbErr.message}`);
        }
      }
    }

    // 2. Strip code fences before parsing & catch and log parse errors
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    }
    console.log(`[Parsing] Cleaned JSON string to parse: ${cleanJson}`);

    let extractedFacts: string[] = [];
    if (cleanJson) {
      try {
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed)) {
          extractedFacts = parsed
            .map((item: any) => (typeof item === "string" ? item.trim() : item?.text?.trim()))
            .filter((t: any): t is string => Boolean(t && typeof t === "string"));
          console.log(`[Parsing] Successfully parsed array with ${extractedFacts.length} facts.`);
        } else if (parsed && Array.isArray(parsed.facts)) {
          extractedFacts = parsed.facts
            .map((item: any) => (typeof item === "string" ? item.trim() : item?.text?.trim()))
            .filter((t: any): t is string => Boolean(t && typeof t === "string"));
          console.log(`[Parsing] Successfully parsed facts object with ${extractedFacts.length} facts.`);
        } else {
          console.log("[Parsing] Output was not an array, defaulting to [].");
        }
      } catch (parseErr: any) {
        console.error(`[Parsing Error] Failed to parse JSON from LLM extraction output: ${parseErr.message}`);
        console.error(`[Parsing Error] Raw content was: ${cleanJson}`);
        extractedFacts = [];
      }
    }

    // Fallback: fast-path heuristic rules ensure direct statements ("My name is...", "I prefer...") are never dropped
    if (extractedFacts.length === 0) {
      const fast = extractFastFacts(messageText);
      if (fast.length > 0) {
        console.log(`[Extraction] Heuristic extractor captured ${fast.length} facts.`);
        extractedFacts = fast.map((f) => f.text);
      }
    }

    console.log(`[Parsing] Total facts before filtering: ${extractedFacts.length}`, extractedFacts);

    // 3. Filter sensitive data (passwords, API keys, card numbers)
    const safeFacts = extractedFacts.filter((fact) => {
      if (containsSensitiveData(fact)) {
        console.log(`[Security] Blocked sensitive data in fact: "${fact}"`);
        return false;
      }
      return true;
    });

    // 4. Skip duplicates of facts already stored in the same user store
    const existingItems = getInstantFacts(namespace);
    console.log(`[Saving] Checking against ${existingItems.length} existing memories in store for '${namespace}'`);

    const newUniqueFacts: string[] = [];
    for (const fact of safeFacts) {
      const normFact = normalizeForComparison(fact);
      const isDuplicate = existingItems.some((existing) => {
        const normExisting = normalizeForComparison(existing.text);
        return (
          normExisting === normFact ||
          normExisting.includes(normFact) ||
          normFact.includes(normExisting)
        );
      });

      if (isDuplicate) {
        console.log(`[Saving] Skipping duplicate fact: "${fact}"`);
      } else if (!newUniqueFacts.some((f) => normalizeForComparison(f) === normFact)) {
        newUniqueFacts.push(fact);
      }
    }

    console.log(`[Saving] Found ${newUniqueFacts.length} new unique facts to persist.`);

    // 5. Save to the same store the panel reads from, with a unique Walrus Blob ID for each memory
    const savedMemories: any[] = [];

    for (const factText of newUniqueFacts) {
      const lower = factText.toLowerCase();
      let category = "preference";
      if (lower.includes("name is") || lower.includes("called") || lower.includes("lives in") || lower.includes("located in")) {
        category = "identity";
      } else if (lower.includes("building") || lower.includes("project") || lower.includes("app") || lower.includes("developing")) {
        category = "project";
      } else if (lower.includes("goal") || lower.includes("plans to") || lower.includes("wants to") || lower.includes("aims to")) {
        category = "goal";
      } else if (lower.includes("works at") || lower.includes("works as") || lower.includes("employed")) {
        category = "employment";
      }

      const saveRes = await rememberFactSafely(factText, namespace, category);
      console.log(`[Saving] Stored fact: "${factText}" with unique Blob ID: ${saveRes.blob_id} (category: ${category})`);

      await setMemoryMetadata(userId, saveRes.blob_id, {
        category,
        createdAt: new Date().toISOString(),
        scope: "personal",
        jobId: saveRes.job_id,
      });

      savedMemories.push({
        blob_id: saveRes.blob_id,
        text: factText,
        category,
        createdAt: new Date().toLocaleDateString(),
        relevance: 0.95,
        status: "saved",
      });
    }

    console.log(`[Saving] Successfully saved ${savedMemories.length} new facts to store for user '${userId}'.`);

    return NextResponse.json(
      {
        success: true,
        facts: newUniqueFacts,
        newMemories: savedMemories,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("[Extraction Error] Top-level handler failure:", err);
    return NextResponse.json(
      { success: false, error: err.message, facts: [], newMemories: [] },
      { status: 500 }
    );
  }
}
