# GuardAI 0.5.0 決賽優化測試報告

測試日期：2026-10-05 至 2026-10-06（Asia/Taipei）

測試版本：0.5.0，已部署 Production

框架版本：Next.js 16.3.8 Active LTS、React／React DOM 19.3.0

正式網站：<https://guardai-olive.vercel.app>

驗證用部署：`dpl_7Hwe8QRS5oo2EMtZze9sypqMu3wK`（Ready，2026-10-06）

瀏覽器工具：agent-browser 0.33.0（Chromium）

## 1. 測試範圍

- `/showcase` 八段競賽展示與三種角色情境。
- `/guardai-offline-demo.html` 單檔離線備援。
- `/analyze` 真正斷網時的錯誤復原。
- `/privacy` AI 資料流程、Prompt 與 Schema 說明。
- `/teacher` Demo／真實試用證據分區。
- 桌機 1440×1000、平板 768×1024、手機 390×844。
- 滑鼠、鍵盤、觸控尺寸、reduced-motion、水平溢出、錯誤 overlay 與失敗請求。

## 2. 自動化品質門檻

| 項目 | 指令 | 結果 |
| --- | --- | --- |
| ESLint | `npm run lint` | 通過 |
| TypeScript | `npm run typecheck` | 通過 |
| 單元測試 | `npm test` | 53／53 通過 |
| Production build | `npm run build` | 通過，共 16 個輸出路由 |
| Production dependency audit | `npm audit --omit=dev` | 通過，0 個已知漏洞 |
| Diff whitespace | `git diff --check` | 通過；只有既有 Windows LF／CRLF 提示 |

53 項測試中，40 項是合成反詐／正常訊息／Prompt Injection 對程式規則與 Schema 的測試。這些結果不是即時生成式 AI 準確率。

## 3. 展示流程驗收

| 驗收項目 | 結果 | 證據 |
| --- | --- | --- |
| 首頁可進入競賽展示 | 通過 | 首頁 CTA 與主導覽皆有 `/showcase` |
| 3–5 分鐘流程 | 通過 | 八步建議時間合計 270 秒，約 4.5 分鐘 |
| 問題→訊息→線索→三問→行動→求助→成效→技術 | 通過 | 實際逐步點擊並可直接選擇任一步 |
| 一鍵載入示範案例 | 通過 | 第一步可直接進入內嵌合成案例 |
| 上一步／下一步／重設 | 通過 | 按鈕均改變真實狀態；重設回第一步與學生情境 |
| 模式標示 | 通過 | 固定顯示「目前模式：安全 Demo 引擎」 |
| 三種情境 | 通過 | 學生、親子／長者、教師頁籤均可切換 |
| 求助摘要 | 通過 | 可複製；無剪貼簿權限時顯示人工選取說明 |

## 4. 離線與失敗備援

| 情境 | 結果 | 說明 |
| --- | --- | --- |
| `/showcase` 載入後切為 browser offline | 通過 | 仍可從第一步進入第二步，無 API、無 overlay、無水平溢出 |
| 單檔 HTML 以 HTTP 載入後離線 | 通過 | 仍可前進；沒有外部 script、stylesheet 或圖片 |
| 單檔 HTML 直接以 `file://` 開啟 | 通過 | offline 狀態可操作；Resource Timing 為 0 |
| `/analyze` 送出時斷網 | 通過 | 顯示繁中說明與「改用離線競賽展示」，不顯示 `Failed to fetch` |
| OpenAI／額度／逾時 | 既有備援 | 伺服器可回退 Mock；正式站目前約需等待 timeout，競賽展示不走此路徑 |
| 165 官方資料失敗 | 既有備援 | 14 類人工查核知識內容仍可使用 |

## 5. 響應式與無障礙

