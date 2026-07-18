# GuardAI 專案交接文件

最後更新：2026-07-18  
網站版本：0.4.0  
文件版本：1.0.0

## 1. 接手前先讀

1. 先讀根目錄的 `AGENTS.md`。本專案使用 Next.js 16，修改 Next.js 程式前必須參考 `node_modules/next/dist/docs/` 的對應文件。
2. 再讀 `docs/BUILD_JOURNAL.md`，其中保存完整需求 Prompt、設計決策、修正紀錄、測試與部署歷程。
3. 不要把 `.env.local`、OpenAI API Key、Redis Token、Salt、付款資料或使用者貼入的訊息加入 Git、文件或終端輸出。
4. 工作前先執行 `git status --short`；現有變更若不是自己建立的，不要覆寫。

## 2. 專案定位

GuardAI 反詐守門員是參加「2026 TAIA AI 創意設計大賽」高中職組／教育科技領域獎的防詐學習平台。

核心標語：

> 不替你判斷，陪你完成查證。

核心教學流程：

1. 停：不點連結、不匯款、不提供個資。
2. 看：辨認催促、金錢、個資、冒名、保密與陌生連結。
3. 問：產生三個查證問題。
4. 查：改用獨立官方管道確認。
5. 求：產生可交給家人、老師或 165 的求助摘要。

## 3. Repository 與 Production

| 項目 | 目前狀態 |
| --- | --- |
| GitHub | <https://github.com/prayer168/guardai> |
| Branch | `main` |
| 最新功能 Commit | `2c017a9` — `Remove home hero label and improve eval diagnostics` |
| 正式網站 | <https://guardai-olive.vercel.app> |
| Vercel 專案 | `prayer168s-projects/guardai` |
| 最新 Production Deployment | `dpl_6gFd4ebPSjzeERB5q2yCdVge2pwW` |
| 部署方式 | 目前使用 `npx vercel --prod --yes`；GitHub 自動部署尚未完成授權 |

## 4. 已完成的功能

### 4.1 AI 判讀

- `/analyze` 提供六個示範案例與自訂訊息輸入。
- 輸入先遮罩電話、Email、OTP、帳號與卡號等常見格式。
- OpenAI Responses API 只從伺服器端呼叫。
- Structured Outputs 經 JSON Schema 與 Zod 驗證。
- 使用者訊息固定視為待分析資料，不執行其中的 Prompt Injection。
- 不會自動開啟或造訪使用者貼入的網址。
- OpenAI 請求使用 `store: false`、20 秒逾時、停用 SDK 自動重試。
- 即時 AI 失敗時安全回退 Mock，競賽流程不會中斷。
- 分析結果包含風險等級、信心、原文線索、操控手法、三個查證問題、安全行動、學習重點與求助卡。

### 4.2 AI 用量保護

- Vercel Firewall：`POST /api/analyze` 每 IP 每分鐘最多 5 次。
- Upstash Redis：全站每日 200 次、單一匿名訪客每日 40 次。
- 每日依臺北日期重置。
- Redis 或 Salt 無法使用時採 Fail-closed，不呼叫付費 AI，改用 Mock。
- 配額資料只保存日期、不可逆訪客雜湊與計數。

### 4.3 防詐學習

- `/challenge`：六個分支情境、正常訊息案例、即時解釋、查證力分數與能力雷達圖。
- `/passport`：五題前測、六題闖關、五題後測、前後測進步與常忽略概念。
- 個人學習紀錄預設只存在瀏覽器 `localStorage`。

### 4.4 匿名班級後端

- `/teacher` 可建立學生、親子或長者情境包。
- 班級代碼格式為 `GUARD-XXXXXX`，避開 0／O／1／I 等混淆字元。
- `/join` 讓學生不需帳號、姓名、Email 或座號即可加入。
- 學生完成護照後，必須主動按下按鈕才會提交匿名成果。
- 提交欄位只有前測、後測、闖關分數、判讀次數與固定常錯概念。
- 裝置 UUID 只在瀏覽器保存；伺服器加入 Salt 後做 SHA-256，只保存不可逆雜湊。
- 教師只能查看參與人數、完成率、平均與常錯概念，不能查看個別作答或排名。
- 班級、參與集合與成果 Hash 都會在班級建立後 30 天一起到期。
- 建立、加入、提交 API 都有 Redis 端匿名速率限制。

### 4.5 防詐知識庫

- `/knowledge` 包含 14 類詐騙、56 個流程節點、可能結果、因應方式、查證問題與官方來源。
- 14 張宣導主視覺以 OpenAI Images 2.0 生成；圖內沒有可掃描 QR Code、商標或假網址。
- 已串接警政署「165 反詐騙諮詢專線－詐騙闢謠專區」官方 CSV：
  <https://data.gov.tw/dataset/38262>
- `/api/knowledge/official` 每日重新驗證並回傳最新可取得的 6 筆。
- 若 HTTP、Content-Type 或 CSV Schema 改變，官方區塊安全失敗；14 類人工查核內容仍保留。

## 5. 重要資料流程

### 5.1 AI 判讀

```text
瀏覽器輸入
  → POST /api/analyze
  → Zod 輸入驗證
  → 敏感格式遮罩
  → Redis 每日配額
  → OpenAI Responses API 或 Mock
  → JSON Schema / Zod 結果驗證
  → no-store 回傳
```

### 5.2 匿名班級

```text
教師 POST /api/classes
  → Redis 建立 30 天班級
  → 分享 /join?code=...

學生 POST /api/classes/[code]/join
  → UUID + Salt + 班級代碼做不可逆雜湊
  → Redis Set 記錄匿名參與

學生 POST /api/classes/[code]/results
  → Strict Zod Schema
  → Redis Hash 覆寫同一匿名裝置成果

教師 GET /api/classes/[code]
  → 只回傳匿名彙總
```

