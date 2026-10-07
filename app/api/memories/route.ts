import { NextRequest, NextResponse } from "next/server";
import { recallMemoriesSafely } from "@/lib/memwal";
import { getPersonalNamespace } from "@/lib/namespaces";
import { isForgotten, getMemoryMetadata } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const userId = "user_default";
    const namespace = getPersonalNamespace(userId);

    // Broad recall to enumerate memories for the panel
    const broadResult = await recallMemoriesSafely("facts about the user preferences and identity", namespace, 50, 0.95);

    const activeMemories = [];
    for (const item of broadResult) {
      const forgotten = await isForgotten(userId, item.blob_id);
      if (forgotten) continue;

      const meta = await getMemoryMetadata(userId, item.blob_id);
      activeMemories.push({
        blob_id: item.blob_id,
        text: item.text,
        category: meta?.category || "identity",
        createdAt: meta?.createdAt ? new Date(meta.createdAt).toLocaleDateString() : "Active",
        relevance: item.relevance,
        status: "saved",
      });
    }

    return NextResponse.json({ memories: activeMemories });
  } catch (err: any) {
    console.error("Fetch memories error:", err);
    return NextResponse.json({ memories: [], error: err.message }, { status: 500 });
  }
}
