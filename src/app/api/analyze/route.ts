import { inputSchema } from "@/lib/analysis";
import { getAiRuntimeConfig } from "@/lib/ai-config";
import { maskSensitiveData } from "@/lib/mask-sensitive";
import { createMockAnalysis } from "@/lib/mock-analysis";
import { createOpenAiAnalysis } from "@/lib/openai-analysis";
import { consumeDailyQuota, type UsageQuota } from "@/lib/usage-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "無法讀取訊息內容。" }, { status: 400 });
  }

  const parsed = inputSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "輸入內容不符合格式。" },
      { status: 400 },
    );
  }

  const { masked, sensitiveDataDetected } = maskSensitiveData(parsed.data.message);
  const config = getAiRuntimeConfig();
  let mode: "live" | "mock" = "mock";
  let notice = "目前使用離線 Demo 分析；所有示範流程仍可完整操作。";
  let result = createMockAnalysis(masked, sensitiveDataDetected);
  let usage: UsageQuota | undefined;

  if (config.mode === "live") {
    if (!process.env.OPENAI_API_KEY) {
      notice = "即時 AI 尚未完成伺服器設定，已安全切換至離線 Demo 分析。";
    } else {
      try {
        usage = await consumeDailyQuota(request, config);
        if (!usage.allowed) {
          notice = usage.reason === "store_unavailable"
            ? "即時 AI 的用量保護暫時無法確認，為避免非預期費用，已切換至離線 Demo。"
            : "今日即時 AI 使用額度已達上限，已切換至離線 Demo；查證學習仍可完整進行。";
        } else {
          result = await createOpenAiAnalysis(masked);
          result.sensitiveDataDetected ||= sensitiveDataDetected;
          mode = "live";
          notice = "已使用伺服器端 GuardAI 生成式 AI 完成判讀。";
        }
      } catch {
        notice = "即時分析暫時無法使用，已安全切換至離線 Demo 分析。";
      }
    }
  }

  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-GuardAI-Mode": mode,
  };
  if (usage) {
    headers["X-GuardAI-Quota-Remaining"] = String(usage.remaining);
    headers["X-GuardAI-Quota-Reset"] = usage.resetAt;
  }

  return Response.json(
    { result, mode, maskedMessage: masked, notice, usage },
    { headers },
  );
}
