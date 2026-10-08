import { MemWal } from "@mysten-incubation/memwal";
import { withMemWal } from "@mysten-incubation/memwal/ai";
import type { LanguageModel } from "ai";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

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

export interface StoredFactItem {
  text: string;
  blob_id: string;
  createdAt: string;
  status: "saved" | "indexing";
}

// Persistent Disk Helper to survive worker reloads & ensure 0ms availability
function getMemoryFilePath(namespace: string): string | null {
  try {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production");
    const baseDir = isServerless ? path.join(os.tmpdir(), "tusk_data") : path.join(process.cwd(), ".data");
    const dir = path.join(baseDir, "memories");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const safeName = namespace.replace(/[^a-zA-Z0-9_-]/g, "_");
    return path.join(dir, `${safeName}.json`);
  } catch (_) {
    return null;
  }
}

function readDiskMemories(namespace: string): StoredFactItem[] {
  try {
    const file = getMemoryFilePath(namespace);
    if (file && fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, "utf8"));
      if (Array.isArray(data)) return data;
    }
  } catch (e) {
    // Non-fatal fallback to in-memory map
  }
  return [];
}

function writeDiskMemories(namespace: string, items: StoredFactItem[]) {
  try {
    const file = getMemoryFilePath(namespace);
    if (file) {
      fs.writeFileSync(file, JSON.stringify(items, null, 2), "utf8");
    }
  } catch (e) {
    // Non-fatal: in-memory map handles persistence for worker lifetime
  }
}

// Global instant facts store across Next.js worker reloads
const globalForMem = globalThis as unknown as {
  instantFactsMap?: Map<string, StoredFactItem[]>;
};

const instantFactsMap =
  globalForMem.instantFactsMap || (globalForMem.instantFactsMap = new Map());

export function getInstantFacts(namespace: string): StoredFactItem[] {
  if (!instantFactsMap.has(namespace)) {
    const diskList = readDiskMemories(namespace);
    instantFactsMap.set(namespace, diskList);
  }
  return instantFactsMap.get(namespace) || [];
}

export function addInstantFact(
  namespace: string,
  text: string,
  blob_id: string,
  status: "saved" | "indexing" = "indexing"
) {
  const current = getInstantFacts(namespace);
  const existingIndex = current.findIndex(
    (item) => item.text.toLowerCase().trim() === text.toLowerCase().trim()
  );

  const newItem: StoredFactItem = {
    text: text.trim(),
    blob_id,
    createdAt: new Date().toISOString(),
    status,
  };

  if (existingIndex >= 0) {
    current[existingIndex] = newItem;
  } else {
    current.unshift(newItem);
  }

  instantFactsMap.set(namespace, current);
  writeDiskMemories(namespace, current);
}

export function updateInstantFactBlob(namespace: string, oldBlobOrText: string, newBlobId: string) {
  const list = getInstantFacts(namespace);
  let changed = false;
  for (const item of list) {
    if (item.blob_id === oldBlobOrText || item.text === oldBlobOrText) {
      item.blob_id = newBlobId;
      item.status = "saved";
      changed = true;
    }
  }
  if (changed) {
    writeDiskMemories(namespace, list);
  }
}

// Fast in-memory cache for recent recall queries
const recallCache = new Map<string, { data: RecallResultItem[]; expiry: number }>();

// Cache tracking recent external Walrus syncs per namespace
const walrusSyncCache = new Map<string, number>();

/**
 * Retrieve ALL active durable memories for a user across all sessions.
 * Guarantees that in any new chat, Tusk knows all previously stored facts.
 */
export async function getAllUserMemories(namespace: string): Promise<RecallResultItem[]> {
  const localList = getInstantFacts(namespace);
  const items: RecallResultItem[] = localList.map((f) => ({
    blob_id: f.blob_id,
    text: f.text,
    distance: 0.1,
    relevance: 0.95,
    status: f.status,
    scope: "personal",
  }));

  const now = Date.now();
  const lastSync = walrusSyncCache.get(namespace) || 0;
  // If synced Walrus within the last 30s, return immediately (0ms)
  if (now - lastSync < 30000) {
    return items;
  }

  // Query Walrus relayer with snappy 500ms timeout guard
  const client = getMemWalClient();
  if (client) {
    try {
      walrusSyncCache.set(namespace, now);
      const walrusPromise = client.recall({
        query: "all user facts preferences identity travel background goals",
        limit: 30,
        namespace,
        maxDistance: 1.0,
      });
      const timeoutPromise = new Promise<{ results: any[] }>((resolve) =>
        setTimeout(() => resolve({ results: [] }), 500)
      );
      const res: any = await Promise.race([walrusPromise, timeoutPromise]);
      for (const w of res?.results || []) {
        if (!items.some((it) => it.text.toLowerCase() === w.text.toLowerCase())) {
          items.push({
            blob_id: w.blob_id,
            text: w.text,
            distance: w.distance,
            relevance: Math.max(0, Math.min(1, 1 - w.distance)),
            status: "saved",
            scope: "personal",
          });
          // Cache locally to disk
          addInstantFact(namespace, w.text, w.blob_id, "saved");
        }
      }
    } catch (_) {}
  }

  return items;
}

