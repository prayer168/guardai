import type { AnalysisResult, SignalType } from "@/lib/analysis";

type Rule = {
  type: SignalType;
  pattern: RegExp;
  explanation: string;
  tactic: string;
  weight: number;
};

const rules: Rule[] = [
  {
    type: "urgency",
    pattern: /立即|馬上|限時|今天內|今晚|最後通知|逾期|\d+\s*分鐘/g,
    explanation: "限時或倒數會壓縮思考時間，讓人來不及向其他管道確認。",
    tactic: "製造急迫感",
    weight: 2,
  },
  {
    type: "money",
    pattern: /匯款|轉帳|ATM|付款|扣款|保證金|手續費|獲利|報酬/g,
    explanation: "訊息涉及金錢操作，應中止原對話並從獨立管道查證。",
    tactic: "利用損失或獲利期待",
    weight: 3,
  },
  {
    type: "personal_data",
    pattern: /驗證碼|認證碼|OTP|密碼|身分證|信用卡|銀行帳號|個資/g,
    explanation: "密碼、驗證碼與金融資料不應透過訊息交給任何人。",
    tactic: "索取敏感資料",
    weight: 3,
  },
  {
    type: "link",
    pattern: /https?:\/\/\S+|www\.\S+|點擊.{0,5}連結|陌生網址|短網址/g,
    explanation: "訊息中的連結可能導向仿冒頁面；不要直接開啟。",
    tactic: "引導進入受控入口",
    weight: 2,
  },
  {
    type: "authority",
    pattern: /客服|銀行|警察|檢察官|法院|政府|老師|學校|平台官方/g,
    explanation: "自稱權威不等於身分已確認，需從原本知道的官方管道重新聯絡。",
    tactic: "冒用權威增加可信度",
    weight: 1,
  },
  {
    type: "secrecy",
    pattern: /保密|不要告訴|不能告訴|請勿外傳|私下處理/g,
    explanation: "要求保密會阻止你向可信任的人求助，是常見的控制手法。",
    tactic: "切斷外部求助",
    weight: 3,
  },
  {
    type: "reward",
    pattern: /中獎|獎學金|免費|保證獲利|穩賺|高報酬|名額只剩/g,
    explanation: "過度誘人的獎勵可能讓人忽略來源與條件是否合理。",
    tactic: "用稀缺與獎勵降低戒心",
    weight: 2,
  },
  {
    type: "relationship",
    pattern: /我是你|媽[，,]|爸[，,]|兒子|女兒|親愛的|朋友|家人/g,
    explanation: "熟悉稱呼可能被冒用；應使用原有聯絡方式或共同經歷驗證。",
    tactic: "利用關係與情感",
    weight: 2,
  },
];

const disclaimer = "此為 AI 初步風險分析，不代表警方、金融機構或法律上的最終認定。";

export function createMockAnalysis(
  message: string,
  sensitiveDataDetected: boolean,
): AnalysisResult {
  const signals: AnalysisResult["signals"] = [];
  const tactics = new Set<string>();
  let score = 0;

  for (const rule of rules) {
    const match = message.match(rule.pattern)?.[0];
    if (!match || signals.length >= 5) continue;

    signals.push({
      excerpt: match.slice(0, 80),
      type: rule.type,
      explanation: rule.explanation,
    });
    tactics.add(rule.tactic);
    score += rule.weight;
  }

  const hasMoney = signals.some((signal) => signal.type === "money");
  const hasSensitive = signals.some((signal) => signal.type === "personal_data");
  const hasSecrecy = signals.some((signal) => signal.type === "secrecy");

  let riskLevel: AnalysisResult["riskLevel"] = "unknown";
  if ((hasMoney && hasSensitive) || (hasMoney && hasSecrecy) || score >= 9) {
    riskLevel = "critical";
  } else if (score >= 6) {
    riskLevel = "high";
  } else if (score >= 3) {
    riskLevel = "medium";
  } else if (/不附.{0,5}連結|不會索取|官方校務系統/.test(message)) {
    riskLevel = "low";
  }

  const confidence: AnalysisResult["confidence"] =
    signals.length >= 4 ? "high" : signals.length >= 2 ? "medium" : "low";

  const summary =
    riskLevel === "critical"
      ? "訊息同時出現金錢、個資或保密要求；請立即停止互動並找真人協助。"
      : riskLevel === "high"
        ? "訊息含有多項高風險線索，先不要依照內容操作，改用獨立管道查證。"
        : riskLevel === "medium"
          ? "訊息有需要查證的警示線索，請先暫停並確認來源。"
          : riskLevel === "low"
            ? "目前未見明顯高風險要求，但仍建議從原本使用的官方入口確認。"
            : "目前證據不足以判斷；不要只憑語氣相信或否定，請進一步查證來源。";

  return {
    summary,
    riskLevel,
    confidence,
    signals,
    manipulationTactics: [...tactics],
    verificationQuestions: [
      "我能否不使用這則訊息提供的連結或電話，從官方管道重新找到聯絡方式？",
      "對方為什麼要求我現在就行動？如果是真的，能否給我時間查證？",
      "這項要求是否涉及匯款、帳號、密碼、驗證碼或身分資料？",
    ],
    recommendedActions: [
      "先停止點擊、回覆、匯款或提供任何資料。",
      "截圖保留訊息、帳號、時間與付款紀錄，但不要再與對方互動。",
      "離開原訊息，從官方 App、官方網站或卡片背面的電話重新查證。",
      "請家人、老師或可信任成人一起檢視；有疑慮可撥打 165。",
    ],
    learningPoint: "辨識詐騙不是猜對真假，而是看見風險線索後，知道如何暫停、獨立查證與求助。",
    helpSummary:
      "我收到一則可疑訊息，內容包含限時或資料／金錢要求。我尚未依照訊息操作，希望請你陪我一起從官方管道查證；如有需要，我們可以撥打 165。",
    sensitiveDataDetected,
    disclaimer,
  };
}
