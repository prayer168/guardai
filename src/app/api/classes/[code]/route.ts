import { classroomCodeSchema } from "@/lib/classroom";
import { getClassroom } from "@/lib/classroom-store";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await params;
  const parsedCode = classroomCodeSchema.safeParse(rawCode);
  if (!parsedCode.success) {
    return Response.json({ error: "班級代碼格式不正確。" }, { status: 400, headers: responseHeaders });
  }

  try {
    const data = await getClassroom(parsedCode.data);
    if (!data) {
      return Response.json({ error: "找不到班級，代碼可能已過期。" }, { status: 404, headers: responseHeaders });
    }
    return Response.json(data, { headers: responseHeaders });
  } catch {
    return Response.json(
      { error: "匿名班級服務暫時無法使用。" },
      { status: 503, headers: responseHeaders },
    );
  }
}
