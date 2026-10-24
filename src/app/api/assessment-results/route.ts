import assessmentQuestionData from "@/data/assessment-questions.json";
import { assessmentDaysSchema, publicAssessmentSubmissionSchema, publicAssessmentWithdrawalSchema } from "@/lib/assessment-results";
import {
  consumeAnonymousAssessmentLimit,
  deleteAnonymousAssessment,
  getAnonymousAssessmentAggregate,
  saveAnonymousAssessment,
} from "@/lib/assessment-results-store";

export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(request: Request) {
  const rawDays = new URL(request.url).searchParams.get("days") ?? "30";
  const parsedDays = assessmentDaysSchema.safeParse(rawDays);
  if (!parsedDays.success) {
    return Response.json({ error: "日期範圍只支援最近 7 或 30 天。" }, { status: 400, headers: responseHeaders });
  }

  try {
    const aggregate = await getAnonymousAssessmentAggregate(parsedDays.data as 7 | 30);
    return Response.json(aggregate, { headers: responseHeaders });
  } catch {
    return Response.json({ error: "匿名評量統計暫時無法使用。" }, { status: 503, headers: responseHeaders });
  }
}

export async function POST(request: Request) {
  try {
    const limit = await consumeAnonymousAssessmentLimit(request, "submit");
    if (!limit.allowed) {
      return Response.json(
        { error: "提交次數過多，請稍後再試。" },
        { status: 429, headers: { ...responseHeaders, "Retry-After": "3600" } },
      );
    }

    const payload = await request.json().catch(() => null);
    const parsed = publicAssessmentSubmissionSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ error: "匿名評量資料格式不正確。" }, { status: 400, headers: responseHeaders });
    }

    const questions = assessmentQuestionData[parsed.data.kind];
    const validConcepts = new Set(questions.map((question) => question.concept));
    const conceptsAreValid = parsed.data.missedConcepts.every((concept) => validConcepts.has(concept));
    const conceptsAreUnique = new Set(parsed.data.missedConcepts).size === parsed.data.missedConcepts.length;
    if (!conceptsAreValid || !conceptsAreUnique || parsed.data.score !== 100 - parsed.data.missedConcepts.length * 20) {
      return Response.json({ error: "匿名評量分數或概念彙總格式不正確。" }, { status: 400, headers: responseHeaders });
    }

    const stage = {
      score: parsed.data.score,
      missedConcepts: parsed.data.missedConcepts,
      submittedAt: new Date().toISOString(),
    };
    await saveAnonymousAssessment(parsed.data.learnerId, parsed.data.kind, stage);
    return Response.json({ saved: true, score: stage.score, kind: parsed.data.kind, retentionDays: 30 }, { status: 201, headers: responseHeaders });
  } catch {
    return Response.json({ error: "匿名結果暫時無法儲存，請稍後再試。" }, { status: 503, headers: responseHeaders });
  }
}

export async function DELETE(request: Request) {
  try {
    const limit = await consumeAnonymousAssessmentLimit(request, "withdraw");
    if (!limit.allowed) {
      return Response.json(
        { error: "操作次數過多，請稍後再試。" },
        { status: 429, headers: { ...responseHeaders, "Retry-After": "3600" } },
      );
    }

    const payload = await request.json().catch(() => null);
    const parsed = publicAssessmentWithdrawalSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ error: "匿名識別資料格式不正確。" }, { status: 400, headers: responseHeaders });
    }
    await deleteAnonymousAssessment(parsed.data.learnerId);
    return Response.json({ deleted: true }, { headers: responseHeaders });
  } catch {
    return Response.json({ error: "匿名資料暫時無法刪除，請稍後再試。" }, { status: 503, headers: responseHeaders });
  }
}
