import { MemWal } from "@mysten-incubation/memwal";
import { withMemWal } from "@mysten-incubation/memwal/ai";
import type { LanguageModel } from "ai";

let clientInstance: MemWal | null = null;

export function getMemWalClient(): MemWal | null {
  const privateKey = process.env.MEMWAL_PRIVATE_KEY;
  const accountId = process.env.MEMWAL_ACCOUNT_ID;
  const serverUrl = process.env.MEMWAL_SERVER_URL || "https://relayer.memory.walrus.xyz";

  if (!privateKey || !accountId) {
    console.warn("MemWal credentials missing in environment; running in memory-disabled mode.");
    return null;
  }

  if (!clientInstance) {
    clientInstance = MemWal.create({
      key: privateKey,
      accountId: accountId,
      serverUrl: serverUrl,
      namespace: "default",
    });
  }

  return clientInstance;
}

export interface RecallResultItem {
  blob_id: string;
  text: string;
  distance: number;
  relevance: number;
  scope?: "personal" | "room";
  status?: "saved" | "indexing";
}

// Global instant facts store across Next.js worker reloads
const globalForMem = globalThis as unknown as {
  instantFactsMap?: Map<string, Array<{ text: string; blob_id: string; createdAt: string; status: "saved" | "indexing" }>>;
};

const instantFactsMap =
  globalForMem.instantFactsMap || (globalForMem.instantFactsMap = new Map());

export function getInstantFacts(namespace: string) {
  return instantFactsMap.get(namespace) || [];
}

export function addInstantFact(namespace: string, text: string, blob_id: string, status: "saved" | "indexing" = "indexing") {
  if (!instantFactsMap.has(namespace)) {
    instantFactsMap.set(namespace, []);
  }
  const list = instantFactsMap.get(namespace)!;
  // Prevent duplicate text in instant list
  const existingIndex = list.findIndex((item: { text: string }) => item.text.toLowerCase() === text.toLowerCase());
  if (existingIndex >= 0) {
    list[existingIndex] = { text, blob_id, createdAt: new Date().toISOString(), status };
  } else {
    list.unshift({ text, blob_id, createdAt: new Date().toISOString(), status });
  }
}

export function updateInstantFactBlob(namespace: string, oldBlobOrText: string, newBlobId: string) {
  const list = instantFactsMap.get(namespace);
  if (!list) return;
  for (const item of list) {
    if (item.blob_id === oldBlobOrText || item.text === oldBlobOrText) {
      item.blob_id = newBlobId;
      item.status = "saved";
    }
  }
}

// Fast in-memory cache for recent recall queries (TTL 45 seconds)
const recallCache = new Map<string, { data: RecallResultItem[]; expiry: number }>();

/**
 * Recall memories safely with fast timeout (max 1500ms) and instant-fact read-through cache.
 */
