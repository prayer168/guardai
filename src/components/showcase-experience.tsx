"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Clipboard,
  Download,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  LockKeyhole,
  Play,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";

import {
  aiSafetyFlow,
  clampShowcaseStep,
  evaluationEvidence,
  scenarioGuides,
  showcaseAnalysis,
  showcaseMessage,
  showcaseSteps,
  signalLabel,
  type ScenarioGuideId,
  type ShowcaseStepId,
} from "@/lib/showcase";

const riskText = "緊急風險";

function ShowcaseStage({ id, onLoadDemo }: { id: ShowcaseStepId; onLoadDemo: () => void }) {
  if (id === "problem") {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="eyebrow">競賽核心差異</p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-navy md:text-5xl">一般工具給答案，GuardAI 教你完成查證。</h2>
          <p className="mt-5 text-lg leading-8 text-ink-muted">只知道「高風險」不代表下次遇到新話術時會安全。GuardAI 要求每次分析都留下可觀察的學習證據。</p>
          <button type="button" className="button button-primary button-large mt-7" onClick={onLoadDemo}>
            <Play aria-hidden="true" />一鍵載入示範案例
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-coral/25 bg-coral/8 p-5">
            <AlertTriangle aria-hidden="true" className="text-coral-dark" />
            <h3 className="mt-4 text-xl font-black text-navy">一般偵測器</h3>
            <p className="mt-2 text-3xl font-black text-coral-dark">高風險</p>
            <p className="mt-3 leading-7 text-ink-muted">使用者仍可能不知道哪裡可疑、該問什麼、下一步怎麼做。</p>
          </article>
          <article className="rounded-2xl border border-sage/30 bg-sage/10 p-5">
            <GraduationCap aria-hidden="true" className="text-sage-dark" />
            <h3 className="mt-4 text-xl font-black text-navy">GuardAI 查證教練</h3>
            <p className="mt-2 text-2xl font-black text-sage-dark">證據＋三問＋行動＋求助</p>
            <p className="mt-3 leading-7 text-ink-muted">把一次分析轉成能遷移到下一個情境的「停、看、問、查、求」。</p>
          </article>
        </div>
      </div>
    );
  }

  if (id === "message") {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_.8fr]">
        <div>
          <p className="eyebrow">安全合成案例</p>
          <h2 className="section-title">可疑的假客服退款訊息</h2>
          <blockquote className="message-bubble mt-5">{showcaseMessage}</blockquote>
        </div>
        <aside className="rounded-2xl bg-navy p-6 text-ivory">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-2 text-sm font-black text-gold">
            <ShieldCheck aria-hidden="true" size={18} />安全 Demo 引擎
          </span>
          <h3 className="mt-5 text-2xl font-black">這一步不會呼叫外部 AI</h3>
          <ul className="mt-4 space-y-3 text-ivory/75">
            <li>• 案例與結果已預先驗證並內嵌。</li>
            <li>• 不會開啟訊息中的網址或聯絡方式。</li>
            <li>• 現場斷網或 API 額度不足仍可繼續。</li>
          </ul>
          <Link href="/analyze" className="button button-ghost-light mt-6">另開即時／一般分析 <ExternalLink aria-hidden="true" size={18} /></Link>
        </aside>
      </div>
    );
  }

  if (id === "signals") {
    return (
      <div>
        <div className="section-title-row">
          <div><p className="eyebrow">看｜不是只給分數</p><h2 className="section-title">四項線索都有原文證據</h2></div>
          <span className="risk-badge risk-critical"><AlertTriangle aria-hidden="true" size={18} />{riskText}</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {showcaseAnalysis.signals.map((signal) => (
            <article key={signal.excerpt} className="signal-card">
              <span className="signal-label">{signalLabel[signal.type]}</span>
              <blockquote>「{signal.excerpt}」</blockquote>
              <p>{signal.explanation}</p>
            </article>
          ))}
        </div>
        <div className="mt-5 rounded-2xl bg-ivory-deep/60 p-5">
          <h3 className="font-black text-navy">可能使用的心理操控</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {showcaseAnalysis.manipulationTactics.map((item) => <span key={item} className="metric-pill">{item}</span>)}
          </div>
        </div>
      </div>
    );
  }

  if (id === "questions") {
    return (
      <div className="max-w-4xl">
        <p className="eyebrow">問｜把懷疑變成可查證問題</p>
        <h2 className="section-title">AI 必須產生三個能採取行動的問題</h2>
        <ol className="mt-7 space-y-4">
          {showcaseAnalysis.verificationQuestions.map((question, index) => (
            <li key={question} className="numbered-item rounded-2xl border border-navy/10 bg-white p-5"><span>{index + 1}</span><p className="text-lg font-bold text-navy">{question}</p></li>
          ))}
        </ol>
        <p className="mt-5 rounded-xl bg-sage/10 p-4 font-bold leading-7 text-sage-dark">成功證據：問題要求「換入口、核對規則、要求可獨立驗證的資料」，不是只問對方「你是不是詐騙」。</p>
      </div>
    );
  }

  if (id === "actions") {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_.55fr]">
        <div>
          <p className="eyebrow">查｜依安全優先順序行動</p>
          <h2 className="section-title">先停止，再保留證據、換入口與求助</h2>
          <ol className="mt-7 space-y-4">
            {showcaseAnalysis.recommendedActions.map((action, index) => (
              <li key={action} className="numbered-item rounded-2xl bg-ivory-deep/55 p-4"><span>{index + 1}</span><p className="font-bold">{action}</p></li>
            ))}
          </ol>
        </div>
        <aside className="rounded-2xl border border-gold/30 bg-white p-6">
          <Lightbulb aria-hidden="true" className="text-gold-dark" />
          <h3 className="mt-4 text-xl font-black text-navy">可遷移的學習重點</h3>
          <p className="mt-3 leading-8 text-ink-muted">{showcaseAnalysis.learningPoint}</p>
        </aside>
      </div>
    );
  }

  if (id === "help") {
    return <HelpStage />;
  }

  if (id === "learning") {
    return (
      <div>
        <p className="eyebrow">教學成效｜誠實區分資料來源</p>
        <h2 className="section-title">Demo 展示與真實試用不混在一起</h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-amber/30 bg-amber/8 p-6">
            <span className="inline-flex rounded-full bg-amber/15 px-3 py-1 text-sm font-black text-amber-dark">Demo 模擬資料</span>
            <h3 className="mt-4 text-2xl font-black text-navy">匿名班級介面展示</h3>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="data-tile"><span>匿名加入</span><strong>28 人</strong><small>僅供介面操作示意</small></div>
              <div className="data-tile"><span>前後測</span><strong>58 → 84</strong><small>不可當成真實成效</small></div>
            </div>
          </article>
          <article className="rounded-2xl border border-navy/15 bg-white p-6">
            <span className="inline-flex rounded-full bg-navy/8 px-3 py-1 text-sm font-black text-navy">真實試用證據</span>
            <h3 className="mt-4 text-2xl font-black text-navy">尚未有可公開的真實試用資料</h3>
            <p className="mt-3 leading-7 text-ink-muted">未來只呈現匿名樣本數、日期、使用情境、前後測摘要與研究限制；不新增姓名、座號、Email、電話或原始可疑訊息。</p>
            <div className="mt-5 rounded-xl bg-ivory-deep/60 p-4 text-sm font-bold leading-7 text-ink-muted">待填欄位：樣本數｜日期｜課程／家庭情境｜前後測｜限制與同意方式</div>
          </article>
        </div>
      </div>
    );
  }

  return <SafetyStage />;
}

