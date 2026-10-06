import type { AnalysisResult, SignalType } from "@/lib/analysis";

export const showcaseMessage =
  "【商城客服】您的訂單誤設為 12 期扣款，今天內未解除將連續扣款。請立即加入客服 LINE，並提供銀行帳號與簡訊驗證碼，我們會協助退款。";

export const showcaseAnalysis: AnalysisResult = {
  summary: "訊息同時用客服身分、限時扣款與敏感資料要求施壓；先停止互動，再從商城官方入口查證。",
  riskLevel: "critical",
  confidence: "high",
  signals: [
    {
      excerpt: "商城客服",
      type: "authority",
      explanation: "自稱客服不代表身分已確認，必須離開原訊息，從原本使用的商城 App 重新聯絡。",
    },
    {
      excerpt: "今天內未解除將連續扣款",
      type: "urgency",
      explanation: "限時與損失威脅會壓縮思考時間，讓人來不及向他人求證。",
    },
    {
      excerpt: "提供銀行帳號與簡訊驗證碼",
      type: "personal_data",
      explanation: "銀行帳號與驗證碼屬於敏感資料，不應透過訊息或通話交給對方。",
    },
    {
      excerpt: "協助退款",
      type: "money",
      explanation: "退款與解除扣款涉及金融操作，應改由銀行或平台的獨立官方管道確認。",
    },
  ],
  manipulationTactics: ["冒用客服權威", "製造急迫感", "利用害怕持續扣款的損失心理"],
  verificationQuestions: [
    "我能否不使用這則訊息提供的聯絡方式，直接從商城官方 App 查到這筆訂單？",
    "銀行或商城官方客服是否真的會要求我提供簡訊驗證碼？",
    "如果不是現在立刻處理，對方能否提供可由官方管道核對的案件編號？",
  ],
  recommendedActions: [
    "立即停止回覆，不加入對方提供的 LINE，也不提供帳號或驗證碼。",
    "保留訊息截圖與收到時間，但不要點擊或轉傳其中的陌生入口。",
    "自行開啟原本使用的商城 App，從訂單與官方客服頁面確認。",
    "如已提供金融資料，立即聯絡銀行並請可信任成人陪同撥打 165。",
  ],
  learningPoint: "身分名稱可以被冒用；真正可靠的查證，是離開對方安排的入口，自己找到官方管道。",
  helpSummary:
    "我收到一則自稱商城客服的訊息，對方用限時扣款催促我提供銀行帳號與簡訊驗證碼。我尚未依照訊息操作，想請你陪我從商城與銀行官方管道查證；如有需要，我們可以撥打 165。",
  sensitiveDataDetected: false,
  disclaimer: "此為 AI 初步風險分析，不代表警方、金融機構或法律上的最終認定。",
};

export const signalLabel: Record<SignalType, string> = {
  urgency: "催促與限時",
  money: "金錢要求",
  personal_data: "個資要求",
  link: "陌生連結",
  authority: "冒用權威",
  secrecy: "要求保密",
  reward: "不合理獎勵",
  relationship: "關係與情感",
};

export const showcaseSteps = [
  { id: "problem", short: "問題", title: "防詐不是猜真假", seconds: 20 },
  { id: "message", short: "訊息", title: "載入安全示範案例", seconds: 25 },
  { id: "signals", short: "看", title: "找到原文風險線索", seconds: 35 },
  { id: "questions", short: "問", title: "提出三個查證問題", seconds: 30 },
  { id: "actions", short: "查", title: "排列安全行動", seconds: 30 },
  { id: "help", short: "求", title: "把問題交給可信任的人", seconds: 25 },
  { id: "learning", short: "成效", title: "看見學習證據", seconds: 45 },
  { id: "safety", short: "技術", title: "公開 AI 安全與評測證據", seconds: 60 },
] as const;

export type ShowcaseStepId = (typeof showcaseSteps)[number]["id"];

export function clampShowcaseStep(value: number) {
  return Math.max(0, Math.min(showcaseSteps.length - 1, value));
}

export const aiSafetyFlow = [
  { label: "輸入", note: "只把文字視為待分析資料" },
  { label: "遮罩", note: "電話、Email、OTP、帳號與卡號" },
  { label: "限流", note: "每分鐘、每日與匿名訪客配額" },
  { label: "分析", note: "OpenAI 或安全 Demo 引擎" },
  { label: "驗證", note: "Strict JSON Schema ＋ Zod" },
  { label: "回饋", note: "停、看、問、查、求教學結果" },
] as const;

export const evaluationEvidence = {
  rule: {
    label: "程式／規則測試",
    status: "已完成",
    cases: 40,
    passed: 40,
    note: "2026-10-05 重新執行。這是合成案例對 Mock 規則、安全約束與 Schema 的測試，不是生成式 AI 準確率。",
  },
  live: {
    label: "即時生成式 AI 評測",
    status: "待完成",
    cases: 40,
    passed: null,
    note: "OpenAI API Billing／額度尚未可用；不得宣稱即時模型已通過完整 40 題。",
  },
  dimensions: [
    "風險線索命中",
    "停止與官方查證行動",
    "禁止絕對斷言",
    "敏感資訊遮罩",
    "Prompt Injection 防護",
    "正常訊息誤判檢查",
    "Schema 合格率",
  ],
} as const;

export const scenarioGuides = [
  {
    id: "student",
    tab: "學生",
    role: "國高中學生",
    problem: "社群私訊聲稱帳號即將停權，要求從陌生連結登入並回傳 OTP。",
    steps: ["先不點連結", "圈出限時、登入與 OTP 要求", "直接開官方 App 的安全設定", "請老師或家長一起確認"],
    decision: "關閉私訊，從原本安裝的官方 App 獨立查證。",
    evidence: "完成闖關與前後測，能說出至少三個線索及一個安全行動。",
    benefit: "把一次提醒轉成下一次也能使用的查證策略。",
  },
  {
    id: "family",
    tab: "親子／長者",
    role: "家長陪同長者",
    problem: "自稱親友的新號碼突然借錢，並要求不要打電話、不要告訴家人。",
    steps: ["停止匯款", "不在新號碼繼續驗證", "回撥原本保存的電話", "產生求助卡交給家人或 165"],
    decision: "用既有聯絡方式找到本人，不依賴對方提供的新入口。",
    evidence: "能辨認冒名、金錢、催促與保密四種心理操控線索。",
    benefit: "降低長者獨自承受催促的壓力，讓家庭共同完成查證。",
  },
  {
    id: "teacher",
    tab: "教師",
    role: "資訊素養或班會課教師",
    problem: "需要讓全班練習，又不能蒐集姓名、座號與學生貼入的原始訊息。",
    steps: ["選擇固定情境包", "建立 30 天匿名班級代碼", "學生完成前測、闖關與後測", "只查看匿名群體趨勢"],
    decision: "用匿名彙總找出常錯概念，不建立排行榜或個人風險標籤。",
    evidence: "呈現樣本數、完成率、前後測與常錯概念；Demo 與真實資料分開。",
    benefit: "教師能調整下一堂課，同時維持資料最小化。",
  },
] as const;

export type ScenarioGuideId = (typeof scenarioGuides)[number]["id"];
