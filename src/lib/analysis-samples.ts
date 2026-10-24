import { sampleMessages as originalSamples } from "@/lib/content";

export type AnalysisSample = {
  id: string;
  category: string;
  label: string;
  message: string;
  keywords: string;
  source: { label: string; url: string };
};

const cib = "https://www.cib.npa.gov.tw/ch/app/data/view?id=1909&module=wg116&serno=";
const sources = {
  shop: { label: "刑事局｜假網拍詐騙", url: `${cib}7e614f6f-df9b-4ae2-8293-ed384fb1a470` },
  installment: { label: "刑事局｜解除分期詐騙", url: `${cib}a61af506-a4ac-49eb-9c79-ef75ddc6f237` },
  investment: { label: "刑事局｜假投資", url: `${cib}a4f8d5ab-3d53-4d22-9411-031fddde7a4e` },
  romance: { label: "刑事局｜假愛情交友", url: `${cib}064fe6c9-ae2c-40d2-a7df-2e5a4223091f` },
  relative: { label: "刑事局｜猜猜我是誰", url: `${cib}4f04dab6-3ca5-4139-a94e-66be03b62ba3` },
  authority: { label: "刑事局｜假冒機關", url: `${cib}b7cf505d-f709-4885-b06b-d29b092ce04f` },
  job: { label: "刑事局｜假求職", url: `${cib}87a85079-c42f-48cb-9506-14e08c912a39` },
  account: { label: "刑事局｜盜用網路帳號", url: `${cib}a2f50753-ab28-469a-a6ce-59368758d083` },
  rental: { label: "警廣｜租屋詐騙", url: "https://www.pbs.npa.gov.tw/ch/app/data/view?id=18740&module=wg183&serno=0963ac01-b7c4-4eb3-a988-2fce4d076e67" },
  ticket: { label: "刑事局｜票券詐騙", url: "https://www.cib.npa.gov.tw/ch/app/news/view?id=1887&module=news&serno=f2131775-f260-456b-bf77-8fb1a9158b5e" },
  qr: { label: "刑事局｜QR Code 付款詐騙", url: "https://www.cib.npa.gov.tw/ch/app/news/view?id=1887&module=news&serno=d84819b1-a785-47cf-a84c-82274f6db300" },
  phishing: { label: "刑事局｜網購釣魚連結", url: "https://www.cib.npa.gov.tw/ch/app/news/view?id=1887&module=news&serno=26094d36-f617-40b5-9712-67b5199aac8b" },
  govLatest: { label: "內政部｜最新假檢警案例", url: "https://www.moi.gov.tw/News_Content.aspx?n=2&s=339591&sms=9009" },
  ai: { label: "警政署｜AI 深偽詐騙", url: "https://www.npa.gov.tw/ch/app/video/view?id=2275&module=video&serno=3328b46f-c588-44c9-a1fa-e6c2d400c775" },
  prize: { label: "中華郵政｜假抽獎詐騙", url: "https://www.post.gov.tw/post/internet/Anti-Fraud/common_practices.jsp" },
  jobLatest: { label: "刑事局｜假求職打工", url: "https://www.cib.npa.gov.tw/ch/app/news/view?id=1887&module=news&serno=4d38316e-d938-444f-949a-134d9938dbff" },
} as const;

const originalCategory: Record<string, { category: string; source: AnalysisSample["source"]; keywords: string }> = {
  refund: { category: "購物與客服", source: sources.installment, keywords: "假客服 解除分期 退款 ATM" },
  parcel: { category: "購物與客服", source: sources.phishing, keywords: "包裹 物流 補運費 釣魚" },
  relative: { category: "親友與交友", source: sources.relative, keywords: "假冒親友 借錢 新電話" },
  investment: { category: "金融與投資", source: sources.investment, keywords: "假投資 保證獲利 群組" },
  social: { category: "帳號與個資", source: sources.account, keywords: "帳號停權 OTP 驗證" },
  scholarship: { category: "求職與獎助", source: sources.job, keywords: "獎學金 求職 保證金" },
};

