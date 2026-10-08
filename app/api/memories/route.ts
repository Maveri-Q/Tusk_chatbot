import { NextRequest, NextResponse } from "next/server";
import { recallMemoriesSafely, getInstantFacts } from "@/lib/memwal";
import { getPersonalNamespace } from "@/lib/namespaces";
import { isForgotten, getMemoryMetadata } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "user_default";
    const namespace = getPersonalNamespace(userId);

    // 1. Broad recall to enumerate memories from Walrus
    const broadResult = await recallMemoriesSafely(
      "facts about the user preferences identity goals skills projects",
      namespace,
      50,
      0.95
    );

    // 2. Also retrieve instant local facts for this user
    const instantList = getInstantFacts(namespace);

    const memoryMap = new Map<string, any>();

    // Add broad Walrus results
    for (const item of broadResult) {
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
