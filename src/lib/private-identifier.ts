import "server-only";

import { createHash } from "node:crypto";

function hashParts(parts: string[]) {
  const salt = process.env.GUARDAI_LIMIT_SALT;
  if (!salt) return null;

  return createHash("sha256")
    .update([salt, ...parts].join("\u0000"))
    .digest("hex")
    .slice(0, 32);
}

export function requestFingerprint(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return hashParts(["request", ip, userAgent]);
}

export function learnerFingerprint(classCode: string, learnerId: string) {
  return hashParts(["learner", classCode, learnerId]);
}