const additionalSamples: AnalysisSample[] = [
  { id: "seller-escrow", category: "購物與客服", label: "假買家要求開通金流", message: "你好，我要買你的二手相機，但平台顯示你尚未開通金流。請加這個客服 LINE，依指示操作網路銀行完成認證，款項才會入帳。", keywords: "假買家 賣家 金流認證 網銀", source: sources.shop },
  { id: "cheap-goods", category: "購物與客服", label: "低價商品私下交易", message: "全新手機原價三萬，今天只賣八千，因為急用錢。平台抽成太高，請私下匯款給我，我收到後馬上寄出，名額只有一台。", keywords: "假網拍 低價 私下匯款", source: sources.shop },
  { id: "fake-delivery", category: "購物與客服", label: "包裹地址錯誤補資料", message: "您的包裹地址資料不完整，請在兩小時內點選下方短網址重新填寫姓名、電話及信用卡資料，否則包裹將退回。", keywords: "物流 包裹 短網址 信用卡", source: sources.phishing },
  { id: "fake-bank-call", category: "金融與投資", label: "假銀行要求解除扣款", message: "我是銀行帳務人員，系統顯示你的帳戶被設定為連續扣款。請不要掛電話，現在到 ATM 選擇轉帳，我會在線上協助取消。", keywords: "假銀行 ATM 連續扣款", source: sources.installment },
  { id: "investment-withdraw", category: "金融與投資", label: "出金前先繳稅金", message: "你的投資獲利已入帳，要提領需要先繳 15% 稅金和帳戶驗證保證金。今天完成就能全額出金，請勿告訴其他群組成員以免名額被取消。", keywords: "投資 出金 稅金 保證金", source: sources.investment },
  { id: "fake-crypto", category: "金融與投資", label: "虛擬貨幣穩賺方案", message: "我們的量化機器人每天穩定獲利，保證本金不會損失。先加入私人群組並下載專用 App，轉入 USDT 後由老師幫你操作。", keywords: "虛擬貨幣 加密貨幣 保證獲利", source: sources.investment },
  { id: "romance-invest", category: "親友與交友", label: "網友邀請一起投資", message: "我們聊了這麼久，我不會害你。我在平台上穩定賺錢，先用我的連結註冊，再把存款轉到我推薦的帳戶，我會教你怎麼操作。", keywords: "假交友 感情投資 匯款", source: sources.romance },
  { id: "romance-emergency", category: "親友與交友", label: "網友突然急需醫療費", message: "我人在國外出了意外，手機和錢包都不見了。拜託先匯一筆醫療費到朋友帳戶，不要告訴其他人，我回去一定還你。", keywords: "交友 急難借錢 保密", source: sources.romance },
  { id: "voice-clone", category: "親友與交友", label: "AI 仿聲急電借錢", message: "我是你的孩子，我現在出車禍需要先付和解金。電話不要掛，直接把錢轉給我朋友，先不要跟爸媽說，我等等再解釋。", keywords: "AI 深偽 仿聲 親友借錢", source: sources.ai },
  { id: "fake-police", category: "假冒機關", label: "假檢警要求監管帳戶", message: "你涉及洗錢案件，必須配合偵查。現在加入檢察官 LINE 並開啟視訊，把金融卡交給專員監管，這是偵查機密，不能告訴家人。", keywords: "假檢警 監管帳戶 LINE", source: sources.authority },
  { id: "fake-household", category: "假冒機關", label: "假戶政轉接警察", message: "你的身分證被冒用申辦文件，我現在幫你轉接警方。請在電話中核對銀行帳戶，再把存款轉到安全監管帳戶，避免涉案財產被凍結。", keywords: "假戶政 身分遭冒用 監管", source: sources.govLatest },
  { id: "job-money-mule", category: "求職與獎助", label: "高薪工作要求交提款卡", message: "在家簡單收款，每天可領五千元。錄取後請把提款卡和密碼寄給公司財務設定薪轉，工作內容保密，今晚前完成就能領到簽約獎金。", keywords: "假求職 人頭帳戶 提款卡", source: sources.job },
  { id: "job-resale", category: "求職與獎助", label: "代購轉售賺佣金", message: "我們是電商代營運團隊，不用面試也能遠端工作。先自費買指定商品，收到後轉寄到客戶地址，每筆可賺兩成，第一筆小額訂單會先返還本金。", keywords: "假求職 轉售 代購 佣金", source: sources.jobLatest },
  { id: "rental-deposit", category: "租屋與票券", label: "看房前先付保留金", message: "房子很熱門，現在人在外地不方便帶看。先匯兩個月押金幫你保留，我再傳地址和門鎖密碼；很多人排隊，今天不付就給下一位。", keywords: "租屋 假房東 訂金 看房", source: sources.rental },
  { id: "ticket-transfer", category: "租屋與票券", label: "演唱會票券私下轉售", message: "朋友臨時不能去，原價五千的票三千賣你。請私訊我的另一個帳號並先轉帳，我會傳 QR Code 給你，平台交易太慢會被別人買走。", keywords: "演唱會 門票 票券 QR Code", source: sources.ticket },
  { id: "qr-pay", category: "帳號與個資", label: "掃碼領退款或收款", message: "退款已核准，請掃描這張 QR Code 並登入網路銀行確認收款。接著輸入簡訊驗證碼完成身分驗證，否則退款會自動取消。", keywords: "QR Code 退款 OTP 網銀", source: sources.qr },
  { id: "fake-prize", category: "帳號與個資", label: "抽獎中獎先繳費", message: "恭喜抽中最新手機！請加官方客服帳號核對身分，並先支付運費與得獎稅金。為保障獎品，請提供身分證照片和銀行帳戶資料。", keywords: "假抽獎 中獎 稅金 個資", source: sources.prize },
  { id: "fake-platform-support", category: "帳號與個資", label: "假平台客服索取驗證碼", message: "我們偵測到你的帳號有異常登入。為確認本人，請直接回覆簡訊中的六位驗證碼；若未在十分鐘內完成，帳號將永久停用。", keywords: "帳號盜用 驗證碼 停權", source: sources.account },
];

export const analysisSamples: AnalysisSample[] = [
  ...originalSamples.map((sample) => ({ ...sample, ...originalCategory[sample.id] })),
  ...additionalSamples,
];

export const analysisSampleCategories = ["全部分類", ...new Set(analysisSamples.map((sample) => sample.category))];
