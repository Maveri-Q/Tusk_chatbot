import { Redis } from "@upstash/redis";

// Check if Upstash is configured
const hasUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redisClient = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const globalForTusk = globalThis as unknown as {
  memoryForgotSet?: Map<string, Set<string>>;
  memoryMetaHash?: Map<string, Map<string, string>>;
  memorySecLogList?: Map<string, string[]>;
};

const memoryForgotSet =
  globalForTusk.memoryForgotSet || (globalForTusk.memoryForgotSet = new Map());
const memoryMetaHash =
  globalForTusk.memoryMetaHash || (globalForTusk.memoryMetaHash = new Map());
const memorySecLogList =
  globalForTusk.memorySecLogList || (globalForTusk.memorySecLogList = new Map());

export interface MemoryMetadata {
  category: "identity" | "preference" | "goal" | "project" | "relationship" | "skill" | "other";
  createdAt: string;
  scope: "personal" | "room";
  jobId?: string;
}

export interface SecurityLogEntry {
  ts: string;
  snippet: string;
  reason: string;
  layer: "write" | "read";
}

/**
 * Check if a blobId is marked as "forgotten" by the user.
 */
export async function isForgotten(userId: string, blobId: string): Promise<boolean> {
  if (redisClient) {
    try {
      const isMember = await redisClient.sismember(`tusk:forgot:${userId}`, blobId);
      return isMember === 1;
    } catch (err) {
      console.error("Redis sismember error:", err);
    }
  }
  return memoryForgotSet.get(userId)?.has(blobId) ?? false;
}

/**
 * Mark a blobId as forgotten.
 */
export async function markAsForgotten(userId: string, blobId: string): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.sadd(`tusk:forgot:${userId}`, blobId);
      return;
    } catch (err) {
      console.error("Redis sadd error:", err);
    }
  }
  if (!memoryForgotSet.has(userId)) {
    memoryForgotSet.set(userId, new Set());
  }
  memoryForgotSet.get(userId)!.add(blobId);
}

/**
 * Store metadata for a remembered Walrus blob.
 */
export async function setMemoryMetadata(
  userId: string,
  blobId: string,
  meta: MemoryMetadata
): Promise<void> {
  const jsonStr = JSON.stringify(meta);
  if (redisClient) {
    try {
      await redisClient.hset(`tusk:meta:${userId}`, { [blobId]: jsonStr });
      return;
    } catch (err) {
      console.error("Redis hset error:", err);
    }
  }
  if (!memoryMetaHash.has(userId)) {
    memoryMetaHash.set(userId, new Map());
  }
  memoryMetaHash.get(userId)!.set(blobId, jsonStr);
}

/**
 * Retrieve metadata for a remembered Walrus blob.
 */
export async function getMemoryMetadata(
  userId: string,
  blobId: string
): Promise<MemoryMetadata | null> {
  if (redisClient) {
    try {
      const val = (await redisClient.hget(`tusk:meta:${userId}`, blobId)) as string | null;
      if (val) return typeof val === "string" ? JSON.parse(val) : val;
    } catch (err) {
      console.error("Redis hget error:", err);
    }
  }
  const raw = memoryMetaHash.get(userId)?.get(blobId);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Log a security incident to the user's security log, capped at 50 entries.
 */
export async function logSecurityIncident(
  userId: string,
  entry: SecurityLogEntry
): Promise<void> {
  const jsonStr = JSON.stringify(entry);
  if (redisClient) {
    try {
      const key = `tusk:seclog:${userId}`;
      await redisClient.lpush(key, jsonStr);
      await redisClient.ltrim(key, 0, 49);
      return;
    } catch (err) {
      console.error("Redis lpush error:", err);
    }
  }
  if (!memorySecLogList.has(userId)) {
    memorySecLogList.set(userId, []);
  }
  const list = memorySecLogList.get(userId)!;
  list.unshift(jsonStr);
  if (list.length > 50) {
    list.pop();
  }
}

/**
 * Fetch the latest 50 security log entries for the user.
 */
export async function getSecurityLog(userId: string): Promise<SecurityLogEntry[]> {
  if (redisClient) {
    try {
      const list = (await redisClient.lrange(`tusk:seclog:${userId}`, 0, 49)) as string[];
      return list.map((item) => (typeof item === "string" ? JSON.parse(item) : item));
    } catch (err) {
      console.error("Redis lrange error:", err);
    }
  }
  const rawList = memorySecLogList.get(userId) || [];
  return rawList.map((item: string) => JSON.parse(item));
}
