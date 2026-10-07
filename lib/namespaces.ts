/**
 * Tusk Namespace Builder
 *
 * Rules:
 * - Server decides who the user is. Never trust a user id or namespace sent from the client.
 * - Namespaces are strictly isolated:
 *     Personal: u_<sanitized_userId>
 *     Room: room_<sanitized_code>
 */

/**
 * Sanitizes an ID to only contain valid namespace characters [a-z0-9_].
 */
export function sanitizeNamespaceToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 48);
}

/**
 * Build personal namespace for an authenticated user.
 */
export function getPersonalNamespace(userId: string): string {
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid userId provided for namespace derivation");
  }
  return `u_${sanitizeNamespaceToken(userId)}`;
}

/**
 * Build room namespace for a multi-user shared room.
 */
export function getRoomNamespace(roomCode: string): string {
  if (!roomCode || typeof roomCode !== "string") {
    throw new Error("Invalid roomCode provided for namespace derivation");
  }
  return `room_${sanitizeNamespaceToken(roomCode)}`;
}
