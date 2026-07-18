import { createClassroomSchema } from "@/lib/classroom";
import { consumeClassroomActionLimit, createClassroom } from "@/lib/classroom-store";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function POST(request: Request) {
  try {
    const limit = await consumeClassroomActionLimit(request, "create", 5, 60 * 60);
    if (!limit.allowed) {
      return Response.json(
        { error: "建立次數過多，請稍候一小時再試。" },
        { status: 429, headers: { ...responseHeaders, "Retry-After": "3600" } },
      );
    }

    const payload = await request.json().catch(() => null);
    const parsed = createClassroomSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ error: "請選擇有效的情境包。" }, { status: 400, headers: responseHeaders });
    }

    const classroom = await createClassroom(parsed.data.pack);
    return Response.json({ classroom }, { status: 201, headers: responseHeaders });
  } catch {
    return Response.json(
      { error: "匿名班級服務暫時無法使用，請稍後再試。" },
      { status: 503, headers: responseHeaders },
    );
  }
}
