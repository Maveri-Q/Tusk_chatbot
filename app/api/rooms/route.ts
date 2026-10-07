import { NextRequest, NextResponse } from "next/server";
import { getRoomNamespace } from "@/lib/namespaces";

// Fallback in-memory room storage
const globalForRooms = globalThis as unknown as {
  roomsMap?: Map<string, { code: string; name: string; createdBy: string; members: Set<string> }>;
  userRoomsMap?: Map<string, Set<string>>;
};

const roomsMap =
  globalForRooms.roomsMap || (globalForRooms.roomsMap = new Map());
const userRoomsMap =
  globalForRooms.userRoomsMap || (globalForRooms.userRoomsMap = new Map());

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "user_default";

    const roomCodes = userRoomsMap.get(userId) || new Set();
    const rooms = Array.from(roomCodes)
      .map((code) => {
        const room = roomsMap.get(code);
        return room
          ? {
              code: room.code,
              name: room.name,
              memberCount: room.members.size,
              namespace: getRoomNamespace(room.code),
            }
          : null;
      })
      .filter(Boolean);

    return NextResponse.json({ rooms });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, name, code, userId = "user_default" } = await req.json();

    if (action === "create") {
      const roomCode = generateRoomCode();
      const room = {
        code: roomCode,
        name: name || `Room ${roomCode}`,
        createdBy: userId,
        members: new Set([userId]),
      };

      roomsMap.set(roomCode, room);

      if (!userRoomsMap.has(userId)) {
        userRoomsMap.set(userId, new Set());
      }
      userRoomsMap.get(userId)!.add(roomCode);

      return NextResponse.json({
        success: true,
        room: {
          code: room.code,
          name: room.name,
          namespace: getRoomNamespace(room.code),
        },
      });
    }

    if (action === "join") {
      const cleanCode = (code || "").toUpperCase().trim();
      const room = roomsMap.get(cleanCode);

      if (!room) {
        return NextResponse.json(
          { error: "Room not found. Check the 6-character code." },
          { status: 404 }
        );
      }

      room.members.add(userId);

      if (!userRoomsMap.has(userId)) {
        userRoomsMap.set(userId, new Set());
      }
      userRoomsMap.get(userId)!.add(cleanCode);

      return NextResponse.json({
        success: true,
        room: {
          code: room.code,
          name: room.name,
          namespace: getRoomNamespace(room.code),
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