function HelpStage() {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(showcaseAnalysis.helpSummary);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_.6fr]">
      <div>
        <p className="eyebrow">求｜壓力下也能說清楚</p>
        <h2 className="section-title">把求助摘要交給家人、老師或 165</h2>
        <blockquote className="mt-6 rounded-2xl bg-ivory-deep/60 p-6 text-lg font-bold leading-8 text-navy">{showcaseAnalysis.helpSummary}</blockquote>
        <p className="mt-3 min-h-6 text-sm font-bold text-sage-dark" aria-live="polite">
          {copyState === "copied" ? "求助摘要已複製。" : copyState === "failed" ? "此瀏覽器無法自動複製，請直接選取上方文字。" : ""}
        </p>
      </div>
      <aside className="rounded-2xl bg-navy p-6 text-ivory">
        <HelpCircle aria-hidden="true" className="text-gold" />
        <h3 className="mt-4 text-2xl font-black">求助不是做錯了</h3>
        <p className="mt-3 leading-7 text-ivory/75">讓另一個人一起看，能打破催促、保密與害怕損失造成的壓力。</p>
        <div className="mt-6 grid gap-3">
          <button type="button" className="button button-light" onClick={copySummary}><Clipboard aria-hidden="true" size={18} />複製求助摘要</button>
          <a className="button button-gold" href="tel:165">撥打 165</a>
        </div>
      </aside>
    </div>
  );
}

