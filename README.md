# GuardAI 反詐守門員

「不替你判斷，陪你完成查證。」

GuardAI 是為 2026 TAIA AI 創意設計大賽教育科技領域製作的響應式學習平台。它不替使用者宣告訊息真假，而是以「停、看、問、查、求」流程，帶領學生、家長與長者辨認風險線索、提出查證問題、選擇安全行動並向真人求助。

正式展示網站：<https://guardai-olive.vercel.app>

完整的需求提示詞、AI 編碼調用、修正、測試與部署紀錄，請參閱 [`docs/BUILD_JOURNAL.md`](docs/BUILD_JOURNAL.md)。這份文件會隨專案持續更新，並作為口頭報告與成果發表的素材來源。

## 完成功能

- AI 判讀實驗室：六組離線案例、敏感資料遮罩、進度提示、伺服器端分析與求助卡
- 防詐闖關：六個分支情境、即時回饋、正常通知案例、查證力分數與能力雷達圖
- 我的學習護照：五題前測、五題後測、進步幅度、常忽略概念與匿名本機紀錄
- 教師專區：學生／家長／長者情境包、匿名班級 Demo、練習指派與 CSV 匯出
- 防詐知識庫：14 種詐騙、四階段手法流程、可能結果、因應行動、查證問題、官方來源與 Images 2.0 宣導海報
- 隱私與 AI 說明：資料流、AI 限制、prompt injection 防護與 165 求助方式

## 技術與隱私

- Next.js 16 App Router、TypeScript、Tailwind CSS、React 19
- Zod 驗證輸入與 AI JSON 結構
- OpenAI API 僅在伺服器 Route Handler 呼叫，瀏覽器不會取得 API Key
- `GUARDAI_AI_MODE=live` 與 API Key 同時存在才會呼叫生成式 AI
- 20 秒逾時、Vercel Firewall 每 IP 每分鐘 5 次，以及 Redis 每日全站／訪客配額
- AI 未設定或連線失敗時，自動使用可完整操作的 Mock Demo
- 預設不登入、不建資料庫、不永久儲存使用者貼入的訊息
- 每日配額只保存日期、不可逆訪客雜湊與計數，到期自動刪除，不保存訊息內容
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
- `GUARDAI_AI_TIMEOUT_MS`：單次 AI 呼叫逾時，預設 20,000 毫秒
- `GUARDAI_DAILY_LIMIT`／`GUARDAI_VISITOR_DAILY_LIMIT`：臺北時間每日全站與訪客配額
- `GUARDAI_LIMIT_SALT`：產生不可逆訪客識別雜湊的伺服器祕密
- `KV_REST_API_URL`／`KV_REST_API_TOKEN`：Upstash Redis，每日只保存雜湊與計數

## 品質檢查

```bash
npm run lint
npm test
npm run build
```

`npm test` 會執行 40 個反詐情境以及模式切換、敏感資料遮罩測試。已設定有效 API 額度時，可用 `npm run test:live` 評估生成式 AI 結構與安全建議；測試不會保存訊息。

## 部署到 Vercel

目前 Production 網站為 <https://guardai-olive.vercel.app>。

1. 將 `guardai` 專案推送至 GitHub。
2. 在 Vercel 匯入儲存庫，Framework Preset 選 Next.js。
3. 若使用現場 AI，於 Project Settings → Environment Variables 設定 `GUARDAI_AI_MODE=live`、`OPENAI_API_KEY` 與 `OPENAI_MODEL`。
4. 若只需穩定參賽展示，不設定任何環境變數即可直接部署 Mock Demo。
5. 部署後依序測試 `/analyze`、`/challenge`、`/passport`、`/teacher`、`/knowledge` 與 `/privacy`。

## 圖像來源

首頁、教師專區主視覺與 14 張知識庫宣導海報皆以 OpenAI Images 2.0 依本產品需求生成，檔案位於 `public/images/`。海報的精確標題與教學文字由 HTML 疊加，生成圖本身不含文字、商標、可掃描 QR code 或可點擊網址。

## 免責聲明

此為 AI 初步風險分析，不代表警方、金融機構或法律上的最終認定。若已匯款、交付帳號／OTP／個資或感到人身安全受威脅，請停止操作、保存紀錄，並聯絡可信任家人、老師、相關機構官方客服或撥打 165。
