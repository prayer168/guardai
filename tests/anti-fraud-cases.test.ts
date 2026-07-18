import assert from "node:assert/strict";
import test from "node:test";

import { analysisSchema, riskLevels } from "../src/lib/analysis";
import { maskSensitiveData } from "../src/lib/mask-sensitive";
import { createMockAnalysis } from "../src/lib/mock-analysis";
import { antiFraudCases } from "./fixtures/anti-fraud-cases";

const riskRank = Object.fromEntries(riskLevels.map((level, index) => [level, index]));

for (const fixture of antiFraudCases) {
  test(`${fixture.id}｜${fixture.category}`, () => {
    const { masked, sensitiveDataDetected } = maskSensitiveData(fixture.message);
    const result = analysisSchema.parse(createMockAnalysis(masked, sensitiveDataDetected));
    const signalTypes = new Set(result.signals.map((signal) => signal.type));

    for (const expected of fixture.expectedSignals) {
      assert.equal(signalTypes.has(expected), true, `missing signal: ${expected}`);
    }
    assert.ok(riskRank[result.riskLevel] >= riskRank[fixture.minimumRisk], `${result.riskLevel} < ${fixture.minimumRisk}`);
    assert.equal(result.verificationQuestions.length, 3);
    assert.match(result.recommendedActions.join(" "), /停止|暫停|不要|不再/);
    assert.match(result.recommendedActions.join(" "), /官方/);
    assert.doesNotMatch(`${result.summary} ${result.disclaimer}`, /百分之百|一定是詐騙|絕對安全/);
    if (fixture.sensitive) assert.equal(result.sensitiveDataDetected, true);
  });
}

test("遮罩電話、Email、OTP、帳號與卡號，不保存原值", () => {
  const input = "電話 0912-345-678，信箱 student@example.com，OTP：123456，銀行帳號 AB123456，卡號 4111 1111 1111 1111";
  const { masked, sensitiveDataDetected } = maskSensitiveData(input);
  assert.equal(sensitiveDataDetected, true);
  for (const secret of ["0912-345-678", "student@example.com", "123456", "AB123456", "4111 1111 1111 1111"]) {
    assert.equal(masked.includes(secret), false);
  }
});

test("GUARDAI_AI_MODE 只有明確 live 才能啟用", async () => {
  const original = process.env.GUARDAI_AI_MODE;
  const { getAiRuntimeConfig } = await import("../src/lib/ai-config");
  process.env.GUARDAI_AI_MODE = "mock";
  assert.equal(getAiRuntimeConfig().mode, "mock");
  process.env.GUARDAI_AI_MODE = "live";
  assert.equal(getAiRuntimeConfig().mode, "live");
  process.env.GUARDAI_AI_MODE = "unexpected";
  assert.equal(getAiRuntimeConfig().mode, "mock");
  if (original === undefined) delete process.env.GUARDAI_AI_MODE;
  else process.env.GUARDAI_AI_MODE = original;
});
