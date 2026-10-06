import assert from "node:assert/strict";
import test from "node:test";

import { analysisSchema } from "../src/lib/analysis";
import {
  aiSafetyFlow,
  clampShowcaseStep,
  evaluationEvidence,
  scenarioGuides,
  showcaseAnalysis,
  showcaseSteps,
} from "../src/lib/showcase";

test("競賽展示涵蓋 8 個必要階段並可安全限制步驟", () => {
  assert.deepEqual(showcaseSteps.map((step) => step.id), ["problem", "message", "signals", "questions", "actions", "help", "learning", "safety"]);
  assert.equal(clampShowcaseStep(-1), 0);
  assert.equal(clampShowcaseStep(99), showcaseSteps.length - 1);
  assert.ok(showcaseSteps.reduce((sum, step) => sum + step.seconds, 0) >= 180);
  assert.ok(showcaseSteps.reduce((sum, step) => sum + step.seconds, 0) <= 300);
});

test("離線展示結果符合正式分析 Schema 與教學最低要求", () => {
  const result = analysisSchema.parse(showcaseAnalysis);
  assert.ok(result.signals.length >= 3);
  assert.equal(result.verificationQuestions.length, 3);
  assert.ok(result.recommendedActions.length >= 3);
  assert.match(result.recommendedActions.join(" "), /停止/);
  assert.match(result.recommendedActions.join(" "), /官方/);
  assert.doesNotMatch(`${result.summary} ${result.disclaimer}`, /百分之百|一定是詐騙|絕對安全/);
});

test("AI 安全流程、三種角色與評測狀態完整且不混淆", () => {
  assert.equal(aiSafetyFlow.length, 6);
  assert.deepEqual(scenarioGuides.map((guide) => guide.id), ["student", "family", "teacher"]);
  for (const guide of scenarioGuides) {
    assert.ok(guide.steps.length >= 4);
    assert.ok(guide.decision.length > 0);
    assert.ok(guide.evidence.length > 0);
    assert.ok(guide.benefit.length > 0);
  }
  assert.equal(evaluationEvidence.rule.passed, 40);
  assert.equal(evaluationEvidence.live.status, "待完成");
  assert.equal(evaluationEvidence.live.passed, null);
});
