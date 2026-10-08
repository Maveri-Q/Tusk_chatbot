import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

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

function getSessionsFilePaths(userId: string): { primary: string; fallback: string } {
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const primaryDir = path.join(process.cwd(), ".data", "sessions");
  const fallbackDir = path.join(os.tmpdir(), "tusk_data", "sessions");
  return {
    primary: path.join(primaryDir, `${safeId}.json`),
    fallback: path.join(fallbackDir, `${safeId}.json`),
  };
}

export function readDiskSessions(userId: string): any[] {
  const { primary, fallback } = getSessionsFilePaths(userId);
  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ primary)) {
      const data = JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ primary, "utf8"));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (_) {}
  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ fallback)) {
      const data = JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ fallback, "utf8"));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (_) {}
  return [];
}

export function writeDiskSessions(userId: string, sessions: any[]): void {
  const { primary, fallback } = getSessionsFilePaths(userId);
  const jsonStr = JSON.stringify(sessions, null, 2);
  try {
    const primaryDir = path.dirname(primary);
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    fs.writeFileSync(primary, jsonStr, "utf8");
  } catch (_) {}
  try {
    const fallbackDir = path.dirname(fallback);
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    fs.writeFileSync(fallback, jsonStr, "utf8");
  } catch (_) {}
}

export async function getUserStoredSessions(userId: string): Promise<any[]> {
  if (!userId) return [];
  // 1. In-memory
  const memRaw = userSessionsMap.get(userId);
  if (memRaw) {
    try {
      const parsed = JSON.parse(memRaw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (_) {}
  }
  // 2. Disk
  const disk = readDiskSessions(userId);
  if (disk.length > 0) return disk;

  // 3. Redis
  if (redis) {
    try {
      const raw = await redis.get(`tusk:sessions:${userId}`);
      if (raw) {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
  }
  return [];
}

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
          if (Array.isArray(sessions) && sessions.length > 0) {
            writeDiskSessions(userId, sessions);
            return NextResponse.json({ sessions });
          }
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

    // 3. Try disk persistence
    const diskSessions = readDiskSessions(userId);
    if (diskSessions.length > 0) {
      userSessionsMap.set(userId, JSON.stringify(diskSessions));
      return NextResponse.json({ sessions: diskSessions });
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

    // 2. Save to disk persistence
    writeDiskSessions(userId, sessions);

    // 3. Save to Redis for cross-device persistence
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
