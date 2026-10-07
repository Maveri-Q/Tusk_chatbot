import { NextResponse } from "next/server";
import { getMemWalClient } from "@/lib/memwal";

export async function GET() {
  try {
    const client = getMemWalClient();
    if (!client) {
      return NextResponse.json(
        { status: "unconfigured", network: "mainnet", message: "Client credentials not configured" },
        { status: 503 }
      );
    }

    const health = await client.health();
    return NextResponse.json({
      status: "ok",
      network: "mainnet",
      relayer: health,
    });
  } catch (err: any) {
    console.error("Health check error:", err);
    return NextResponse.json(
      { status: "down", network: "mainnet", error: err.message },
      { status: 503 }
    );
  }
}