## 6. 主要檔案

| 功能 | 檔案 |
| --- | --- |
| AI API | `src/app/api/analyze/route.ts` |
| OpenAI 呼叫 | `src/lib/openai-analysis.ts` |
| 系統提示詞 | `src/lib/system-prompt.ts` |
| Mock 分析 | `src/lib/mock-analysis.ts` |
| AI 設定 | `src/lib/ai-config.ts` |
| 每日配額 | `src/lib/usage-limit.ts` |
| Redis Client | `src/lib/redis.ts` |
| 匿名識別雜湊 | `src/lib/private-identifier.ts` |
| 班級 Schema／彙總 | `src/lib/classroom.ts` |
| 班級 Redis 操作 | `src/lib/classroom-store.ts` |
| 教師介面 | `src/components/teacher-dashboard.tsx` |
| 加入班級 | `src/components/classroom-join.tsx` |
| 學習護照 | `src/components/learning-passport.tsx` |
| 知識庫資料 | `src/lib/knowledge.ts` |
| 官方 CSV 解析 | `src/lib/official-rumors.ts` |
| 官方來源抓取 | `src/lib/official-rumors-source.ts` |
| 完整歷程 | `docs/BUILD_JOURNAL.md` |

## 7. 環境變數

只記錄名稱，不記錄值：

- `GUARDAI_AI_MODE`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `GUARDAI_AI_TIMEOUT_MS`
- `GUARDAI_DAILY_LIMIT`
- `GUARDAI_VISITOR_DAILY_LIMIT`
- `GUARDAI_LIMIT_SALT`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

Production 已在 Vercel 設定上述必要變數。不要執行會覆寫 `.env.local` 的 `vercel env pull`；若需診斷，應輸出到另一個被忽略的暫存 env 檔。

## 8. 測試與驗收

目前共有 50 項測試：

- 40 個反詐、正常訊息與 Prompt Injection 情境。
- 敏感資料遮罩與 `GUARDAI_AI_MODE` 切換。
- 匿名班級 Strict Schema、代碼格式、彙總與空資料。
- 官方 CSV 的逗號、引號、多行、排序、截斷與 Schema 變更。

每次修改後至少執行：

```bash
npm run lint
npm test
npx tsc --noEmit
npm run build
```

目前最後結果：

- `npm test`：50／50。
- ESLint：通過。
- TypeScript：通過。
- Production build：通過，共 15 個輸出路由。
- `npm audit --omit=dev`：0 個已知漏洞。
- 390×844 瀏覽器驗收：教師、加入班級、學習護照與知識庫無錯誤 overlay 或 page error。

## 9. 尚未完成／外部阻擋

### P0：OpenAI API 額度

- API Key、Vercel 環境變數、模型與程式都已部署。
- 2026-07-18 使用本機安全保存的真正金鑰實測，約 1.8 秒後回覆 HTTP 429 `insufficient_quota`；請求已到達 OpenAI，但尚未進入內容品質評分。
- Vercel 受保護環境變數以 CLI 下載時會得到 `[SENSITIVE]`，不可拿該值執行本機評測；本次診斷暫存檔已刪除。
- 必須由帳號／專案擁有者在 OpenAI Platform 啟用 API Billing 或購買 API 額度。
- 完成後不需重新建立金鑰；先用 `GUARDAI_LIVE_EVAL_LIMIT=5` 執行冒煙測試，通過後再跑完整 40 案例。
- `tests/run-live-eval.ts` 已能顯示每題延遲、HTTP 狀態與錯誤代碼，並會遮罩疑似 API Key。
- 未啟用額度前，Production 會安全回退 Mock。

### P1：實際教學成效

- 需要真實進班或家庭試用。
- 只能收集匿名統計與經同意的質性回饋。
- 報告必須記錄樣本數、日期、課程情境與限制，不可把 Demo 數據當成實證。

### P2：自動化與維運

- GitHub → Vercel 自動部署尚未完成授權，目前為 CLI 手動部署。
- 尚未建立 GitHub Actions／Playwright E2E CI。
- 應持續監測 165 官方 CSV 的資源網址、欄位與更新頻率。

## 10. 不可破壞的安全原則

1. 絕不保存使用者貼入的原始可疑訊息。
2. 絕不在前端、Git、文件或 log 中暴露 API Key／Redis Token／Salt。
3. 不自動點擊或伺服器端造訪使用者訊息裡的網址。
4. 不輸出「百分之百安全」或「一定是詐騙」。
5. 不把 AI 結果當成警方、金融機構或法律上的最終認定。
6. 不建立公開學生排行榜或個人風險標籤。
7. 匿名班級不得增加姓名、座號、Email、電話、自由回答或可疑訊息欄位。
8. 外部官方資料失敗時，顯示不可用或使用已查核內容，不猜測解析、不用第三方未驗證資料替代。
9. 高風險時優先顯示停止操作、獨立官方查證、可信任成人與 165。

## 11. 建議下一次接手順序

1. 執行 `git status --short`、`git log -3 --oneline`。
2. 確認 <https://guardai-olive.vercel.app> 與主要 API 健康。
3. 詢問專案擁有者是否已完成 OpenAI API Billing。
4. 若已完成，先跑 3–5 個即時案例，再逐步擴大到 40 個。
5. 若尚未完成 Billing，優先建立 Playwright E2E／GitHub Actions 或規劃匿名進班試用，不要反覆建立新 API Key。
6. 每次功能完成後同步更新本文件與 `docs/BUILD_JOURNAL.md`。
