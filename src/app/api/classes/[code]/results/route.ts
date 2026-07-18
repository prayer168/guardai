import { classroomCodeSchema, classroomResultSchema } from "@/lib/classroom";
import { consumeClassroomActionLimit, submitClassroomResult } from "@/lib/classroom-store";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await params;
  const parsedCode = classroomCodeSchema.safeParse(rawCode);
  if (!parsedCode.success) {
    return Response.json({ error: "班級代碼格式不正確。" }, { status: 400, headers: responseHeaders });
  }

  try {
    const limit = await consumeClassroomActionLimit(request, "submit", 10, 60);
    if (!limit.allowed) {
      return Response.json(
        { error: "提交次數過多，請稍候一分鐘再試。" },
        { status: 429, headers: { ...responseHeaders, "Retry-After": "60" } },
      );
    }

    const payload = await request.json().catch(() => null);
    const parsed = classroomResultSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ error: "學習成果格式不正確。" }, { status: 400, headers: responseHeaders });
    }

    const result = await submitClassroomResult(parsedCode.data, parsed.data);
    if (!result) {
      return Response.json({ error: "找不到班級，代碼可能已過期。" }, { status: 404, headers: responseHeaders });
    }
    return Response.json({ saved: true, submittedAt: result.submittedAt }, { headers: responseHeaders });
  } catch {
    return Response.json(
      { error: "匿名成果暫時無法提交，請稍後再試。" },
      { status: 503, headers: responseHeaders },
    );
  }
}
