export const verificationSteps = [
  { key: "停", title: "先暫停", description: "不點連結、不匯款、不提供個資。" },
  { key: "看", title: "看疑點", description: "圈出催促、金錢、冒名與保密要求。" },
  { key: "問", title: "問證據", description: "提出三個能驗證來源與目的的問題。" },
  { key: "查", title: "獨立查", description: "離開原訊息，改從官方管道重新確認。" },
  { key: "求", title: "找人幫", description: "請家人、老師協助，必要時撥打 165。" },
] as const;

export const sampleMessages = [
  {
    id: "refund",
    label: "假客服退款",
    message:
      "【商城客服】您的訂單誤設為 12 期扣款，今天內未解除將連續扣款。請立即加入客服 LINE，並提供銀行帳號與簡訊驗證碼，我們會協助退款。",
  },
  {
    id: "parcel",
    label: "假包裹通知",
    message:
      "包裹配送失敗，今晚 23:59 前需補繳 35 元重新配送。請點擊 https://delivery-check.example 填寫信用卡資料，逾期包裹將退回。",
  },
  {
    id: "relative",
    label: "假冒親友借錢",
    message:
      "媽，我手機壞了，這是新號碼。現在急著付學費，先幫我轉 28,000 元到這個帳戶，不要打電話，我正在上課，晚點再說。",
  },
  {
    id: "investment",
    label: "高報酬投資",
    message:
      "老師帶單保證獲利，本週名額只剩 3 位。投入 5 萬每月可領 20% 報酬，先私訊助理並匯保證金，群組內容請勿外傳。",
  },
  {
    id: "social",
    label: "社群帳號驗證",
    message:
      "你的社群帳號遭檢舉，即將在 30 分鐘後停權。請點選驗證連結重新登入，並回傳收到的 6 位數 OTP 驗證碼。",
  },
  {
    id: "scholarship",
    label: "假獎學金／求職",
    message:
      "恭喜錄取校園大使並獲得 30,000 元獎學金！請在今天內繳交 2,000 元保證金、身分證照片與銀行帳戶，逾期視同放棄。",
  },
] as const;

export type SkillKey = "停" | "看" | "問" | "查" | "求";

export type ChallengeScenario = {
  id: string;
  title: string;
  context: string;
  message: string;
  skill: SkillKey;
  options: Array<{ id: string; label: string }>;
  correctOption: string;
  explanation: string;
  isBenign?: boolean;
};

export const challengeScenarios: ChallengeScenario[] = [
  {
    id: "stop-refund",
    title: "解除重複扣款",
    context: "你接到自稱購物平台客服的電話。",
    message: "帳務異常，請保持通話並依指示操作 ATM，否則今晚會再扣款。",
    skill: "停",
    options: [
      { id: "atm", label: "保持通話，立刻到 ATM 操作" },
      { id: "pause", label: "先掛斷，不依指示操作任何交易" },
      { id: "otp", label: "先把驗證碼給客服確認身分" },
    ],
    correctOption: "pause",
    explanation: "真正的客服不會要求你操作 ATM 解除扣款。先中斷對方施加的壓力，才有空間查證。",
  },
  {
    id: "look-parcel",
    title: "35 元包裹補款",
    context: "簡訊說包裹配送失敗。",
    message: "今晚前補繳 35 元，請點陌生短網址並輸入信用卡，否則包裹銷毀。",
    skill: "看",
    options: [
      { id: "small", label: "金額很小，直接付款比較省事" },
      { id: "signals", label: "注意限時、陌生網址與信用卡要求" },
      { id: "forward", label: "轉傳朋友，看誰也有收到" },
    ],
    correctOption: "signals",
    explanation: "小額付款常被用來降低戒心；限時、陌生連結與金融資料要求是三個可具體辨認的線索。",
  },
  {
    id: "ask-family",
    title: "親友換新號碼",
    context: "對方自稱是家人，急需借錢。",
    message: "手機壞了，這是新號碼。先匯款，不要打電話，我晚點解釋。",
    skill: "問",
    options: [
      { id: "secret", label: "問只有家人才知道、且不涉及個資的共同經歷" },
      { id: "birthday", label: "把生日和身分證號傳給對方核對" },
      { id: "trust", label: "語氣很像家人，先匯再說" },
    ],
    correctOption: "secret",
    explanation: "反問可驗證的共同資訊，並用原本保存的電話回撥，是比比對語氣更可靠的方式。",
  },
  {
    id: "verify-school",
    title: "正常的學校通知",
    context: "導師在正式班級群組發布通知。",
    message: "請同學明天前自行登入學校官方校務系統查看選課結果。本訊息不附登入連結，也不會索取密碼。",
    skill: "查",
    options: [
      { id: "official", label: "自行開啟平常使用的校務系統確認" },
      { id: "allfake", label: "只要是網路訊息都當成詐騙並刪除" },
      { id: "replypass", label: "直接在群組回覆自己的密碼" },
    ],
    correctOption: "official",
    explanation: "這則訊息沒有要求點陌生連結或提供資料，但仍可從原本使用的官方入口確認。防詐不是把所有訊息都判成詐騙。",
    isBenign: true,
  },
  {
    id: "seek-investment",
    title: "保證獲利群組",
    context: "你已經轉了一小筆保證金。",
    message: "再加碼 5 萬就能出金，不能告訴家人，否則資格取消。",
    skill: "求",
    options: [
      { id: "recover", label: "再匯一筆，至少把前面的錢拿回來" },
      { id: "hide", label: "先保密，等賺錢後再說" },
      { id: "help", label: "停止付款、保留紀錄並立即找可信任成人與 165" },
    ],
    correctOption: "help",
    explanation: "要求保密會切斷求助。即使已付款，也不要用更多金錢嘗試追回，應保存證據並尋求真人協助。",
  },
  {
    id: "verify-account",
    title: "帳號即將停權",
    context: "社群私訊要求你重新登入。",
    message: "30 分鐘內完成驗證，否則帳號永久停權。請從下方連結登入並回傳 OTP。",
    skill: "查",
    options: [
      { id: "link", label: "從私訊連結登入，趕在停權前完成" },
      { id: "app", label: "關閉私訊，直接開官方 App 的安全設定查看" },
      { id: "otp", label: "只回傳 OTP，不輸入密碼就沒關係" },
    ],
    correctOption: "app",
    explanation: "不要沿用對方提供的入口。獨立開啟官方 App 或手動輸入官方網址，才能避免被帶往仿冒頁面。",
  },
];
