import { NextRequest, NextResponse } from "next/server";
import { recallMemoriesSafely, getInstantFacts, getAllUserMemories, rememberFactSafely } from "@/lib/memwal";
import { getPersonalNamespace } from "@/lib/namespaces";
import { isForgotten, getMemoryMetadata, setMemoryMetadata } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "user_default";
    const namespace = getPersonalNamespace(userId);

    // 1. Get all durable memories for this user
    const allDurable = await getAllUserMemories(namespace);

    // 2. Also retrieve instant local facts for this user
    const instantList = getInstantFacts(namespace);

    const memoryMap = new Map<string, any>();

    // Add durable Walrus and disk results
    for (const item of allDurable) {
      const forgotten = await isForgotten(userId, item.blob_id);
      if (forgotten) continue;

      const meta = await getMemoryMetadata(userId, item.blob_id);
      memoryMap.set(item.blob_id, {
        blob_id: item.blob_id,
        text: item.text,
        category: meta?.category || "identity",
        createdAt: meta?.createdAt ? new Date(meta.createdAt).toLocaleDateString() : "Active",
        relevance: item.relevance,
        status: item.status || "saved",
      });
    }

    // Add instant facts (which may still be indexing on Walrus)
    for (const item of instantList) {
      const forgotten = await isForgotten(userId, item.blob_id);
      if (forgotten) continue;

      if (!memoryMap.has(item.blob_id)) {
        const meta = await getMemoryMetadata(userId, item.blob_id);
        memoryMap.set(item.blob_id, {
          blob_id: item.blob_id,
          text: item.text,
          category: meta?.category || "preference",
          createdAt: new Date(item.createdAt).toLocaleDateString(),
          relevance: 0.95,
          status: item.status,
        });
      }
    }

    const activeMemories = Array.from(memoryMap.values());

    return NextResponse.json({ memories: activeMemories });
  } catch (err: any) {
    console.error("Fetch memories error:", err);
    return NextResponse.json({ memories: [], error: err.message }, { status: 500 });
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

    const saveRes = await rememberFactSafely(text.trim(), namespace);
    if (saveRes.success && saveRes.blob_id) {
      await setMemoryMetadata(uid, saveRes.blob_id, {
        category: category || "preference",
        createdAt: new Date().toISOString(),
        scope: "personal",
        jobId: saveRes.job_id,
      });
    }

    return NextResponse.json({
      success: true,
      blob_id: saveRes.blob_id,
      memory: {
        blob_id: saveRes.blob_id,
        text: text.trim(),
        category: category || "preference",
        createdAt: new Date().toLocaleDateString(),
        status: "saved",
      },
    });
  } catch (err: any) {
    console.error("Create memory error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