| Viewport／方式 | 結果 |
| --- | --- |
| 1440×1000 | 展示步驟 1、步驟 8與隱私頁無水平溢出、無錯誤 overlay |
| 768×1024 | 風險線索與教師證據區塊無水平溢出、無文字重疊 |
| 390×844 | 步驟 1、步驟 8、離線復原與單檔備援可操作，無頁面水平溢出 |
| 鍵盤 | Tab 依序到跳至內容、品牌、手機選單、重設與下載；Enter 可開啟手機導覽 |
| 觸控 | 主要按鈕至少 48px 高；步驟列放在獨立可水平捲動容器 |
| reduced-motion | `matchMedia` 實測為 true；全域 CSS 停用 smooth scroll 與非必要動畫 |
| 標題語意 | 每頁只有一個 `h1`；展示區段由 `h2`／`h3` 分層 |
| 風險表達 | 同時使用文字、圖示與說明，不只靠顏色 |

## 6. 截圖證據

修改前基線：`docs/screenshots/2026-10-finalist-optimization/00-baseline/`

實作中證據：`docs/screenshots/2026-10-finalist-optimization/01-implementation/`

- `showcase-step-1-1440x1000.png`
- `showcase-step-8-1440x1000.png`
- `showcase-step-3-768x1024.png`
- `showcase-step-1-390x844.png`
- `showcase-step-8-390x844.png`
- `showcase-offline-step-2-390x844.png`
- `analyze-offline-recovery-390x844.png`
- `offline-single-file-390x844.png`
- `privacy-ai-safety-1440x1000.png`
- `teacher-evidence-768x1024.png`

最終候選版本已保存：

- `02-final-verification/home-showcase-entry-1440x1000.png`
- `02-final-verification/showcase-step-1-1440x1000.png`
- `02-final-verification/showcase-step-3-768x1024.png`
- `02-final-verification/showcase-step-8-390x844.png`

正式站實機截圖已保存：

- `03-production/home-1440x1000.png`
- `03-production/showcase-step1-1440x1000.png`
- `03-production/showcase-step8-390x844.png`
- `03-production/showcase-step8-top-390x844.png`
- `03-production/offline-demo-step2-390x844.png`

## 7. Production 公開網址驗收

| 項目 | 結果 |
| --- | --- |
| Vercel 狀態 | Ready；build duration 39 秒 |
| 公開路由 | `/`、`/showcase`、`/guardai-offline-demo.html`、`/privacy`、`/teacher` 全部 HTTP 200 |
| 公開資料 API | `/api/knowledge`、`/api/knowledge/official` 全部 HTTP 200 |
| 桌面展示 | 1 個 `h1`、8 個步驟、安全 Demo 標示、無水平溢出、無錯誤 overlay |
| 390×844 | AI 技術／評測頁可操作，無水平溢出、無錯誤 overlay，reduced-motion 生效 |
| 載入後斷網 | `/showcase` 可重新開始並回到學生情境；單檔備援可前進到第 2 步 |
| WCAG 自動掃描 | axe-core 4.12.1；WCAG 2 A／AA 違規 0、待人工確認 0 |
| Runtime error log | 最近一小時無 error 記錄 |

## 8. 尚未通過／不得宣稱

- OpenAI API Billing／額度尚未可用，因此完整 40 題即時生成式 AI 評測仍為「待完成」。
- 沒有可公開的真實學生、家庭或長者試用資料，不宣稱人數、進步率、滿意度或成效。
- Production 已通過本報告列出的技術與展示驗收；這不等於真實教學成效或即時模型準確率已被證明。

### 開發工具鏈公告

完整 `npm audit` 仍會列出 ESLint 開發工具鏈的 `braces` 公告；目前上游沒有非破壞性修正版，audit 建議的 `--force` 會把 `eslint-config-next` 降級至 14.x，因此未採用。此套件不會進入 Production bundle；正式部署依賴的 `npm audit --omit=dev` 已是 0。後續 Next.js／ESLint 發布修正版時再更新。
