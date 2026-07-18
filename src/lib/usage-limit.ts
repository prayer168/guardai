import "server-only";

import { hasUsageStoreConfig } from "@/lib/ai-config";
import { requestFingerprint } from "@/lib/private-identifier";
import { getRedis } from "@/lib/redis";

type UsageLimits = {
  globalDailyLimit: number;
  visitorDailyLimit: number;
};

export type UsageQuota = {
  protected: boolean;
  allowed: boolean;
  remaining: number;
  resetAt: string;
  reason?: "store_unavailable" | "global_daily_limit" | "visitor_daily_limit";
};

function taipeiDayWindow(now = new Date()) {
  const offsetMs = 8 * 60 * 60 * 1000;
  const taipei = new Date(now.getTime() + offsetMs);
  const day = taipei.toISOString().slice(0, 10);
  const resetMs = Date.UTC(
    taipei.getUTCFullYear(),
    taipei.getUTCMonth(),
    taipei.getUTCDate() + 1,
  ) - offsetMs;
  const ttlSeconds = Math.max(60, Math.ceil((resetMs - now.getTime()) / 1000) + 60);
  return { day, resetAt: new Date(resetMs).toISOString(), ttlSeconds };
}

const incrementScript = `
local global_count = redis.call("INCR", KEYS[1])
if global_count == 1 then redis.call("EXPIRE", KEYS[1], ARGV[1]) end
local visitor_count = redis.call("INCR", KEYS[2])
if visitor_count == 1 then redis.call("EXPIRE", KEYS[2], ARGV[1]) end
return { global_count, visitor_count }
`;

export async function consumeDailyQuota(request: Request, limits: UsageLimits): Promise<UsageQuota> {
  const { day, resetAt, ttlSeconds } = taipeiDayWindow();
  const client = getRedis();

  const visitor = requestFingerprint(request);
  if (!client || !visitor || !hasUsageStoreConfig()) {
    return { protected: false, allowed: false, remaining: 0, resetAt, reason: "store_unavailable" };
  }

  const [globalCount, visitorCount] = await client.eval<[number], [number, number]>(
    incrementScript,
    [`guardai:ai:global:${day}`, `guardai:ai:visitor:${day}:${visitor}`],
    [ttlSeconds],
  );

  const globalRemaining = Math.max(0, limits.globalDailyLimit - Number(globalCount));
  const visitorRemaining = Math.max(0, limits.visitorDailyLimit - Number(visitorCount));
  const remaining = Math.min(globalRemaining, visitorRemaining);

  if (Number(globalCount) > limits.globalDailyLimit) {
    return { protected: true, allowed: false, remaining, resetAt, reason: "global_daily_limit" };
  }
  if (Number(visitorCount) > limits.visitorDailyLimit) {
    return { protected: true, allowed: false, remaining, resetAt, reason: "visitor_daily_limit" };
  }

  return { protected: true, allowed: true, remaining, resetAt };
}
