import { NextRequest, NextResponse } from "next/server";
import { markAsForgotten } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { blobId, userId = "user_default" } = await req.json();

    if (!blobId || typeof blobId !== "string") {
      return NextResponse.json({ error: "Missing or invalid blobId" }, { status: 400 });
    }

    await markAsForgotten(userId, blobId);

    return NextResponse.json({
      success: true,
      message: "Hidden from Tusk. The encrypted data stays on Walrus until it expires.",
    });
  } catch (err: any) {
    console.error("Forget memory error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
