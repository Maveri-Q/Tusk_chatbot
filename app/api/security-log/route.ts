import { NextRequest, NextResponse } from "next/server";
import { getSecurityLog } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const userId = "user_default";
    const log = await getSecurityLog(userId);
    return NextResponse.json({ log });
  } catch (err: any) {
    console.error("Fetch security log error:", err);
    return NextResponse.json({ log: [], error: err.message }, { status: 500 });
  }
}
