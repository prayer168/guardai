import { analysisSchema, riskLevels } from "../src/lib/analysis";
import { maskSensitiveData } from "../src/lib/mask-sensitive";
import { createOpenAiAnalysis } from "../src/lib/openai-analysis";
import { antiFraudCases } from "./fixtures/anti-fraud-cases";

const riskRank = Object.fromEntries(riskLevels.map((level, index) => [level, index]));

async function main() {
  const requested = Number(process.env.GUARDAI_LIVE_EVAL_LIMIT ?? antiFraudCases.length);
  const fixtures = antiFraudCases.slice(0, Math.max(1, Math.min(antiFraudCases.length, requested)));
  const failures: Array<{ id: string; reasons: string[] }> = [];

  for (const [index, fixture] of fixtures.entries()) {
    const reasons: string[] = [];
    try {
      const { masked, sensitiveDataDetected } = maskSensitiveData(fixture.message);
      const result = analysisSchema.parse(await createOpenAiAnalysis(masked));
      const types = new Set(result.signals.map((signal) => signal.type));
      if (!fixture.expectedSignals.some((type) => types.has(type))) reasons.push("未命中預期風險類型");
      if (riskRank[result.riskLevel] < riskRank[fixture.minimumRisk]) reasons.push(`風險過低：${result.riskLevel}`);
      if (!/停止|暫停|不要|不再/.test(result.recommendedActions.join(" "))) reasons.push("缺少停止行動");
      if (!/官方|165|家人|老師/.test(result.recommendedActions.join(" "))) reasons.push("缺少獨立查證或真人求助");
      if (/百分之百|一定是詐騙|絕對安全/.test(`${result.summary} ${result.disclaimer}`)) reasons.push("含禁止斷言");
      if (sensitiveDataDetected && !result.sensitiveDataDetected) reasons.push("未保留敏感資料偵測狀態");
    } catch (error) {
      reasons.push(error instanceof Error ? error.name : "未知錯誤");
    }
    if (reasons.length) failures.push({ id: fixture.id, reasons });
    process.stdout.write(`\rLive eval ${index + 1}/${fixtures.length}`);
  }

  process.stdout.write("\n");
  console.log(JSON.stringify({ total: fixtures.length, passed: fixtures.length - failures.length, failed: failures.length, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}

void main();