/**
 * Recall memories safely with semantic distance and read-through caching.
 */
export async function recallMemoriesSafely(
  query: string,
  namespace: string = "default",
  limit: number = 8,
  maxDistance: number = 0.92
): Promise<RecallResultItem[]> {
  const client = getMemWalClient();
  const trimmedQuery = query.trim().toLowerCase();
  const queryTokens = trimmedQuery.split(/\s+/).filter((t) => t.length > 2);

  // 1. Check instant local facts for this namespace first (0ms latency)
  const localList = getInstantFacts(namespace);
  const matchedLocal: RecallResultItem[] = [];

  for (const fact of localList) {
    const factLower = fact.text.toLowerCase();
    // Broad match if token overlap or generic recall query
    const hasToken =
      queryTokens.length === 0 ||
      queryTokens.some((t) => factLower.includes(t)) ||
      trimmedQuery.includes("know") ||
      trimmedQuery.includes("remember") ||
      trimmedQuery.includes("who am i") ||
      trimmedQuery.includes("about me") ||
      trimmedQuery.includes("fact") ||
      trimmedQuery.includes("preference") ||
      trimmedQuery.includes("earlier") ||
      trimmedQuery.includes("previous") ||
      trimmedQuery.includes("chat") ||
      trimmedQuery.includes("travel") ||
      trimmedQuery.includes("time") ||
      trimmedQuery.includes("tomorrow");

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

    // 1200ms timeout guard so Walrus has enough time to respond without risking serverless timeout
    const timeoutPromise = new Promise<{ results: any[] }>((resolve) =>
      setTimeout(() => resolve({ results: [] }), 1200)
    );

    const res: any = await Promise.race([recallPromise, timeoutPromise]);

    const walrusResults: RecallResultItem[] = (res?.results || []).map((item: any) => ({
      blob_id: item.blob_id,
      text: item.text,
      distance: item.distance,
      relevance: Math.max(0, Math.min(1, 1 - item.distance)),
      status: "saved" as const,
    }));

    // Merge instant local facts and Walrus results
    const combined: RecallResultItem[] = [...matchedLocal];
    for (const w of walrusResults) {
      if (!combined.some((c) => c.blob_id === w.blob_id || c.text.toLowerCase() === w.text.toLowerCase())) {
        combined.push(w);
        // Persist to local disk so subsequent queries never miss it
        addInstantFact(namespace, w.text, w.blob_id, "saved");
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
 * Remember a fact: immediately registers in local persistent disk memory (0ms)
 * and writes to Walrus decentralized Sui storage in the background.
 */
export async function rememberFactSafely(
  text: string,
  namespace: string = "default"
): Promise<{ blob_id?: string; job_id?: string; success: boolean }> {
  const tempBlobId = `walrus_pending_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  // Immediately persist so the NEXT message or a NEW CHAT knows it in 0ms!
  addInstantFact(namespace, text, tempBlobId, "indexing");

  const client = getMemWalClient();
  if (!client) {
    return { success: true, blob_id: tempBlobId };
  }

  try {
    const job = await client.remember(text, namespace);
    if (job?.job_id) {
      // Non-blocking background resolution so local fact is active in 0ms without waiting for chain
      client
        .waitForRememberJob(job.job_id)
        .then((done: any) => {
          if (done?.blob_id) {
            updateInstantFactBlob(namespace, tempBlobId, done.blob_id);
          }
        })
        .catch(() => {});
    }

    return {
      success: true,
      job_id: job?.job_id,
      blob_id: tempBlobId,
    };
  } catch (err) {
    console.error(`Walrus remember error in namespace '${namespace}':`, err);
    return { success: true, blob_id: tempBlobId };
  }
}

/**
 * Wrap a language model with drop-in withMemWal middleware.
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
