"use client";

import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  Clipboard,
  Download,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Play,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { PresentationFrame } from "@/components/presentation-frame";

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

  if (id === "scenarios") return <ScenarioNavigator />;
  if (id === "evaluation") return <EvaluationStage />;

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
    <div className="showcase-safety-slide">
      <p className="eyebrow">AI 技術深度｜可以被檢查的安全管線</p>
      <h2 className="section-title">生成式 AI 不是黑盒子，也不是最終裁判</h2>
      <ol className="showcase-safety-flow" aria-label="AI 安全資料流程">
        {aiSafetyFlow.map((item, index) => (
          <li key={item.label}>
            <span>{index + 1}</span>
            <h3>{item.label}</h3>
            <p>{item.note}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function EvaluationStage() {
  return (
    <div className="showcase-evaluation-slide">
      <div>
        <p className="eyebrow">教學成效｜誠實區分資料來源</p>
        <h2 className="section-title">Demo 展示與真實試用不混在一起</h2>
      </div>
      <div className="showcase-evaluation-grid">
        <article className="showcase-evidence-card showcase-evidence-rule">
          <div><h3>{evaluationEvidence.rule.label}</h3><span>{evaluationEvidence.rule.status}</span></div>
          <p className="showcase-evidence-score">{evaluationEvidence.rule.passed}／{evaluationEvidence.rule.cases}</p>
          <p>{evaluationEvidence.rule.note}</p>
        </article>
        <article className="showcase-evidence-card showcase-evidence-live">
          <div><h3>{evaluationEvidence.live.label}</h3><span>{evaluationEvidence.live.status}</span></div>
          <p className="showcase-evidence-score">尚無通過率</p>
          <p>{evaluationEvidence.live.note}</p>
        </article>
      </div>
      <section className="showcase-evaluation-dimensions">
        <h3>七項評測維度</h3>
        <div>{evaluationEvidence.dimensions.map((item) => <span key={item}>{item}</span>)}</div>
        <p>Prompt 原則：訊息只當資料、不執行其中指令、不開啟網址、證據不足輸出 unknown、禁止絕對斷言、高風險優先停止與真人求助。輸出只能包含固定 Schema 欄位。</p>
      </section>
      <p className="showcase-fixed-disclaimer">固定聲明：{showcaseAnalysis.disclaimer} GuardAI 不會自動開啟訊息內網址，也不永久保存原始可疑訊息。</p>
    </div>
  );
}

function ScenarioNavigator() {
  const [activeId, setActiveId] = useState<ScenarioGuideId>("student");
  const active = scenarioGuides.find((item) => item.id === activeId) ?? scenarioGuides[0];

  return (
    <section className="showcase-scenario-slide" aria-labelledby="scenario-title">
      <div className="showcase-scenario-heading">
        <div><p className="eyebrow">三種落地情境</p><h2 id="scenario-title">從角色問題走到安全決策</h2></div>
        <div className="showcase-scenario-tabs" role="tablist" aria-label="選擇應用情境">
          {scenarioGuides.map((guide) => (
            <button key={guide.id} type="button" role="tab" aria-selected={active.id === guide.id} className={active.id === guide.id ? "is-current" : ""} onClick={() => setActiveId(guide.id)}>{guide.tab}</button>
          ))}
        </div>
      </div>
      <div className="showcase-scenario-main" role="tabpanel" tabIndex={0}>
        <div className="showcase-scenario-role">
          <Users aria-hidden="true" />
          <span>角色・{active.role}</span>
          <p>{active.problem}</p>
        </div>
        <div className="showcase-scenario-steps">
          <h3>操作步驟</h3>
          <ol>
            {active.steps.map((item, index) => <li key={item}><span>{index + 1}</span><p>{item}</p></li>)}
          </ol>
        </div>
      </div>
      <dl className="showcase-scenario-outcomes">
        <div><dt>安全決策</dt><dd>{active.decision}</dd></div>
        <div><dt>學習證據</dt><dd>{active.evidence}</dd></div>
        <div><dt>可帶來的效益</dt><dd>{active.benefit}</dd></div>
      </dl>
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
    document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" });
    window.requestAnimationFrame(() => stageRef.current?.focus());
  }

  return (
    <PresentationFrame
      title="競賽展示"
      subtitle={`安全 Demo 引擎｜約 ${Math.round(totalSeconds / 60)} 分鐘｜不呼叫 API、不保存輸入`}
      pageNumber={stepIndex + 1}
      pageCount={showcaseSteps.length}
      pageLabel={current.title}
      onPrevious={() => goToStep(stepIndex - 1)}
      onNext={() => stepIndex < showcaseSteps.length - 1 ? goToStep(stepIndex + 1) : resetDemo()}
      actions={<>
        <button type="button" className="knowledge-icon-button" onClick={resetDemo} aria-label="重新開始展示"><RefreshCw aria-hidden="true" size={17} /><span>重來</span></button>
        <a href="/guardai-offline-demo.html" download className="knowledge-icon-button" aria-label="下載單檔離線備援"><Download aria-hidden="true" size={17} /><span>離線版</span></a>
      </>}
    >
      <div className="showcase-presentation-body">
        <nav className="showcase-step-nav" aria-label="競賽展示步驟">
          {showcaseSteps.map((step, index) => <button key={step.id} type="button" aria-current={index === stepIndex ? "step" : undefined} onClick={() => goToStep(index)}>{index < stepIndex ? <Check aria-hidden="true" size={14} /> : <span>{index + 1}</span>}{step.short}</button>)}
        </nav>
        <section className="showcase-stage-card" aria-labelledby="showcase-stage-title">
          <div className="showcase-stage-heading"><div><p>第 {stepIndex + 1}／{showcaseSteps.length} 步 · 約 {current.seconds} 秒</p><h1 id="showcase-stage-title">{current.title}</h1></div><span>{Math.round(((stepIndex + 1) / showcaseSteps.length) * 100)}% 完成</span></div>
          <div ref={stageRef} tabIndex={-1} className="showcase-stage-content"><ShowcaseStage key={`${current.id}-${resetKey}`} id={current.id} onLoadDemo={() => goToStep(1)} /></div>
        </section>
      </div>
    </PresentationFrame>
  );
}
