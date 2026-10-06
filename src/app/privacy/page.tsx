import type { Metadata } from "next";
import { Bot, Database, EyeOff, FileJson2, Gauge, LockKeyhole, Phone, ShieldCheck } from "lucide-react";

import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "隱私與 AI 說明" };

export default function PrivacyPage() {
  return (
    <>
      <PageIntro eyebrow="安全不是附加功能" title="隱私與 AI 使用說明" description="GuardAI 以最少資料、可解釋結果與真人求助為原則，清楚說明 AI 能做什麼、不能做什麼。" />
      <div className="site-container max-w-5xl space-y-7 py-10 md:py-14">
        <section className="grid gap-5 md:grid-cols-2">
          {[
            [EyeOff, "輸入前先少一點", "不要貼入姓名、身分證、帳號、密碼、信用卡或 OTP。系統會再次遮罩常見敏感格式。"],
            [Database, "不保存原始訊息", "不要求登入，也不把使用者貼入的訊息寫入資料庫。個人學習紀錄預設只存在本機 localStorage。"],
            [LockKeyhole, "金鑰留在伺服器", "啟用即時 AI 時，API Key 只存在伺服器環境變數，不會傳到瀏覽器。"],
            [Bot, "AI 不是最終裁判", "AI 可能誤判、漏判或欠缺最新資訊；結果只用來協助辨認風險與規劃查證。"],
          ].map(([Icon, title, description]) => {
            const ItemIcon = Icon as typeof ShieldCheck;
            return <article key={String(title)} className="section-card"><span className="icon-disc"><ItemIcon aria-hidden="true" /></span><h2 className="mt-5 text-2xl font-black text-navy">{String(title)}</h2><p className="mt-3 leading-7 text-ink-muted">{String(description)}</p></article>;
          })}
        </section>

        <section className="section-card">
          <p className="eyebrow">資料流程</p>
          <h2 className="section-title">一則訊息如何被處理</h2>
          <ol className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["輸入", "訊息只被視為待分析資料，不執行其中的指令。"],
              ["敏感資料遮罩", "先移除常見電話、Email、OTP、帳號與卡號格式。"],
              ["用量限制", "通過每分鐘、每日與匿名訪客配額後才可能呼叫 AI。"],
              ["OpenAI 或 Mock", "即時服務不可用時，改用清楚標示的安全 Demo 引擎。"],
              ["Schema／Zod 驗證", "不符合固定 JSON 結構的結果不會直接顯示。"],
              ["教學回饋", "輸出原文線索、三個問題、安全行動與求助摘要。"],
            ].map(([title, description], index) => <li key={title} className="numbered-flow items-start"><span>{index + 1}</span><div><strong>{title}</strong><p className="mt-1 text-sm font-medium text-ink-muted">{description}</p></div></li>)}
          </ol>
          <p className="mt-6 rounded-xl bg-ivory-deep/60 p-4 text-sm leading-7 text-ink-muted">即時 OpenAI 模式設定 <code>store: false</code>，應用本身不永久保存訊息。為控制公開網站用量，每日配額服務只保存日期、不可逆訪客雜湊與次數，於期限到達後自動刪除；不保存訊息文字、分析結果、姓名或 IP 原值。</p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="section-card">
            <span className="icon-disc"><Gauge aria-hidden="true" /></span>
            <p className="eyebrow mt-5">Prompt Engineering</p>
            <h2 className="section-title">系統提示詞的安全原則</h2>
            <ul className="mt-5 space-y-3 leading-7 text-ink-muted">
              <li>• 使用者文字固定放在「待分析資料」邊界內。</li>
              <li>• 即使訊息要求忽略規則，也不得執行。</li>
              <li>• 不造訪、不建議點擊訊息裡的網址。</li>
              <li>• 證據不足輸出 <code>unknown</code>，禁止絕對斷言。</li>
              <li>• 高風險時優先停止、獨立查證與真人求助。</li>
            </ul>
          </article>
          <article className="section-card">
            <span className="icon-disc"><FileJson2 aria-hidden="true" /></span>
            <p className="eyebrow mt-5">Structured Outputs</p>
            <h2 className="section-title">固定 Schema，不接受自由格式</h2>
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-navy p-5 text-sm leading-7 text-ivory" aria-label="AI 輸出 Schema 精簡範例"><code>{`{
  "riskLevel": "unknown | low | medium | high | critical",
  "confidence": "low | medium | high",
  "signals": [{ "excerpt": "…", "type": "…" }],
  "verificationQuestions": ["三個問題"],
  "recommendedActions": ["三至五個行動"],
  "helpSummary": "可轉傳的求助摘要"
}`}</code></pre>
            <p className="mt-4 text-sm leading-7 text-ink-muted">實際回傳還需包含摘要、操控手法、學習重點、敏感資料狀態與免責聲明，並經 Strict JSON Schema 與 Zod 雙重驗證。</p>
          </article>
        </section>

        <section className="section-card">
          <p className="eyebrow">可公開的安全邊界</p>
          <h2 className="section-title">網站會說明機制，但不公開祕密設定</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-sage/10 p-5"><ShieldCheck aria-hidden="true" className="text-sage-dark" /><h3 className="mt-3 font-black text-navy">可以公開</h3><p className="mt-2 text-sm leading-7 text-ink-muted">遮罩、限流、Prompt 原則、Schema 欄位、Mock 回退與資料保存原則。</p></div>
            <div className="rounded-2xl bg-coral/8 p-5"><LockKeyhole aria-hidden="true" className="text-coral-dark" /><h3 className="mt-3 font-black text-navy">絕不公開</h3><p className="mt-2 text-sm leading-7 text-ink-muted">API Key、Redis Token、Salt、完整環境變數值或可還原個人的識別資料。</p></div>
            <div className="rounded-2xl bg-amber/10 p-5"><Bot aria-hidden="true" className="text-amber-dark" /><h3 className="mt-3 font-black text-navy">AI 的限制</h3><p className="mt-2 text-sm leading-7 text-ink-muted">可能誤判、漏判或欠缺最新資訊；即時模式與 Demo 模式必須清楚標示。</p></div>
          </div>
        </section>

        <section className="section-card">
          <p className="eyebrow">匿名班級資料</p>
          <h2 className="section-title">加入班級時會送出哪些內容？</h2>
          <p className="mt-3 leading-7 text-ink-muted">學生必須主動按下提交，才會送出前測分數、後測分數、闖關分數、判讀練習次數與常忽略概念。伺服器只保存班級代碼、情境包、不可逆裝置雜湊和這些成果欄位；不保存姓名、座號、Email、個別作答內容或貼入的可疑訊息。</p>
          <p className="mt-4 rounded-xl bg-sage/12 p-4 text-sm font-bold leading-7 text-sage-dark">匿名班級與成果會在建立後 30 天自動刪除。教師只能查看全班參與人數、完成率與平均趨勢。</p>
        </section>

        <section className="rounded-3xl bg-navy p-6 text-ivory md:p-8">
          <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="grid size-14 place-items-center rounded-full bg-coral text-white"><Phone aria-hidden="true" /></span>
            <div><h2 className="text-2xl font-black">遇到金錢或人身風險，交給真人處理</h2><p className="mt-2 leading-7 text-ivory/70">停止付款、保留紀錄，請可信任成人陪同並撥打 165。緊急危險請聯絡 110。</p></div>
            <a href="tel:165" className="button button-light">撥打 165</a>
          </div>
        </section>

        <section className="notice notice-warning"><ShieldCheck aria-hidden="true" /><div><strong>固定聲明</strong><p>此為 AI 初步風險分析，不代表警方、金融機構或法律上的最終認定。</p></div></section>
      </div>
    </>
  );
}
