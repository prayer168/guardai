import { z } from "zod";

export const publicAssessmentSubmissionSchema = z.object({
  learnerId: z.string().uuid(),
  kind: z.enum(["pre", "post"]),
  score: z.number().int().min(0).max(100).refine((score) => score % 20 === 0),
  missedConcepts: z.array(z.enum(["先停下來", "看清線索", "獨立查證", "保護驗證碼", "查證 AI 判讀"])).max(5),
  consent: z.literal(true),
}).strict();

export const publicAssessmentWithdrawalSchema = z.object({
  learnerId: z.string().uuid(),
}).strict();

export const assessmentDaysSchema = z.enum(["7", "30"]).transform(Number);

export type PublicAssessmentSubmission = z.infer<typeof publicAssessmentSubmissionSchema>;

export type AnonymousAssessmentStage = {
  score: number;
  missedConcepts: string[];
  submittedAt: string;
};

export type AnonymousAssessmentProfile = {
  pre?: AnonymousAssessmentStage;
  post?: AnonymousAssessmentStage;
};

type StageAggregate = {
  submissions: number | null;
  averageScore: number | null;
  missedConcepts: { concept: string; count: number }[];
};

export type PublicAssessmentAggregate = {
  periodDays: number;
  retentionDays: number;
  participantCount: number | null;
  minimumSampleSize: number;
  pre: StageAggregate;
  post: StageAggregate;
  paired: { submissions: number | null; averageChange: number | null };
};

const minimumSampleSize = 5;

function average(values: number[]) {
  if (values.length === 0) return null;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function aggregateStage(stages: AnonymousAssessmentStage[]): StageAggregate {
  const enoughData = stages.length >= minimumSampleSize;
  const concepts = new Map<string, number>();
  for (const stage of stages) {
    for (const concept of stage.missedConcepts) concepts.set(concept, (concepts.get(concept) ?? 0) + 1);
  }

  return {
    submissions: enoughData ? stages.length : null,
    averageScore: enoughData ? average(stages.map((stage) => stage.score)) : null,
    missedConcepts: enoughData
      ? [...concepts.entries()]
        .filter(([, count]) => count >= minimumSampleSize)
        .map(([concept, count]) => ({ concept, count }))
        .sort((left, right) => right.count - left.count || left.concept.localeCompare(right.concept, "zh-Hant"))
      : [],
  };
}

export function aggregatePublicAssessmentResults(
  profiles: AnonymousAssessmentProfile[],
  periodDays: number,
  now = Date.now(),
): PublicAssessmentAggregate {
  const cutoff = now - periodDays * 24 * 60 * 60 * 1_000;
  const recentPre = profiles.flatMap((profile) => profile.pre && Date.parse(profile.pre.submittedAt) >= cutoff ? [profile.pre] : []);
  const recentPost = profiles.flatMap((profile) => profile.post && Date.parse(profile.post.submittedAt) >= cutoff ? [profile.post] : []);
  const paired = profiles.flatMap((profile) =>
    profile.pre && profile.post && Date.parse(profile.pre.submittedAt) >= cutoff && Date.parse(profile.post.submittedAt) >= cutoff
      ? [{ pre: profile.pre, post: profile.post }]
      : [],
  );
  const enoughParticipants = profiles.filter((profile) =>
    (profile.pre && Date.parse(profile.pre.submittedAt) >= cutoff) ||
    (profile.post && Date.parse(profile.post.submittedAt) >= cutoff),
  ).length >= minimumSampleSize;
  const enoughPairs = paired.length >= minimumSampleSize;

  return {
    periodDays,
    retentionDays: 30,
    participantCount: enoughParticipants
      ? profiles.filter((profile) =>
        (profile.pre && Date.parse(profile.pre.submittedAt) >= cutoff) ||
        (profile.post && Date.parse(profile.post.submittedAt) >= cutoff),
      ).length
      : null,
    minimumSampleSize,
    pre: aggregateStage(recentPre),
    post: aggregateStage(recentPost),
    paired: {
      submissions: enoughPairs ? paired.length : null,
      averageChange: enoughPairs
        ? average(paired.map(({ pre, post }) => post.score - pre.score))
        : null,
    },
  };
}