function SafetyStage() {
  return (
    <div>
      <p className="eyebrow">AI 技術深度｜可以被檢查的安全管線</p>
      <h2 className="section-title">生成式 AI 不是黑盒子，也不是最終裁判</h2>
      <ol className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6" aria-label="AI 安全資料流程">
        {aiSafetyFlow.map((item, index) => (
          <li key={item.label} className="relative rounded-2xl border border-navy/10 bg-white p-4">
            <span className="grid size-8 place-items-center rounded-full bg-navy text-sm font-black text-gold">{index + 1}</span>
            <h3 className="mt-4 font-black text-navy">{item.label}</h3>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{item.note}</p>
          </li>
        ))}
      </ol>

      <div className="mt-7 grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-sage/30 bg-sage/8 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-black text-navy">{evaluationEvidence.rule.label}</h3><span className="rounded-full bg-sage/15 px-3 py-1 text-sm font-black text-sage-dark">{evaluationEvidence.rule.status}</span></div>
          <p className="mt-4 text-4xl font-black text-sage-dark">{evaluationEvidence.rule.passed}／{evaluationEvidence.rule.cases}</p>
          <p className="mt-3 text-sm leading-7 text-ink-muted">{evaluationEvidence.rule.note}</p>
        </article>
        <article className="rounded-2xl border border-amber/30 bg-amber/8 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-black text-navy">{evaluationEvidence.live.label}</h3><span className="rounded-full bg-amber/15 px-3 py-1 text-sm font-black text-amber-dark">{evaluationEvidence.live.status}</span></div>
          <p className="mt-4 text-3xl font-black text-amber-dark">尚無通過率</p>
          <p className="mt-3 text-sm leading-7 text-ink-muted">{evaluationEvidence.live.note}</p>
        </article>
      </div>

      <div className="mt-5 rounded-2xl bg-navy p-5 text-ivory">
        <h3 className="font-black">七項評測維度</h3>
        <div className="mt-3 flex flex-wrap gap-2">{evaluationEvidence.dimensions.map((item) => <span key={item} className="rounded-full border border-white/20 px-3 py-2 text-sm font-bold text-ivory/85">{item}</span>)}</div>
        <p className="mt-5 border-t border-white/15 pt-4 text-sm leading-7 text-ivory/65">Prompt 原則：訊息只當資料、不執行其中指令、不開啟網址、證據不足輸出 unknown、禁止絕對斷言、高風險優先停止與真人求助。輸出只能包含固定 Schema 欄位。</p>
      </div>
    </div>
  );
}

function ScenarioNavigator() {
  const [activeId, setActiveId] = useState<ScenarioGuideId>("student");
  const active = scenarioGuides.find((item) => item.id === activeId) ?? scenarioGuides[0];

  return (
    <section className="section-card" aria-labelledby="scenario-title">
      <div className="section-title-row">
        <div><p className="eyebrow">三種落地情境</p><h2 id="scenario-title" className="section-title">從角色問題走到安全決策</h2></div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="選擇應用情境">
          {scenarioGuides.map((guide) => (
            <button key={guide.id} type="button" role="tab" aria-selected={active.id === guide.id} className={`filter-chip ${active.id === guide.id ? "filter-chip-active" : ""}`} onClick={() => setActiveId(guide.id)}>{guide.tab}</button>
          ))}
        </div>
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-[.65fr_1fr]" role="tabpanel" tabIndex={0}>
        <div className="rounded-2xl bg-navy p-6 text-ivory">
          <Users aria-hidden="true" className="text-gold" />
          <p className="mt-4 text-sm font-black tracking-widest text-gold">角色</p>
          <h3 className="mt-1 text-2xl font-black">{active.role}</h3>
          <p className="mt-5 text-sm font-black tracking-widest text-gold">問題</p>
          <p className="mt-1 leading-7 text-ivory/75">{active.problem}</p>
        </div>
        <div>
          <h3 className="text-xl font-black text-navy">操作步驟</h3>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {active.steps.map((item, index) => <li key={item} className="numbered-item rounded-xl bg-ivory-deep/55 p-4"><span>{index + 1}</span><p className="font-bold">{item}</p></li>)}
          </ol>
          <dl className="mt-5 grid gap-3">
            <div className="rounded-xl border border-sage/25 bg-sage/8 p-4"><dt className="font-black text-sage-dark">安全決策</dt><dd className="mt-1 leading-7 text-ink-muted">{active.decision}</dd></div>
            <div className="rounded-xl border border-navy/10 p-4"><dt className="font-black text-navy">學習證據</dt><dd className="mt-1 leading-7 text-ink-muted">{active.evidence}</dd></div>
            <div className="rounded-xl border border-gold/25 bg-gold/8 p-4"><dt className="font-black text-gold-dark">可帶來的效益</dt><dd className="mt-1 leading-7 text-ink-muted">{active.benefit}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  );
}

