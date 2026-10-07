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
}

/**
 * Recall memories safely with try/catch fallback.
 */
export async function recallMemoriesSafely(
  query: string,
  namespace: string = "default",
  limit: number = 6,
  maxDistance: number = 0.7
): Promise<RecallResultItem[]> {
  const client = getMemWalClient();
  if (!client) return [];

  try {
    const res = await client.recall({
      query,
      limit,
      namespace,
      maxDistance,
    });

    if (!res?.results) return [];

    return res.results.map((item) => ({
      blob_id: item.blob_id,
      text: item.text,
      distance: item.distance,
      relevance: Math.max(0, Math.min(1, 1 - item.distance)),
    }));
  } catch (err) {
    console.error(`Walrus recall error in namespace '${namespace}':`, err);
    return [];
  }
}

/**
 * Remember a fact asynchronously and wait for job completion.
 */
export async function rememberFactSafely(
  text: string,
  namespace: string = "default"
): Promise<{ blob_id?: string; job_id?: string; success: boolean }> {
  const client = getMemWalClient();
  if (!client) return { success: false };

  try {
    const job = await client.remember(text, namespace);
    if (!job?.job_id) return { success: false };

    // Wait for the background indexer
    const done = await client.waitForRememberJob(job.job_id);
    return {
      success: true,
      job_id: job.job_id,
      blob_id: done.blob_id,
    };
  } catch (err) {
    console.error(`Walrus remember error in namespace '${namespace}':`, err);
    return { success: false };
  }
}

/**
 * Wrap a language model with drop-in withMemWal middleware (M2 Safety Net).
 */
export function wrapModelWithMemWal(
  baseModel: LanguageModel,
  namespace: string = "default"
): LanguageModel {
  const privateKey = process.env.MEMWAL_PRIVATE_KEY;
  const accountId = process.env.MEMWAL_ACCOUNT_ID;
  const serverUrl = process.env.MEMWAL_SERVER_URL || "https://relayer.memory.walrus.xyz";

  if (!privateKey || !accountId) {
    return baseModel;
  }

  try {
    return withMemWal(baseModel, {
      key: privateKey,
      accountId: accountId,
      serverUrl: serverUrl,
      namespace,
      maxMemories: 5,
      autoSave: true,
      minRelevance: 0.3,
    });
  } catch (err) {
    console.error("Failed to wrap model with withMemWal; falling back to base model:", err);
    return baseModel;
  }
}
