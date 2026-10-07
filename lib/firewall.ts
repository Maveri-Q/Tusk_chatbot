import { logSecurityIncident, SecurityLogEntry } from "./redis";

// Known injection pattern heuristics
const INJECTION_PATTERNS = [
  /ignore\s+(all|any|previous|prior)\s+(instructions|rules|prompts)/i,
  /system\s+prompt/i,
  /you\s+are\s+now/i,
  /\bact\s+as\b/i,
  /developer\s+mode/i,
  /\bdisregard\b/i,
  /from\s+now\s+on\s+you/i,
  /reveal\s+(your|the)\s+(system|prompt|rules)/i,
  /system\s*:/i,
  /assistant\s*:/i,
  /<script[\s>]/i,
];

// Secret patterns (private keys, API keys, seed phrases)
const SECRET_PATTERNS = [
  /\b0x[a-fA-F0-9]{64}\b/, // 64-hex private key with 0x
  /\b[a-fA-F0-9]{64}\b/,   // 64-hex raw private key
  /\b(sk-[a-zA-Z0-9_-]{20,})\b/, // OpenAI-style API key
  /\b(AIza[a-zA-Z0-9_-]{35})\b/, // Google API key
  /\b(?:[a-z]{3,8}\s+){11,23}[a-z]{3,8}\b/i, // 12 or 24 word mnemonic seed
];

// Dangerous execution or executable download patterns
const EXEC_PATTERNS = [
  /\b(curl|wget|powershell|bash|rm -rf|chmod \+x)\b/i,
  /\b(visit|download|execute)\s+https?:\/\//i,
];

/**
 * Sanitizes plain text by removing control and zero-width characters and normalizing whitespace.
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

export interface FirewallCheckResult {
  allowed: boolean;
  reason?: string;
  sanitizedText: string;
}

/**
 * Write-side firewall screening before saving to Walrus Memory.
 */
export async function screenWriteFact(
  userId: string,
  factText: string
): Promise<FirewallCheckResult> {
  const sanitized = sanitizeText(factText);

  // Check injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      const reason = `Blocked prompt injection pattern: ${pattern.source}`;
      await logSecurityIncident(userId, {
        ts: new Date().toISOString(),
        snippet: sanitized.slice(0, 80),
        reason,
        layer: "write",
      });
      return { allowed: false, reason, sanitizedText: sanitized };
    }
  }

  // Check secret patterns
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(sanitized)) {
      const reason = "Blocked sensitive secret (private key, seed phrase, or API token)";
      await logSecurityIncident(userId, {
        ts: new Date().toISOString(),
        snippet: sanitized.slice(0, 80),
        reason,
        layer: "write",
      });
      return { allowed: false, reason, sanitizedText: sanitized };
    }
  }

  // Check command execution patterns
  for (const pattern of EXEC_PATTERNS) {
    if (pattern.test(sanitized)) {
      const reason = "Blocked code execution or suspicious URL pattern";
      await logSecurityIncident(userId, {
        ts: new Date().toISOString(),
        snippet: sanitized.slice(0, 80),
        reason,
        layer: "write",
      });
      return { allowed: false, reason, sanitizedText: sanitized };
    }
  }

  return { allowed: true, sanitizedText: sanitized };
}

/**
 * Read-side firewall screening after recall from Walrus Memory.
 */
export async function screenReadMemory(
  userId: string,
  memoryText: string
): Promise<FirewallCheckResult> {
  const sanitized = sanitizeText(memoryText);

  // Defense in depth: Check injection patterns again
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      const reason = `Read-side dropped memory matching injection pattern: ${pattern.source}`;
      await logSecurityIncident(userId, {
        ts: new Date().toISOString(),
        snippet: sanitized.slice(0, 80),
        reason,
        layer: "read",
      });
      return { allowed: false, reason, sanitizedText: sanitized };
    }
  }

  return { allowed: true, sanitizedText: sanitized };
}
