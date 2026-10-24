import "server-only";

import type { Redis } from "@upstash/redis";

import { aggregatePublicAssessmentResults, type AnonymousAssessmentProfile, type AnonymousAssessmentStage } from "@/lib/assessment-results";
import { learnerFingerprint, requestFingerprint } from "@/lib/private-identifier";
import { getRedis } from "@/lib/redis";

const retentionSeconds = 30 * 24 * 60 * 60;
const retentionMilliseconds = retentionSeconds * 1_000;
const environment = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
const storagePrefix = `guardai:public-assessment:${environment}`;
const activityIndexKey = `${storagePrefix}:activity`;

function stageKey(learner: string, kind: "pre" | "post") {
  return `${storagePrefix}:stage:${learner}:${kind}`;
}

function requireRedis() {
  const client = getRedis();
  if (!client) throw new Error("ASSESSMENT_STORE_UNAVAILABLE");
  return client;
}

function parseStage(value: unknown): AnonymousAssessmentStage | null {
  if (!value) return null;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) as unknown : value;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
    const stage = parsed as AnonymousAssessmentStage;
    if (typeof stage.score !== "number" || !Array.isArray(stage.missedConcepts) || typeof stage.submittedAt !== "string") return null;
    return stage;
  } catch {
    return null;
  }
}

export async function consumeAnonymousAssessmentLimit(request: Request, action: "submit" | "withdraw") {
  const client = requireRedis();
  const fingerprint = requestFingerprint(request);
  if (!fingerprint) throw new Error("ASSESSMENT_STORE_UNAVAILABLE");

  const windowSeconds = 60 * 60;
  const window = Math.floor(Date.now() / (windowSeconds * 1_000));
  const key = `guardai:public-assessment-limit:${environment}:${action}:${window}:${fingerprint}`;
  const count = await client.incr(key);
  if (count === 1) await client.expire(key, windowSeconds + 30);
  return { allowed: count <= 20 };
}

export async function saveAnonymousAssessment(
  learnerId: string,
  kind: "pre" | "post",
  stage: AnonymousAssessmentStage,
) {
  const client = requireRedis();
  const learner = learnerFingerprint("public-assessment", learnerId);
  if (!learner) throw new Error("ASSESSMENT_STORE_UNAVAILABLE");

  const now = Date.now();
  const pipeline = client.pipeline();
  pipeline.set(stageKey(learner, kind), JSON.stringify(stage), { ex: retentionSeconds });
  pipeline.zadd(activityIndexKey, { score: now, member: learner });
  pipeline.zremrangebyscore(activityIndexKey, "-inf", now - retentionMilliseconds);
  pipeline.expire(activityIndexKey, retentionSeconds);
  await pipeline.exec();
}

export async function deleteAnonymousAssessment(learnerId: string) {
  const client = requireRedis();
  const learner = learnerFingerprint("public-assessment", learnerId);
  if (!learner) throw new Error("ASSESSMENT_STORE_UNAVAILABLE");
  await client.pipeline().del(stageKey(learner, "pre"), stageKey(learner, "post")).zrem(activityIndexKey, learner).exec();
}

export async function getAnonymousAssessmentAggregate(periodDays: 7 | 30) {
  const client: Redis = requireRedis();
  const now = Date.now();
  const cutoff = now - retentionMilliseconds;
  const learnerIds = await client.zrange<string[]>(activityIndexKey, cutoff, now, { byScore: true });
  const profiles: AnonymousAssessmentProfile[] = [];
  for (let start = 0; start < learnerIds.length; start += 300) {
    const batch = learnerIds.slice(start, start + 300);
    const pipeline = client.pipeline();
    batch.forEach((learner) => {
      pipeline.get(stageKey(learner, "pre"));
      pipeline.get(stageKey(learner, "post"));
    });
    const results = await pipeline.exec();
    for (let index = 0; index < batch.length; index += 1) {
      const pre = parseStage(results[index * 2]);
      const post = parseStage(results[index * 2 + 1]);
      const profile: AnonymousAssessmentProfile = { ...(pre ? { pre } : {}), ...(post ? { post } : {}) };
      if (profile.pre || profile.post) profiles.push(profile);
    }
  }
  return aggregatePublicAssessmentResults(profiles, periodDays, now);
}
