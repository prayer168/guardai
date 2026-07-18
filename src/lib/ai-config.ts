export type AiRuntimeMode = "mock" | "live";

function integerFromEnv(name: string, fallback: number, min: number, max: number) {
  const value = Number(process.env[name]);
  if (!Number.isInteger(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function getAiRuntimeConfig() {
  const mode: AiRuntimeMode = process.env.GUARDAI_AI_MODE === "live" ? "live" : "mock";

  return {
    mode,
    model: process.env.OPENAI_MODEL?.trim() || "gpt-5.6-luna",
    timeoutMs: integerFromEnv("GUARDAI_AI_TIMEOUT_MS", 20_000, 5_000, 45_000),
    globalDailyLimit: integerFromEnv("GUARDAI_DAILY_LIMIT", 200, 1, 10_000),
    visitorDailyLimit: integerFromEnv("GUARDAI_VISITOR_DAILY_LIMIT", 40, 1, 1_000),
  } as const;
}

export function hasUsageStoreConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return Boolean(url && token && process.env.GUARDAI_LIMIT_SALT);
}
