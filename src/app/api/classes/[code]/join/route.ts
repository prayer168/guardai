import { classroomCodeSchema, classroomJoinSchema } from "@/lib/classroom";
import { consumeClassroomActionLimit, joinClassroom } from "@/lib/classroom-store";

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
    const limit = await consumeClassroomActionLimit(request, "join", 30, 60);
    if (!limit.allowed) {
      return Response.json(
        { error: "加入次數過多，請稍候一分鐘再試。" },
        { status: 429, headers: { ...responseHeaders, "Retry-After": "60" } },
      );
    }

    const payload = await request.json().catch(() => null);
    const parsed = classroomJoinSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ error: "匿名裝置識別格式不正確。" }, { status: 400, headers: responseHeaders });
    }

    const classroom = await joinClassroom(parsedCode.data, parsed.data.learnerId);
    if (!classroom) {
      return Response.json({ error: "找不到班級，代碼可能已過期。" }, { status: 404, headers: responseHeaders });
    }
    return Response.json({ classroom }, { headers: responseHeaders });
  } catch {
    return Response.json(
      { error: "匿名班級服務暫時無法使用。" },
      { status: 503, headers: responseHeaders },
    );
  }
}
