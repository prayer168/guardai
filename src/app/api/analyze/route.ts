import { inputSchema } from "@/lib/analysis";
import { maskSensitiveData } from "@/lib/mask-sensitive";
import { createMockAnalysis } from "@/lib/mock-analysis";
import { createOpenAiAnalysis } from "@/lib/openai-analysis";

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
  let mode: "live" | "mock" = "mock";
  let notice = "目前使用離線 Demo 分析；所有示範流程仍可完整操作。";
  let result = createMockAnalysis(masked, sensitiveDataDetected);

  if (process.env.OPENAI_API_KEY) {
    try {
      result = await createOpenAiAnalysis(masked);
      result.sensitiveDataDetected ||= sensitiveDataDetected;
      mode = "live";
      notice = "已使用伺服器端 GuardAI 分析引擎完成判讀。";
    } catch {
      notice = "即時分析暫時無法使用，已安全切換至離線 Demo 分析。";
    }
  }

  return Response.json(
    { result, mode, maskedMessage: masked, notice },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
