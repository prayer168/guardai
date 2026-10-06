# GuardAI 驗收與影片素材截圖

本資料夾保存 GuardAI 重要版本的實際瀏覽器畫面，供競賽驗收、問題回溯、成果報告與 YouTube 製作使用。

## 命名與資料夾規則

- 每一輪重要改版使用日期與主題建立資料夾。
- 子資料夾依 `00-baseline`、`01-implementation`、`02-final-verification`、`03-production` 排序。
- 檔名包含頁面、狀態與 viewport，例如 `showcase-step-3-1440x1000.png`。
- 錯誤修正保留 before／after，不能只留下修正後畫面。
- 截圖不得包含 API Key、Token、Salt、真實個資或使用者貼入的原始可疑訊息。

## 2026-10 決賽優化

`2026-10-finalist-optimization/00-baseline/` 保存修改前的正式站基線：

- `home-1440x1000.png`
- `analysis-result-1440x1000.png`
- `teacher-768x1024.png`
- `analysis-result-390x844.png`

後續實作與最終驗收截圖會持續加入同一主題資料夾，並同步更新 `history.md` 與 `docs/test-report.md`。

`2026-10-finalist-optimization/01-implementation/` 保存實作中桌機、平板、手機、AI 技術說明、教師證據、分析頁斷網復原與單檔離線操作畫面。

`2026-10-finalist-optimization/02-final-verification/` 保存 Next.js 16.3.8 安全升級後的最終候選畫面：

- `home-showcase-entry-1440x1000.png`
- `showcase-step-1-1440x1000.png`
- `showcase-step-3-768x1024.png`
- `showcase-step-8-390x844.png`

`2026-10-finalist-optimization/03-production/` 保存 2026-10-06 正式部署後，從 <https://guardai-olive.vercel.app> 重新擷取的實機畫面：

- `home-1440x1000.png`
- `showcase-step1-1440x1000.png`
- `showcase-step8-390x844.png`
- `showcase-step8-top-390x844.png`
- `offline-demo-step2-390x844.png`

## 2026-10 決賽簡報優化

`2026-10-finalist-presentation/` 保存原送審簡報與入圍後優化版的視覺證據：

- `before-original-montage.webp`：原 16 張簡報總覽。
- `after-final-montage-v2.webp`：第一輪最後視覺檢查後的 montage。
- `after-final-montage-v5.webp`：修正第 12 頁標題擁擠與第 13 頁情境列點後的最終 16 張總覽。
- `slide-08-demo-flow.png`：3–5 分鐘正式 Demo 流程。
- `slide-11-ai-depth.png`：Prompt、Structured Outputs、隱私與備援。
- `slide-12-edtech-evidence.png`：學習目標、練習、回饋、評量與教師端。
- `slide-14-validation-boundary.png`：程式測試、規則案例與真人成效的證據邊界。
- `slide-16-sources.png`：官方來源與可驗證連結。

畫面可用於 YouTube 建置歷程、競賽口頭報告與成果發表。第 12 頁的 Demo 模擬數字不可當作真人研究結果。
