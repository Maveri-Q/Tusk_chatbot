import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const hasUpstash =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// In-memory fallback if Redis is not configured
const globalStore = globalThis as unknown as {
  userSessionsMap?: Map<string, string>;
};
const userSessionsMap =
  globalStore.userSessionsMap || (globalStore.userSessionsMap = new Map());

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ sessions: [] });
    }

    // 1. Try Redis
    if (redis) {
      try {
        const raw = await redis.get(`tusk:sessions:${userId}`);
        if (raw) {
          const sessions = typeof raw === "string" ? JSON.parse(raw) : raw;
          return NextResponse.json({ sessions });
        }
      } catch (e) {
        console.error("Redis get sessions error:", e);
      }
    }

    // 2. Try in-memory fallback
    const memRaw = userSessionsMap.get(userId);
    if (memRaw) {
      return NextResponse.json({ sessions: JSON.parse(memRaw) });
    }

    return NextResponse.json({ sessions: [] });
  } catch (err: any) {
    console.error("Failed to get sessions:", err);
    return NextResponse.json({ sessions: [], error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, sessions } = await req.json();

    if (!userId || !Array.isArray(sessions)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const jsonStr = JSON.stringify(sessions);

    // 1. Save to in-memory fallback
    userSessionsMap.set(userId, jsonStr);

    // 2. Save to Redis for cross-device persistence
    if (redis) {
      try {
        await redis.set(`tusk:sessions:${userId}`, jsonStr);
      } catch (e) {
        console.error("Redis save sessions error:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to save sessions:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
