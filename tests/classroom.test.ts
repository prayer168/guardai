import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateClassroomResults,
  classroomCodeSchema,
  classroomResultSchema,
  createClassroomSchema,
  type ClassroomResult,
} from "../src/lib/classroom";

test("匿名班級只接受固定情境包，不接受姓名或自由文字", () => {
  assert.equal(createClassroomSchema.safeParse({ pack: "student" }).success, true);
  assert.equal(createClassroomSchema.safeParse({ pack: "student", teacherName: "王老師" }).success, false);
  assert.equal(createClassroomSchema.safeParse({ pack: "unknown" }).success, false);
});

test("班級代碼使用不易混淆的固定格式", () => {
  assert.equal(classroomCodeSchema.safeParse("GUARD-ABC234").success, true);
  assert.equal(classroomCodeSchema.safeParse("GUARD-ABCI01").success, false);
  assert.equal(classroomCodeSchema.safeParse("ABC234").success, false);
});

test("匿名成果不接受超出範圍分數或額外個資欄位", () => {
  const valid = {
    learnerId: "28d14e82-76db-48e9-99e0-91bbcb988fb2",
    preScore: 60,
    postScore: 80,
    challengeScore: 83,
    analysisCount: 2,
    missedConcepts: ["更換入口"],
  };
  assert.equal(classroomResultSchema.safeParse(valid).success, true);
  assert.equal(classroomResultSchema.safeParse({ ...valid, postScore: 101 }).success, false);
  assert.equal(classroomResultSchema.safeParse({ ...valid, studentName: "小明" }).success, false);
  assert.equal(classroomResultSchema.safeParse({ ...valid, missedConcepts: ["任意自由文字"] }).success, false);
});

test("班級彙總只輸出人數、平均與常錯概念", () => {
  const results: ClassroomResult[] = [
    {
      preScore: 40,
      postScore: 80,
      challengeScore: 67,
      analysisCount: 2,
      missedConcepts: ["更換入口", "停止損失"],
      submittedAt: "2026-07-18T00:00:00.000Z",
    },
    {
      preScore: 60,
      postScore: 100,
      challengeScore: 100,
      analysisCount: 3,
      missedConcepts: ["更換入口"],
      submittedAt: "2026-07-18T00:05:00.000Z",
    },
  ];

  assert.deepEqual(aggregateClassroomResults(4, results), {
    participants: 4,
    completed: 2,
    completionRate: 50,
    preAverage: 50,
    postAverage: 90,
    improvementAverage: 40,
    challengeAverage: 84,
    analysisTotal: 5,
    mostMissedConcept: "更換入口",
  });
});

test("沒有成果時仍回傳可顯示的零值彙總", () => {
  assert.deepEqual(aggregateClassroomResults(0, []), {
    participants: 0,
    completed: 0,
    completionRate: 0,
    preAverage: null,
    postAverage: null,
    improvementAverage: null,
    challengeAverage: null,
    analysisTotal: 0,
    mostMissedConcept: null,
  });
});
