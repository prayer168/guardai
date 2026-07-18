import { z } from "zod";

export const classroomPackSchema = z.enum(["student", "family", "senior"]);
export type ClassroomPack = z.infer<typeof classroomPackSchema>;

export const classroomPackLabels: Record<ClassroomPack, string> = {
  student: "學生情境包",
  family: "親子情境包",
  senior: "長者情境包",
};

export const missedConceptSchema = z.enum([
  "保密控制",
  "更換入口",
  "停止損失",
  "避免過度警示",
  "查證能力",
]);

export const createClassroomSchema = z.object({
  pack: classroomPackSchema,
}).strict();

export const classroomCodeSchema = z.string()
  .trim()
  .toUpperCase()
  .regex(/^GUARD-[A-HJ-NP-Z2-9]{6}$/);

export const classroomJoinSchema = z.object({
  learnerId: z.string().uuid(),
}).strict();

export const classroomResultSchema = z.object({
  learnerId: z.string().uuid(),
  preScore: z.number().int().min(0).max(100),
  postScore: z.number().int().min(0).max(100),
  challengeScore: z.number().int().min(0).max(100),
  analysisCount: z.number().int().min(0).max(1_000),
  missedConcepts: z.array(missedConceptSchema).max(5),
}).strict();

export type ClassroomRecord = {
  code: string;
  pack: ClassroomPack;
  createdAt: string;
  expiresAt: string;
};

export type ClassroomSubmission = z.infer<typeof classroomResultSchema>;

export type ClassroomResult = Omit<ClassroomSubmission, "learnerId"> & {
  submittedAt: string;
};

export type ClassroomAggregate = {
  participants: number;
  completed: number;
  completionRate: number;
  preAverage: number | null;
  postAverage: number | null;
  improvementAverage: number | null;
  challengeAverage: number | null;
  analysisTotal: number;
  mostMissedConcept: string | null;
};

function average(values: number[]) {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function aggregateClassroomResults(
  participants: number,
  results: ClassroomResult[],
): ClassroomAggregate {
  const completed = results.length;
  const conceptCounts = new Map<string, number>();

  for (const result of results) {
    for (const concept of result.missedConcepts) {
      conceptCounts.set(concept, (conceptCounts.get(concept) ?? 0) + 1);
    }
  }

  const mostMissedConcept = [...conceptCounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "zh-Hant"))[0]?.[0] ?? null;
  const preAverage = average(results.map((result) => result.preScore));
  const postAverage = average(results.map((result) => result.postScore));

  return {
    participants: Math.max(participants, completed),
    completed,
    completionRate: Math.max(participants, completed)
      ? Math.round((completed / Math.max(participants, completed)) * 100)
      : 0,
    preAverage,
    postAverage,
    improvementAverage: preAverage === null || postAverage === null ? null : postAverage - preAverage,
    challengeAverage: average(results.map((result) => result.challengeScore)),
    analysisTotal: results.reduce((sum, result) => sum + result.analysisCount, 0),
    mostMissedConcept,
  };
}
