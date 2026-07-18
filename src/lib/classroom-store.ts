import "server-only";

import { randomBytes } from "node:crypto";

import {
  aggregateClassroomResults,
  type ClassroomPack,
  type ClassroomRecord,
  type ClassroomResult,
  type ClassroomSubmission,
} from "@/lib/classroom";
import { learnerFingerprint, requestFingerprint } from "@/lib/private-identifier";
import { getRedis } from "@/lib/redis";

const classroomTtlSeconds = 30 * 24 * 60 * 60;
const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function classroomKey(code: string) {
  return `guardai:class:${code}`;
}

function participantsKey(code: string) {
  return `guardai:class:${code}:participants`;
}

function resultsKey(code: string) {
  return `guardai:class:${code}:results`;
}

function generateClassroomCode() {
  const bytes = randomBytes(6);
  const suffix = [...bytes].map((byte) => codeAlphabet[byte % codeAlphabet.length]).join("");
  return `GUARD-${suffix}`;
}

function remainingClassroomTtl(classroom: ClassroomRecord) {
  return Math.max(60, Math.ceil((Date.parse(classroom.expiresAt) - Date.now()) / 1_000));
}

function parseStored<T>(value: unknown): T | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return value as T;
}

function requireRedis() {
  const client = getRedis();
  if (!client) throw new Error("CLASSROOM_STORE_UNAVAILABLE");
  return client;
}

export async function consumeClassroomActionLimit(
  request: Request,
  action: "create" | "join" | "submit",
  limit: number,
  windowSeconds: number,
) {
  const client = requireRedis();
  const fingerprint = requestFingerprint(request);
  if (!fingerprint) throw new Error("CLASSROOM_STORE_UNAVAILABLE");

  const window = Math.floor(Date.now() / (windowSeconds * 1_000));
  const key = `guardai:class-limit:${action}:${window}:${fingerprint}`;
  const count = await client.incr(key);
  if (count === 1) await client.expire(key, windowSeconds + 30);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}

export async function createClassroom(pack: ClassroomPack): Promise<ClassroomRecord> {
  const client = requireRedis();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + classroomTtlSeconds * 1_000);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateClassroomCode();
    const classroom: ClassroomRecord = {
      code,
      pack,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    const saved = await client.set(classroomKey(code), JSON.stringify(classroom), {
      nx: true,
      ex: classroomTtlSeconds,
    });
    if (saved === "OK") return classroom;
  }

  throw new Error("CLASSROOM_CODE_COLLISION");
}

export async function getClassroom(code: string) {
  const client = requireRedis();
  const storedClassroom = await client.get(classroomKey(code));
  const classroom = parseStored<ClassroomRecord>(storedClassroom);
  if (!classroom) return null;

  const [participants, storedResults] = await Promise.all([
    client.scard(participantsKey(code)),
    client.hvals(resultsKey(code)) as Promise<unknown[]>,
  ]);
  const results = storedResults
    .map((value) => parseStored<ClassroomResult>(value))
    .filter((value): value is ClassroomResult => Boolean(value));

  return {
    classroom,
    aggregate: aggregateClassroomResults(participants, results),
  };
}

export async function joinClassroom(code: string, learnerId: string) {
  const client = requireRedis();
  const classroom = parseStored<ClassroomRecord>(await client.get(classroomKey(code)));
  if (!classroom) return null;

  const learner = learnerFingerprint(code, learnerId);
  if (!learner) throw new Error("CLASSROOM_STORE_UNAVAILABLE");
  const remainingTtl = remainingClassroomTtl(classroom);
  const pipeline = client.pipeline();
  pipeline.sadd(participantsKey(code), learner);
  pipeline.expire(participantsKey(code), remainingTtl);
  await pipeline.exec();
  return classroom;
}

export async function submitClassroomResult(
  code: string,
  input: ClassroomSubmission,
) {
  const client = requireRedis();
  const classroom = parseStored<ClassroomRecord>(await client.get(classroomKey(code)));
  if (!classroom) return null;

  const { learnerId, ...anonymousResult } = input;
  const learner = learnerFingerprint(code, learnerId);
  if (!learner) throw new Error("CLASSROOM_STORE_UNAVAILABLE");
  const result: ClassroomResult = { ...anonymousResult, submittedAt: new Date().toISOString() };
  const remainingTtl = remainingClassroomTtl(classroom);
  const pipeline = client.pipeline();
  pipeline.sadd(participantsKey(code), learner);
  pipeline.hset(resultsKey(code), { [learner]: JSON.stringify(result) });
  pipeline.expire(participantsKey(code), remainingTtl);
  pipeline.expire(resultsKey(code), remainingTtl);
  await pipeline.exec();
  return result;
}
