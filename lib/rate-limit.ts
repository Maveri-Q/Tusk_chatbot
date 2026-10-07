import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hasUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

let ratelimitInstance: Ratelimit | null = null;

if (hasUpstash) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  ratelimitInstance = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 messages per minute
    prefix: "tusk:rl",
    analytics: false,
  });
}

// In-memory sliding window fallback
interface WindowRecord {
  count: number;
  resetAt: number;
}
const localLimits = new Map<string, WindowRecord>();

export async function checkRateLimit(
  identifier: string
): Promise<{ success: boolean; remaining: number }> {
  if (ratelimitInstance) {
    try {
      const res = await ratelimitInstance.limit(identifier);
      return { success: res.success, remaining: res.remaining };
    } catch (err) {
      console.error("Upstash rate limit check error:", err);
    }
  }

  // Fallback: 20 requests per minute
  const now = Date.now();
  const windowMs = 60 * 1000;
  const record = localLimits.get(identifier);

  if (!record || now > record.resetAt) {
    localLimits.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: 19 };
  }

  if (record.count >= 20) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: 20 - record.count };
}
