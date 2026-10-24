"use client";

import { AlertTriangle, Bot, CheckCircle2, Database, EyeOff, LockKeyhole, Phone, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { PresentationFrame } from "@/components/presentation-frame";

const slides = ["資料原則", "訊息處理", "AI 安全", "公開界線", "匿名評量", "真人求助"] as const;

const privacyPrinciples = [
  { icon: EyeOff, title: "先遮罩個資", description: "不要貼姓名、帳號、密碼、信用卡或 OTP。系統會先遮罩常見敏感資料。", tone: "sand" },
  { icon: Database, title: "訊息不存入資料庫", description: "GuardAI 不會永久保存你貼上的訊息。匿名用量紀錄到期自動刪除。", tone: "sage" },
  { icon: LockKeyhole, title: "評量分享由你決定", description: "只有你同意，前後測分數與錯誤概念才會匿名統計；最多保留 30 天。", tone: "blue" },
  { icon: Bot, title: "AI 不是最後裁判", description: "AI 可能判斷錯誤。重要事情請從官方管道查證，或找真人一起確認。", tone: "rose" },
] as const;

const processSteps = [
  ["輸入訊息", "只分析文字，不會開啟訊息中的網址。"],
  ["先遮罩個資", "遮掉常見電話、Email、驗證碼與卡號。"],
  ["安全分析", "即時 AI 會把遮罩後文字送至 OpenAI；離線 Demo 不會。"],
  ["提供下一步", "整理風險線索、查證問題與安全行動。"],
] as const;

const aiSafetyRules = [
  ["不照訊息指令做", "把訊息當資料分析，不執行其中要求。"],
  ["不開啟可疑網址", "不點擊、不登入，也不替你操作連結。"],
  ["不確定就說不確定", "證據不足時，不直接判定真假。"],
  ["先檢查再顯示", "分析結果通過格式與內容檢查才會呈現。"],
] as const;

export function PrivacyExperience() {
  const [page, setPage] = useState(0);
  const previous = () => setPage((value) => (value - 1 + slides.length) % slides.length);
  const next = () => setPage((value) => (value + 1) % slides.length);

  return (
    <PresentationFrame title="隱私與 AI" subtitle="資料最小化、可解釋結果與真人求助" pageNumber={page + 1} pageCount={slides.length} pageLabel={slides[page]} onPrevious={previous} onNext={next}>
      <div className="privacy-presentation-body">
        {page === 0 ? (
          <section className="privacy-slide-grid" aria-labelledby="privacy-principles-title">
            <h1 id="privacy-principles-title" className="privacy-slide-title">使用 GuardAI，先記住四件事</h1>
            <div className="privacy-principle-grid">
              {privacyPrinciples.map(({ icon: Icon, title, description, tone }) => <article key={title} className={`privacy-principle-card privacy-tone-${tone}`}><span><Icon aria-hidden="true" /></span><h2>{title}</h2><p>{description}</p></article>)}
            </div>
          </section>
        ) : null}

        {page === 1 ? (
          <section className="privacy-slide-grid" aria-labelledby="privacy-flow-title">
            <h1 id="privacy-flow-title" className="privacy-slide-title">你的訊息會經過四個步驟</h1>
            <ol className="privacy-flow-grid">
              {processSteps.map(([title, description], index) => <li key={title}><span>{index + 1}</span><div><strong>{title}</strong><p>{description}</p></div></li>)}
            </ol>
            <p className="privacy-note privacy-note-emphasis">即時 AI 會將遮罩後文字傳給 OpenAI 分析。GuardAI 不保存訊息內容；用量管理只暫存匿名代碼與日期，期限到後自動刪除。</p>
          </section>
        ) : null}

        {page === 2 ? (
          <section className="privacy-slide-grid" aria-labelledby="privacy-ai-title">
            <h1 id="privacy-ai-title" className="privacy-slide-title">AI 判讀時，GuardAI 會守住這些界線</h1>
            <div className="privacy-security-grid">
              {aiSafetyRules.map(([title, description], index) => <article key={title} className={`privacy-security-card privacy-rule-${index + 1}`}><span className="privacy-rule-number">0{index + 1}</span><div><h2>{title}</h2><p>{description}</p></div></article>)}
            </div>
            <p className="privacy-note privacy-note-alert"><AlertTriangle aria-hidden="true" />AI 可能誤判或漏判；重要決定請先查官方來源，必要時找真人協助。</p>
          </section>
        ) : null}

        {page === 3 ? (
          <section className="privacy-slide-grid" aria-labelledby="privacy-boundary-title">
            <h1 id="privacy-boundary-title" className="privacy-slide-title">安全機制公開，祕密金鑰不公開</h1>
            <div className="privacy-boundary-grid">
              <article className="privacy-boundary-safe"><ShieldCheck aria-hidden="true" /><h2>可以放心了解</h2><p>哪些資料會被遮罩、訊息如何處理，以及 AI 有哪些限制。</p></article>
              <article className="privacy-boundary-secret"><LockKeyhole aria-hidden="true" /><h2>絕不放在畫面上</h2><p>API Key、資料庫 Token 和其他可登入服務的祕密金鑰。</p></article>
              <article className="privacy-boundary-ai"><Bot aria-hidden="true" /><h2>務必記得</h2><p>AI 分析只是提醒，不是警方、銀行或法律的最終認定。</p></article>
            </div>
          </section>
        ) : null}

        {page === 4 ? (
          <section className="privacy-slide-grid privacy-class-slide" aria-labelledby="privacy-class-title">
            <div className="privacy-class-card">
              <p className="privacy-mini-kicker">匿名評量</p>
              <h1 id="privacy-class-title" className="privacy-slide-title">不必提供身分資料，也能參與</h1>
              <div className="privacy-class-points">
                <article><EyeOff aria-hidden="true" /><strong>不需登入</strong><p>不填姓名、班級或座號。</p></article>
                <article><CheckCircle2 aria-hidden="true" /><strong>自願分享</strong><p>同意後才送出分數與錯誤概念。</p></article>
                <article><Database aria-hidden="true" /><strong>最多保存 30 天</strong><p>可取消同意並刪除已提交資料。</p></article>
                <article><ShieldCheck aria-hidden="true" /><strong>只看群體趨勢</strong><p>至少 5 個匿名代碼才顯示統計。</p></article>
              </div>
            </div>
          </section>
        ) : null}

        {page === 5 ? (
          <section className="privacy-slide-grid" aria-labelledby="privacy-help-title">
            <div className="privacy-help-card">
              <span><Phone aria-hidden="true" /></span>
              <div><p className="privacy-mini-kicker">真人求助</p><h1 id="privacy-help-title">遇到詐騙，先停下來找人幫忙</h1><p>停止付款、保留紀錄，找可信任的人一起處理。反詐騙諮詢請撥 165；有立即危險請撥 110。</p></div>
              <a className="button button-light" href="tel:165">撥打 165</a>
            </div>
          </section>
        ) : null}
      </div>
    </PresentationFrame>
  );
}