export async function recallMemoriesSafely(
  query: string,
  namespace: string = "default",
  limit: number = 6,
  maxDistance: number = 0.7
): Promise<RecallResultItem[]> {
  const client = getMemWalClient();
  const trimmedQuery = query.trim().toLowerCase();
  const queryTokens = trimmedQuery.split(/\s+/).filter((t) => t.length > 2);

  // 1. Check instant local facts for this namespace first (0ms latency)
  const localList = instantFactsMap.get(namespace) || [];
  const matchedLocal: RecallResultItem[] = [];

  for (const fact of localList) {
    const factLower = fact.text.toLowerCase();
    // Match if broad query or token overlap
    const hasToken = queryTokens.length === 0 || queryTokens.some((t) => factLower.includes(t)) ||
      trimmedQuery.includes("know") || trimmedQuery.includes("remember") || trimmedQuery.includes("who am i") ||
      trimmedQuery.includes("about me") || trimmedQuery.includes("fact") || trimmedQuery.includes("preference");

    if (hasToken) {
      matchedLocal.push({
        blob_id: fact.blob_id,
        text: fact.text,
        distance: 0.1,
        relevance: 0.95,
        status: fact.status,
      });
    }
  }

  if (!client) {
    return matchedLocal.slice(0, limit);
  }

  const cacheKey = `${namespace}:${trimmedQuery}:${limit}`;
  const now = Date.now();
  const cached = recallCache.get(cacheKey);
  if (cached && cached.expiry > now) {
    // Merge cached with any newer local facts
    const merged = [...matchedLocal];
    for (const item of cached.data) {
      if (!merged.some((m) => m.blob_id === item.blob_id || m.text === item.text)) {
        merged.push(item);
      }
    }
    return merged.slice(0, limit);
  }

  try {
    const recallPromise = client.recall({
      query,
      limit,
      namespace,
      maxDistance,
    });

    // 1500ms timeout guard so Walrus latency never blocks prompt generation
    const timeoutPromise = new Promise<{ results: any[] }>((resolve) =>
      setTimeout(() => resolve({ results: [] }), 1500)
    );

    const res: any = await Promise.race([recallPromise, timeoutPromise]);

    const walrusResults: RecallResultItem[] = (res?.results || []).map((item: any) => ({
      blob_id: item.blob_id,
      text: item.text,
      distance: item.distance,
      relevance: Math.max(0, Math.min(1, 1 - item.distance)),
      status: "saved" as const,
    }));

    // Merge instant local facts and Walrus results, avoiding duplicates
    const combined: RecallResultItem[] = [...matchedLocal];
    for (const w of walrusResults) {
      if (!combined.some((c) => c.blob_id === w.blob_id || c.text.toLowerCase() === w.text.toLowerCase())) {
        combined.push(w);
      }
    }

    recallCache.set(cacheKey, { data: combined, expiry: now + 45000 });
    return combined.slice(0, limit);
  } catch (err) {
    console.error(`Walrus recall error in namespace '${namespace}':`, err);
    return matchedLocal.slice(0, limit);
  }
}

/**
 * Remember a fact: immediately registers in local instant memory for 0ms recall,
 * and writes to Walrus decentralized storage in the background.
 */
export async function rememberFactSafely(
  text: string,
  namespace: string = "default"
): Promise<{ blob_id?: string; job_id?: string; success: boolean }> {
  // 1. Immediately add to instant facts so subsequent chats know it right away!
  const tempBlobId = `walrus_pending_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  addInstantFact(namespace, text, tempBlobId, "indexing");

  const client = getMemWalClient();
  if (!client) {
    return { success: true, blob_id: tempBlobId };
  }

  try {
    const job = await client.remember(text, namespace);
    if (!job?.job_id) {
      return { success: true, blob_id: tempBlobId };
    }

    // Wait for the background indexer asynchronously without blocking client if called fire-and-forget
    const done = await client.waitForRememberJob(job.job_id);
    const finalBlobId = done.blob_id || tempBlobId;

    // Update the temporary entry with the confirmed on-chain blob ID
    updateInstantFactBlob(namespace, tempBlobId, finalBlobId);

    return {
      success: true,
      job_id: job.job_id,
      blob_id: finalBlobId,
    };
  } catch (err) {
    console.error(`Walrus remember error in namespace '${namespace}':`, err);
    return { success: true, blob_id: tempBlobId };
  }
}

/**
 * Wrap a language model with drop-in withMemWal middleware (M2 Safety Net).
 */
export function wrapModelWithMemWal(
  model: LanguageModel,
  namespace: string = "default"
) {
  const privateKey = process.env.MEMWAL_PRIVATE_KEY;
  const accountId = process.env.MEMWAL_ACCOUNT_ID;
  if (!privateKey || !accountId) return model;

  return withMemWal(model, {
    key: privateKey,
    accountId,
    serverUrl: process.env.MEMWAL_SERVER_URL || "https://relayer.memory.walrus.xyz",
    namespace,
  });
}
