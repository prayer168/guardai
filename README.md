# GuardAI 反詐守門員

「不替你判斷，陪你完成查證。」

GuardAI 是為 2026 TAIA AI 創意設計大賽教育科技領域製作的響應式學習平台。它不替使用者宣告訊息真假，而是以「停、看、問、查、求」流程，帶領學生、家長與長者辨認風險線索、提出查證問題、選擇安全行動並向真人求助。

## 完成功能

- AI 判讀實驗室：六組離線案例、敏感資料遮罩、進度提示、伺服器端分析與求助卡
- 防詐闖關：六個分支情境、即時回饋、正常通知案例、查證力分數與能力雷達圖
- 我的學習護照：五題前測、五題後測、進步幅度、常忽略概念與匿名本機紀錄
- 教師專區：學生／家長／長者情境包、匿名班級 Demo、練習指派與 CSV 匯出
- 防詐知識庫：六類卡片、查證方法、官方來源、更新日期與開放資料介面預留
- 隱私與 AI 說明：資料流、AI 限制、prompt injection 防護與 165 求助方式

## 技術與隱私

- Next.js 16 App Router、TypeScript、Tailwind CSS、React 19
- Zod 驗證輸入與 AI JSON 結構
- OpenAI API 僅在伺服器 Route Handler 呼叫，瀏覽器不會取得 API Key
- AI 未設定或連線失敗時，自動使用可完整操作的 Mock Demo
- 預設不登入、不建資料庫、不永久儲存使用者貼入的訊息
- 學習紀錄只匿名保存在目前瀏覽器的 `localStorage`
- 不自動開啟或造訪使用者訊息中的網址

## 本機啟動

需要 Node.js 20.9 或更新版本。

```bash
npm install
copy .env.example .env.local
npm run dev
```

開啟 <http://localhost:3000>。不填 API Key 也能完成全站 Demo。

## 環境變數

參考 `.env.example`：

- `GUARDAI_AI_MODE=mock`：固定使用離線規則引擎，適合比賽簡報與教室展示
- `GUARDAI_AI_MODE=live`：嘗試使用 OpenAI Responses API；失敗時安全回退 Mock
- `OPENAI_API_KEY`：只存在伺服器環境
- `OPENAI_MODEL`：預設為 `gpt-5.6-luna`，可換成帳戶可用且支援 Structured Outputs 的模型

## 品質檢查

```bash
npm run lint
npm run build
```

## 部署到 Vercel

1. 將 `guardai` 專案推送至 GitHub。
2. 在 Vercel 匯入儲存庫，Framework Preset 選 Next.js。
3. 若使用現場 AI，於 Project Settings → Environment Variables 設定 `GUARDAI_AI_MODE=live`、`OPENAI_API_KEY` 與 `OPENAI_MODEL`。
4. 若只需穩定參賽展示，不設定任何環境變數即可直接部署 Mock Demo。
5. 部署後依序測試 `/analyze`、`/challenge`、`/passport`、`/teacher`、`/knowledge` 與 `/privacy`。

## 圖像來源

首頁與教師專區主視覺皆以 OpenAI Images 2.0 依本產品需求生成，檔案位於 `public/images/`。生成圖不含文字、商標、QR code 或可點擊網址。

## 免責聲明

此為 AI 初步風險分析，不代表警方、金融機構或法律上的最終認定。若已匯款、交付帳號／OTP／個資或感到人身安全受威脅，請停止操作、保存紀錄，並聯絡可信任家人、老師、相關機構官方客服或撥打 165。
