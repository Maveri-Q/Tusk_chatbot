import { NextRequest, NextResponse } from "next/server";
import { getInstantFacts, getAllUserMemories, rememberFactSafely } from "@/lib/memwal";
import { getPersonalNamespace } from "@/lib/namespaces";
import { isForgotten, getMemoryMetadata, setMemoryMetadata } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "guest";
    const namespace = getPersonalNamespace(userId);

    // 1. Retrieve local/instant persistent facts (most recent requests and facts first)
    const instantList = getInstantFacts(namespace);

    // 2. Retrieve durable Walrus facts
    const allDurable = await getAllUserMemories(namespace);

    const memoryMap = new Map<string, any>();

    // Instant facts take precedence (guarantees newly asked requests appear instantly at index 0)
    for (const item of instantList) {
      const forgotten = await isForgotten(userId, item.blob_id);
      if (forgotten) continue;

      const meta = await getMemoryMetadata(userId, item.blob_id);
      memoryMap.set(item.blob_id, {
        blob_id: item.blob_id,
        text: item.text,
        category: item.category || meta?.category || "preference",
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : (meta?.createdAt ? new Date(meta.createdAt).toLocaleDateString() : "Active"),
        relevance: 0.95,
        status: item.status || "saved",
      });
    }

    // Walrus durable items (fill in any not already in local disk)
    for (const item of allDurable) {
      const forgotten = await isForgotten(userId, item.blob_id);
      if (forgotten) continue;

      if (!memoryMap.has(item.blob_id)) {
        const meta = await getMemoryMetadata(userId, item.blob_id);
        memoryMap.set(item.blob_id, {
          blob_id: item.blob_id,
          text: item.text,
          category: item.category || meta?.category || "identity",
          createdAt: meta?.createdAt ? new Date(meta.createdAt).toLocaleDateString() : "Active",
          relevance: item.relevance,
          status: item.status || "saved",
        });
      }
    }

    const activeMemories = Array.from(memoryMap.values());

    return NextResponse.json(
      { memories: activeMemories },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (err: any) {
    console.error("Fetch memories error:", err);
    return NextResponse.json(
      { memories: [], error: err.message },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, userId, category } = body;
    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }
    const uid = userId || "guest";
    const namespace = getPersonalNamespace(uid);
    const cat = category || "preference";

    const saveRes = await rememberFactSafely(text.trim(), namespace, cat);
    if (saveRes.success && saveRes.blob_id) {
      await setMemoryMetadata(uid, saveRes.blob_id, {
        category: cat,
        createdAt: new Date().toISOString(),
        scope: "personal",
        jobId: saveRes.job_id,
      });
    }

    return NextResponse.json(
      {
        success: true,
        blob_id: saveRes.blob_id,
        memory: {
          blob_id: saveRes.blob_id,
          text: text.trim(),
          category: cat,
          createdAt: new Date().toLocaleDateString(),
          status: "saved",
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("Create memory error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