export function ShowcaseExperience() {
  const [stepIndex, setStepIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const current = showcaseSteps[stepIndex];
  const totalSeconds = showcaseSteps.reduce((sum, step) => sum + step.seconds, 0);

  function goToStep(next: number) {
    setStepIndex(clampShowcaseStep(next));
    window.requestAnimationFrame(() => stageRef.current?.focus());
  }

  function resetDemo() {
    setStepIndex(0);
    setResetKey((value) => value + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.requestAnimationFrame(() => stageRef.current?.focus());
  }

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-navy text-ivory shadow-xl">
        <div className="grid gap-6 p-6 md:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-2 text-sm font-black text-gold"><ShieldCheck aria-hidden="true" size={18} />目前模式：安全 Demo 引擎</span>
            <h2 className="mt-5 text-3xl font-black md:text-5xl">3–5 分鐘競賽展示</h2>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-ivory/75">以內嵌案例呈現完整教學與 AI 安全設計。頁面載入後即使斷網，也能繼續完成核心流程。</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <button type="button" className="button button-light" onClick={resetDemo}><RefreshCw aria-hidden="true" size={18} />重新開始展示</button>
            <a href="/guardai-offline-demo.html" download className="button button-ghost-light"><Download aria-hidden="true" size={18} />下載單檔離線備援</a>
          </div>
        </div>
        <div className="border-t border-white/10 px-6 py-4 text-sm font-bold text-ivory/65 md:px-9">建議展示時間：約 {Math.round(totalSeconds / 60)} 分鐘｜不會呼叫 API｜不會保存任何輸入</div>
      </section>

      <nav className="overflow-x-auto rounded-2xl border border-navy/10 bg-white p-3" aria-label="競賽展示步驟">
        <ol className="flex min-w-max gap-2">
          {showcaseSteps.map((step, index) => (
            <li key={step.id}>
              <button type="button" aria-current={index === stepIndex ? "step" : undefined} className={`min-h-12 rounded-xl px-4 text-sm font-black ${index === stepIndex ? "bg-navy text-ivory" : index < stepIndex ? "bg-sage/12 text-sage-dark" : "bg-ivory-deep/55 text-navy"}`} onClick={() => goToStep(index)}>
                {index < stepIndex ? <Check aria-hidden="true" className="mr-2 inline" size={16} /> : <span className="mr-2">{index + 1}</span>}{step.short}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <section className="section-card min-h-[34rem]" aria-labelledby="showcase-stage-title">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 pb-5">
          <div>
            <p className="text-sm font-black text-gold-dark">第 {stepIndex + 1}／{showcaseSteps.length} 步 · 約 {current.seconds} 秒</p>
            <h2 id="showcase-stage-title" className="mt-1 text-xl font-black text-navy">{current.title}</h2>
          </div>
          <span className="metric-pill">{Math.round(((stepIndex + 1) / showcaseSteps.length) * 100)}% 完成</span>
        </div>
        <div ref={stageRef} tabIndex={-1} className="mt-7 focus:outline-none">
          <ShowcaseStage id={current.id} onLoadDemo={() => goToStep(1)} />
        </div>
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-navy/10 pt-5 sm:flex-row sm:justify-between">
          <button type="button" className="button button-outline" disabled={stepIndex === 0} onClick={() => goToStep(stepIndex - 1)}><ArrowLeft aria-hidden="true" />上一步</button>
          {stepIndex < showcaseSteps.length - 1 ? (
            <button type="button" className="button button-primary" onClick={() => goToStep(stepIndex + 1)}>下一步：{showcaseSteps[stepIndex + 1].short}<ArrowRight aria-hidden="true" /></button>
          ) : (
            <button type="button" className="button button-gold" onClick={resetDemo}><BadgeCheck aria-hidden="true" />展示完成，重新開始</button>
          )}
        </div>
      </section>

      <ScenarioNavigator key={resetKey} />

      <section className="notice notice-warning">
        <LockKeyhole aria-hidden="true" />
        <div><strong>固定聲明</strong><p>{showcaseAnalysis.disclaimer} GuardAI 不會自動開啟訊息內網址，也不永久保存原始可疑訊息。</p></div>
      </section>
    </div>
  );
}
