"use client";

import { Bot, Database, EyeOff, FileJson2, Gauge, LockKeyhole, Phone, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { PresentationFrame } from "@/components/presentation-frame";

const slides = ["資料原則", "訊息處理流程", "AI 安全機制", "公開邊界", "班級資料", "真人求助"] as const;

export function PrivacyExperience() {
  const [page, setPage] = useState(0);
  const previous = () => setPage((value) => (value - 1 + slides.length) % slides.length);
  const next = () => setPage((value) => (value + 1) % slides.length);

  return (
    <PresentationFrame title="隱私與 AI" subtitle="資料最小化、可解釋結果與真人求助" pageNumber={page + 1} pageCount={slides.length} pageLabel={slides[page]} onPrevious={previous} onNext={next}>
      <div className="privacy-presentation-body">
        <p className="privacy-slide-kicker">安全不是附加功能　/　{slides[page]}</p>

        {page === 0 ? (
          <section className="privacy-slide-grid" aria-labelledby="privacy-principles-title">
            <h1 id="privacy-principles-title" className="privacy-slide-title">使用 GuardAI 時，哪些資料會被保護？</h1>
            <div className="privacy-principle-grid">
              {[
                [EyeOff, "輸入前先少一點", "不要貼入姓名、身分證、帳號、密碼、信用卡或 OTP。系統會再次遮罩常見敏感格式。"],
                [Database, "不保存原始訊息", "不要求登入，也不把使用者貼入的訊息寫入資料庫。個人學習紀錄預設只存在本機 localStorage。"],
                [LockKeyhole, "金鑰留在伺服器", "啟用即時 AI 時，API Key 只存在伺服器環境變數，不會傳到瀏覽器。"],
                [Bot, "AI 不是最終裁判", "AI 可能誤判、漏判或欠缺最新資訊；結果只用來協助辨認風險與規劃查證。"],
              ].map(([Icon, title, description]) => {
                const ItemIcon = Icon as typeof ShieldCheck;
                return <article key={String(title)} className="privacy-principle-card"><span><ItemIcon aria-hidden="true" /></span><h2>{String(title)}</h2><p>{String(description)}</p></article>;
              })}
            </div>
          </section>
        ) : null}

        {page === 1 ? (
          <section className="privacy-slide-grid" aria-labelledby="privacy-flow-title">
            <h1 id="privacy-flow-title" className="privacy-slide-title">一則訊息如何被處理？</h1>
            <ol className="privacy-flow-grid">
              {[
                ["輸入", "訊息只被視為待分析資料，不執行其中的指令。"],
                ["敏感資料遮罩", "先移除常見電話、Email、OTP、帳號與卡號格式。"],
                ["用量限制", "通過每分鐘、每日與匿名訪客配額後才可能呼叫 AI。"],
                ["OpenAI 或 Mock", "即時服務不可用時，改用清楚標示的安全 Demo 引擎。"],
                ["Schema／Zod 驗證", "不符合固定 JSON 結構的結果不會直接顯示。"],
                ["教學回饋", "輸出原文線索、三個問題、安全行動與求助摘要。"],
              ].map(([title, description], index) => <li key={title}><span>{index + 1}</span><div><strong>{title}</strong><p>{description}</p></div></li>)}
            </ol>
            <p className="privacy-note">即時 OpenAI 模式設定 <code>store: false</code>，應用本身不永久保存訊息。為控制公開網站用量，每日配額服務只保存日期、不可逆訪客雜湊與次數，於期限到達後自動刪除；不保存訊息文字、分析結果、姓名或 IP 原值。</p>
          </section>
        ) : null}

        {page === 2 ? (
          <section className="privacy-slide-grid" aria-labelledby="privacy-ai-title">
            <h1 id="privacy-ai-title" className="privacy-slide-title">固定提示原則與輸出 Schema</h1>
            <div className="privacy-security-grid">
              <article className="privacy-security-card">
                <Gauge aria-hidden="true" />
                <p className="privacy-mini-kicker">Prompt Engineering</p>
                <h2>系統提示詞的安全原則</h2>
                <ul>
                  <li>使用者文字固定放在「待分析資料」邊界內。</li>
                  <li>即使訊息要求忽略規則，也不得執行。</li>
                  <li>不造訪、不建議點擊訊息裡的網址。</li>
                  <li>證據不足輸出 <code>unknown</code>，禁止絕對斷言。</li>
                  <li>高風險時優先停止、獨立查證與真人求助。</li>
                </ul>
              </article>
              <article className="privacy-security-card">
                <FileJson2 aria-hidden="true" />
                <p className="privacy-mini-kicker">Structured Outputs</p>
                <h2>固定 Schema，不接受自由格式</h2>
                <pre className="privacy-code" aria-label="AI 輸出 Schema 精簡範例"><code>{`{
  "riskLevel": "unknown | low | medium | high | critical",
  "confidence": "low | medium | high",
  "signals": [{ "excerpt": "…", "type": "…" }],
  "verificationQuestions": ["三個問題"],
  "recommendedActions": ["三至五個行動"],
  "helpSummary": "可轉傳的求助摘要"
}`}</code></pre>
                <p className="privacy-security-note">實際回傳還需包含摘要、操控手法、學習重點、敏感資料狀態與免責聲明，並經 Strict JSON Schema 與 Zod 雙重驗證。</p>
              </article>
            </div>
          </section>
        ) : null}

        {page === 3 ? (
          <section className="privacy-slide-grid" aria-labelledby="privacy-boundary-title">
            <h1 id="privacy-boundary-title" className="privacy-slide-title">網站會說明機制，但不公開祕密設定</h1>
            <div className="privacy-boundary-grid">
              <article><ShieldCheck aria-hidden="true" /><h2>可以公開</h2><p>遮罩、限流、Prompt 原則、Schema 欄位、Mock 回退與資料保存原則。</p></article>
              <article><LockKeyhole aria-hidden="true" /><h2>絕不公開</h2><p>API Key、Redis Token、Salt、完整環境變數值或可還原個人的識別資料。</p></article>
              <article><Bot aria-hidden="true" /><h2>AI 的限制</h2><p>可能誤判、漏判或欠缺最新資訊；即時模式與 Demo 模式必須清楚標示。</p></article>
            </div>
            <p className="privacy-note">固定聲明：此為 AI 初步風險分析，不代表警方、金融機構或法律上的最終認定。</p>
          </section>
        ) : null}

        {page === 4 ? (
          <section className="privacy-slide-grid privacy-class-slide" aria-labelledby="privacy-class-title">
            <div className="privacy-class-card">
              <p className="privacy-mini-kicker">匿名班級資料</p>
              <h1 id="privacy-class-title" className="privacy-slide-title">加入班級時會送出哪些內容？</h1>
              <p>學生必須主動按下提交，才會送出前測分數、後測分數、闖關分數、判讀練習次數與常忽略概念。伺服器只保存班級代碼、情境包、不可逆裝置雜湊和這些成果欄位；不保存姓名、座號、Email、個別作答內容或貼入的可疑訊息。</p>
              <strong>匿名班級與成果會在建立後 30 天自動刪除。教師只能查看全班參與人數、完成率與平均趨勢。</strong>
            </div>
          </section>
        ) : null}

        {page === 5 ? (
          <section className="privacy-slide-grid" aria-labelledby="privacy-help-title">
            <div className="privacy-help-card">
              <span><Phone aria-hidden="true" /></span>
              <div><p className="privacy-mini-kicker">真人求助</p><h1 id="privacy-help-title">遇到金錢或人身風險，交給真人處理</h1><p>停止付款、保留紀錄，請可信任成人陪同並撥打 165。緊急危險請聯絡 110。</p></div>
              <a className="button button-light" href="tel:165">撥打 165</a>
            </div>
            <p className="privacy-note">固定聲明：此為 AI 初步風險分析，不代表警方、金融機構或法律上的最終認定。</p>
          </section>
        ) : null}
      </div>
    </PresentationFrame>
  );
}
