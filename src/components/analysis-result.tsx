"use client";

import { Check, Clipboard, ExternalLink, GraduationCap, HelpCircle, MessageSquareQuote, RefreshCw, ShieldAlert, X } from "lucide-react";
import { useState } from "react";

import { RiskBadge } from "@/components/risk-badge";
import type { AnalysisResult, SignalType } from "@/lib/analysis";

const signalLabels: Record<SignalType, string> = {
  urgency: "催促與限時",
  money: "金錢要求",
  personal_data: "個資要求",
  link: "陌生連結",
  authority: "冒用權威",
  secrecy: "要求保密",
  reward: "不合理獎勵",
  relationship: "關係與情感",
};

const confidenceLabels = { low: "低", medium: "中", high: "高" } as const;

type AnalysisResultProps = {
  result: AnalysisResult;
  mode: "live" | "mock";
  maskedMessage: string;
  notice: string;
  onReset: () => void;
};

export function AnalysisResultView({ result, mode, maskedMessage, notice, onReset }: AnalysisResultProps) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyHelpSummary() {
    await navigator.clipboard.writeText(result.helpSummary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-xl shadow-navy/5">
        <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
          <RiskBadge level={result.riskLevel} />
          <div>
            <p className="text-sm font-bold text-ink-muted">AI 信心程度：{confidenceLabels[result.confidence]}</p>
            <h2 tabIndex={-1} className="mt-1 text-2xl font-black leading-snug text-navy md:text-3xl">
              {result.summary}
            </h2>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${mode === "live" ? "bg-sage/15 text-sage-dark" : "bg-gold/15 text-gold-dark"}`}>
            {mode === "live" ? "即時 AI" : "離線 Demo"}
          </span>
        </div>
        <div className="border-t border-navy/10 bg-ivory-deep/45 px-6 py-4 text-sm text-ink-muted md:px-8">
          {notice}
        </div>
      </section>

      {result.sensitiveDataDetected ? (
        <div className="notice notice-info" role="status">
          <ShieldAlert aria-hidden="true" />
          <div>
            <strong>已先遮罩可能的敏感資料</strong>
            <p>完整電話、Email、信用卡或驗證碼不會顯示在分析結果中。</p>
          </div>
        </div>
      ) : null}

      <section className="section-card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">看｜找到證據</p>
            <h2 className="section-title">這些片段為什麼需要注意？</h2>
          </div>
          <span className="metric-pill">{result.signals.length} 項線索</span>
        </div>

        {result.signals.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {result.signals.map((signal) => (
              <article key={`${signal.type}-${signal.excerpt}`} className="signal-card">
                <span className="signal-label">{signalLabels[signal.type]}</span>
                <blockquote>「{signal.excerpt}」</blockquote>
                <p>{signal.explanation}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-ivory-deep/60 p-5 leading-7 text-ink-muted">
            目前沒有足夠的原文證據可以列出具體警示。這不代表安全，請繼續從獨立官方管道確認來源。
          </p>
        )}

        {result.manipulationTactics.length ? (
          <div className="mt-6 flex flex-wrap gap-2" aria-label="可能使用的心理操控方式">
            {result.manipulationTactics.map((tactic) => (
              <span key={tactic} className="rounded-full border border-coral/20 bg-coral/8 px-3 py-2 text-sm font-bold text-coral-dark">
                {tactic}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="section-card">
          <p className="eyebrow">問｜拆解話術</p>
          <h2 className="section-title">先問這三件事</h2>
          <ol className="mt-6 space-y-4">
            {result.verificationQuestions.map((question, index) => (
              <li key={question} className="numbered-item">
                <span>{index + 1}</span>
                <p>{question}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="section-card">
          <p className="eyebrow">查｜安全行動</p>
          <h2 className="section-title">照這個順序完成查證</h2>
          <ol className="mt-6 space-y-4">
            {result.recommendedActions.map((action) => (
              <li key={action} className="check-item">
                <span><Check aria-hidden="true" size={16} /></span>
                <p>{action}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="rounded-3xl bg-navy p-6 text-ivory shadow-xl md:p-8">
        <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
          <span className="grid size-14 place-items-center rounded-full bg-gold text-navy">
            <GraduationCap aria-hidden="true" size={28} />
          </span>
          <div>
            <p className="text-sm font-bold tracking-widest text-gold">我學到什麼</p>
            <p className="mt-2 text-lg font-semibold leading-8">{result.learningPoint}</p>
          </div>
          <button type="button" className="button button-light" onClick={() => setHelpOpen(true)}>
            <MessageSquareQuote aria-hidden="true" size={19} />
            產生求助卡
          </button>
        </div>
      </section>

      <div className="notice notice-warning">
        <HelpCircle aria-hidden="true" />
        <div>
          <strong>仍有疑慮？請找真人一起確認</strong>
          <p>可撥打 165 反詐騙諮詢專線，若已匯款請保留交易與對話紀錄。</p>
          <a className="mt-2 inline-flex items-center gap-1 font-bold underline" href="https://165.npa.gov.tw/" target="_blank" rel="noreferrer">
            前往 165 全民防騙網 <ExternalLink aria-hidden="true" size={15} />
          </a>
        </div>
      </div>

      <details className="rounded-2xl border border-navy/10 bg-white p-5">
        <summary className="cursor-pointer font-bold text-navy">查看遮罩後的分析文字</summary>
        <p className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-ivory-deep/50 p-4 leading-7 text-ink-muted">{maskedMessage}</p>
      </details>

      <p className="text-center text-sm font-semibold leading-6 text-ink-muted">{result.disclaimer}</p>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" className="button button-outline" onClick={onReset}>
          <RefreshCw aria-hidden="true" size={18} />
          分析另一則訊息
        </button>
        <a href="tel:165" className="button button-danger">撥打 165</a>
      </div>

      {helpOpen ? (
        <div className="dialog-backdrop" role="presentation" onMouseDown={() => setHelpOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-card-title"
            className="dialog-panel"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button type="button" className="dialog-close" aria-label="關閉求助卡" onClick={() => setHelpOpen(false)}>
              <X aria-hidden="true" />
            </button>
            <p className="eyebrow">求｜找人幫</p>
            <h2 id="help-card-title" className="mt-2 text-2xl font-black text-navy">把這張求助卡交給可信任的人</h2>
            <p className="mt-5 rounded-2xl bg-ivory-deep/60 p-5 text-lg leading-8 text-ink">{result.helpSummary}</p>
            <p className="mt-4 text-sm leading-6 text-ink-muted">求助不代表你做錯了；讓另一個人一起看，能打破催促與保密造成的壓力。</p>
            <button type="button" className="button button-primary mt-6 w-full" onClick={copyHelpSummary}>
              {copied ? <Check aria-hidden="true" size={18} /> : <Clipboard aria-hidden="true" size={18} />}
              {copied ? "已複製" : "複製求助內容"}
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}
