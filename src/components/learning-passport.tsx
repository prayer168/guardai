"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BarChart3, BookOpenCheck, CheckCircle2, Home, RotateCcw, Send, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import assessmentQuestionData from "@/data/assessment-questions.json";

type Question = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  concept: string;
  explanation: string;
};

const preQuestions: Question[] = assessmentQuestionData.pre;
const postQuestions: Question[] = assessmentQuestionData.post;

type StoredAssessment = { score: number; answers: Record<string, number>; completedAt: string; version?: number };
type StoredChallenge = { correctCount: number; total: number; completedAt: string };

function calculateScore(questions: Question[], answers: Record<string, number>) {
  const correct = questions.filter((question) => answers[question.id] === question.answer).length;
  return Math.round((correct / questions.length) * 100);
}

export function LearningPassport() {
  const [preAnswers, setPreAnswers] = useState<Record<string, number>>({});
  const [postAnswers, setPostAnswers] = useState<Record<string, number>>({});
  const [preResult, setPreResult] = useState<StoredAssessment | null>(null);
  const [postResult, setPostResult] = useState<StoredAssessment | null>(null);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [challengeScore, setChallengeScore] = useState<number | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [anonymousShare, setAnonymousShare] = useState(false);
  const [anonymousBusy, setAnonymousBusy] = useState(false);
  const [anonymousStatus, setAnonymousStatus] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const savedPre = window.localStorage.getItem("guardai-pretest-v2");
        const savedPost = window.localStorage.getItem("guardai-posttest-v2");
        setPreResult(savedPre ? (JSON.parse(savedPre) as StoredAssessment) : null);
        setPostResult(savedPost ? (JSON.parse(savedPost) as StoredAssessment) : null);
        setAnonymousShare(window.localStorage.getItem("guardai-public-assessment-consent-v1") === "true");
      } catch {
        window.localStorage.removeItem("guardai-pretest-v2");
        window.localStorage.removeItem("guardai-posttest-v2");
      }
      const savedChallenge = window.localStorage.getItem("guardai-challenge");
      if (savedChallenge) {
        try {
          const parsedChallenge = JSON.parse(savedChallenge) as StoredChallenge;
          setChallengeComplete(true);
          setChallengeScore(Math.round((parsedChallenge.correctCount / parsedChallenge.total) * 100));
        } catch {
          window.localStorage.removeItem("guardai-challenge");
        }
      }
      setAnalysisCount(Number(window.localStorage.getItem("guardai-analysis-count") ?? "0"));
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function submitAssessment(kind: "pre" | "post") {
    const questions = kind === "pre" ? preQuestions : postQuestions;
    const answers = kind === "pre" ? preAnswers : postAnswers;
    const result = { score: calculateScore(questions, answers), answers, completedAt: new Date().toISOString(), version: 2 };
    window.localStorage.setItem(kind === "pre" ? "guardai-pretest-v2" : "guardai-posttest-v2", JSON.stringify(result));
    if (kind === "pre") setPreResult(result);
    else setPostResult(result);
    if (anonymousShare) {
      setAnonymousBusy(true);
      void saveAnonymousStage(kind, answers).finally(() => setAnonymousBusy(false));
    }
  }

  async function saveAnonymousStage(kind: "pre" | "post", answers: Record<string, number>) {
    setAnonymousStatus("");
    try {
      const questions = kind === "pre" ? preQuestions : postQuestions;
      const score = calculateScore(questions, answers);
      const missedConcepts = questions.filter((question) => answers[question.id] !== question.answer).map((question) => question.concept);
      const response = await fetch("/api/assessment-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learnerId: anonymousLearnerId(), kind, score, missedConcepts, consent: true }),
      });
      const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
      if (!response.ok) throw new Error(typeof body?.error === "string" ? body.error : "匿名結果暫時無法儲存。");
      setAnonymousStatus(`${kind === "pre" ? "前測" : "後測"}已匿名加入整體統計；資料最多保存 30 天。`);
    } catch (reason) {
      setAnonymousStatus(reason instanceof Error ? `${reason.message}；你的測驗成績仍保存在此裝置。` : "匿名結果暫時無法儲存；你的測驗成績仍保存在此裝置。");
    }
  }

  async function updateAnonymousConsent(nextConsent: boolean) {
    if (anonymousBusy || nextConsent === anonymousShare) return;
    setAnonymousBusy(true);
    setAnonymousStatus("");
    try {
      if (!nextConsent) {
        const storedLearnerId = window.localStorage.getItem("guardai-public-assessment-learner-id");
        if (storedLearnerId) {
          const response = await fetch("/api/assessment-results", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ learnerId: storedLearnerId }),
          });
          const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
          if (!response.ok) throw new Error(typeof body?.error === "string" ? body.error : "匿名資料暫時無法撤回。");
        }
        window.localStorage.removeItem("guardai-public-assessment-consent-v1");
        window.localStorage.removeItem("guardai-public-assessment-learner-id");
        setAnonymousShare(false);
        setAnonymousStatus("已撤回同意並刪除這台裝置提交的匿名統計資料。");
        return;
      }

      window.localStorage.setItem("guardai-public-assessment-consent-v1", "true");
      setAnonymousShare(true);
      if (preResult) await saveAnonymousStage("pre", preResult.answers);
      if (postResult) await saveAnonymousStage("post", postResult.answers);
      if (!preResult && !postResult) setAnonymousStatus("已同意；完成前測或後測時會自願加入匿名統計。");
    } catch (reason) {
      setAnonymousStatus(reason instanceof Error ? reason.message : "匿名統計設定暫時無法更新。");
    } finally {
      setAnonymousBusy(false);
    }
  }

  async function clearProgress() {
    if (!window.confirm("確定清除這台裝置上的匿名學習紀錄？")) return;
    if (anonymousShare) {
      const storedLearnerId = window.localStorage.getItem("guardai-public-assessment-learner-id");
      if (storedLearnerId) {
        setAnonymousBusy(true);
        try {
          const response = await fetch("/api/assessment-results", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ learnerId: storedLearnerId }),
          });
          if (!response.ok) throw new Error("暫時無法刪除伺服器上的匿名統計，請稍後重試。");
        } catch (reason) {
          setAnonymousStatus(reason instanceof Error ? reason.message : "暫時無法刪除伺服器上的匿名統計，請稍後重試。");
          setAnonymousBusy(false);
          return;
        }
        setAnonymousBusy(false);
      }
    }
    ["guardai-pretest", "guardai-posttest", "guardai-pretest-v2", "guardai-posttest-v2", "guardai-challenge", "guardai-analysis-count", "guardai-public-assessment-consent-v1", "guardai-public-assessment-learner-id", "guardai-learner-id"].forEach((key) => window.localStorage.removeItem(key));
    setPreResult(null);
    setPostResult(null);
    setChallengeComplete(false);
    setChallengeScore(null);
    setAnalysisCount(0);
    setAnonymousShare(false);
    setAnonymousStatus("已清除這台裝置的進度與匿名統計。");
    setPreAnswers({});
    setPostAnswers({});
  }

  function anonymousLearnerId() {
    const key = "guardai-public-assessment-learner-id";
    const stored = window.localStorage.getItem(key);
    if (stored) return stored;
    const created = window.crypto.randomUUID();
    window.localStorage.setItem(key, created);
    return created;
  }


  const improvement = preResult && postResult ? Math.round((postResult.score - preResult.score) / 20) : null;
  const missedConcepts = postResult
    ? postQuestions.filter((question) => postResult.answers[question.id] !== question.answer).map((question) => question.concept)
    : [];

  return (
    <div className="passport-screen">
      <div className="passport-topbar">
        <Link className="passport-home" href="/" aria-label="回到 GuardAI 首頁"><Home size={19} /><span>回到主畫面</span></Link>
        <span className="passport-topbar-title">匿名學習護照</span>
        <div className="passport-topbar-actions"><Link className="passport-results-link" href="/results"><BarChart3 aria-hidden="true" size={17} /><span>整體統計</span></Link><button type="button" className="text-button" disabled={anonymousBusy} onClick={() => void clearProgress()}><RotateCcw aria-hidden="true" size={17} /><span className="passport-clear-label">清除紀錄</span></button></div>
      </div>

      <main className="passport-content" aria-label="匿名學習護照">
        <header className="passport-heading">
          <div><p className="eyebrow">前測 → 情境練習 → 後測</p><h1>我的學習護照</h1><p>練習判斷訊息線索、查證來源、保護帳號，並在需要時找可信任的大人幫忙。</p></div>
          <div className="passport-metrics">
            <article className="metric-card"><BookOpenCheck aria-hidden="true" /><strong>{preResult ? `${Math.round(preResult.score / 20)} / 5 題` : "未完成"}</strong><span>查證力前測</span></article>
            <article className="metric-card"><ShieldCheck aria-hidden="true" /><strong>{challengeComplete ? "已完成" : "待練習"}</strong><span>六個防詐情境</span></article>
            <article className="metric-card"><BarChart3 aria-hidden="true" /><strong>{analysisCount} 次</strong><span>AI 判讀練習</span></article>
          </div>
        </header>

        <section className="passport-consent" aria-label="匿名評量統計同意設定">
          <label><input type="checkbox" checked={anonymousShare} disabled={anonymousBusy} onChange={(event) => void updateAnonymousConsent(event.target.checked)} /><span>自願納入匿名統計</span></label>
          <p>只分享分數與錯誤概念，不收姓名、班級、座號或個別答案；30 天自動刪除。</p>
          <span className="passport-consent-status" role="status" aria-live="polite">{anonymousBusy ? "更新中…" : anonymousStatus}</span>
        </section>

        {preResult && postResult ? (
          <section className="passport-results-banner">
            <p className="eyebrow">學習成果</p>
            <div><span>前測 <strong>{Math.round(preResult.score / 20)} / 5</strong></span><span>後測 <strong>{Math.round(postResult.score / 20)} / 5</strong></span><span>變化 <strong>{improvement !== null && improvement >= 0 ? "+" : ""}{improvement} 題</strong></span></div>
            <p>{missedConcepts.length ? `建議繼續練習：${missedConcepts.join("、")}` : "你已掌握本次所有重點，可用新的真實情境繼續練習。"}</p>
          </section>
        ) : null}

        <div className="passport-stations">
          <AssessmentSection title="第一站｜五題前測" description="依照你現在的想法作答。每題一分，答案在送出前不會顯示。" questions={preQuestions} answers={preAnswers} setAnswers={setPreAnswers} result={preResult} onSubmit={() => submitAssessment("pre")} onRestart={() => { window.localStorage.removeItem("guardai-pretest-v2"); setPreResult(null); setPreAnswers({}); }} />

          {preResult ? <section className={`passport-station-card ${challengeComplete ? "is-ready" : ""}`}>
            <span className="passport-station-number">02</span><div><p className="eyebrow">第二站｜情境練習</p><h2>練習「停、看、問、查、求」</h2><p>{challengeComplete ? `六個防詐情境已完成${challengeScore !== null ? `，得分 ${challengeScore} 分` : ""}，後測已解鎖。` : "完成防詐闖關後，會解鎖後測，看看你是否能把策略用在新的訊息裡。"}</p><Link href="/challenge" className="button button-primary">{challengeComplete ? "再次練習" : "前往防詐闖關"}<ArrowRight aria-hidden="true" size={18} /></Link></div>
          </section> : <section className="passport-station-locked"><span className="passport-station-number">02</span><div><p className="eyebrow">第二站｜情境練習</p><h2>完成前測後解鎖</h2><p>用六個生活情境練習「停、看、問、查、求」。</p></div></section>}

          {preResult && challengeComplete ? <AssessmentSection title="第三站｜五題後測" description="用新情境再次作答，看看你的查證策略是否能靈活運用。" questions={postQuestions} answers={postAnswers} setAnswers={setPostAnswers} result={postResult} onSubmit={() => submitAssessment("post")} onRestart={() => { window.localStorage.removeItem("guardai-posttest-v2"); setPostResult(null); setPostAnswers({}); }} /> : <section className="passport-station-locked"><span className="passport-station-number">03</span><div><p className="eyebrow">第三站｜五題後測</p><h2>完成情境練習後解鎖</h2><p>後測題目與前測測量相同的查證能力，題目情境不同。</p></div></section>}
        </div>

      </main>
    </div>
  );
}

type AssessmentSectionProps = {
  title: string;
  description: string;
  questions: Question[];
  answers: Record<string, number>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  result: StoredAssessment | null;
  onSubmit: () => void;
  onRestart: () => void;
};

function AssessmentSection({ title, description, questions, answers, setAnswers, result, onSubmit, onRestart }: AssessmentSectionProps) {
  const [active, setActive] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  const question = questions[questionIndex];

  function startOver() {
    setQuestionIndex(0);
    setShowAnswers(false);
    setActive(true);
  }

  if (!active) {
    return <section className="passport-assessment-card">
      <div className="passport-assessment-main"><span className="passport-station-number">{title.startsWith("第一") ? "01" : "03"}</span><div><p className="eyebrow">匿名學習評量 · 每題 1 分</p><h2>{title}</h2><p>{description}</p>{result ? <div className="passport-score"><CheckCircle2 aria-hidden="true" />已送出 · {Math.round(result.score / 20)} / {questions.length} 題答對</div> : <p className="passport-count">共 {questions.length} 題 · 建議 5–7 分鐘</p>}</div></div>
      <div className="passport-assessment-actions">{result ? <button type="button" className="button button-secondary" onClick={() => { setActive(true); setShowAnswers(true); }}><BookOpenCheck size={18} />查看答案與解析</button> : null}<button type="button" className="button button-primary" onClick={() => { if (result) onRestart(); startOver(); }}>{result ? "重新作答" : "開始作答"}<ArrowRight size={18} /></button></div>
    </section>;
  }

  if (result && showAnswers) {
    const reviewQuestion = questions[reviewIndex];
    return <section className="passport-review-card" aria-label={`${title}答案解析`}>
      <div className="passport-review-heading"><div><p className="eyebrow">{title}｜答案解析</p><h2>答對 {Math.round(result.score / 20)} / {questions.length} 題</h2></div><button type="button" className="button button-secondary" onClick={() => { setActive(false); setShowAnswers(false); }}>返回學習護照</button></div>
      <div className="passport-review-progress">第 {reviewIndex + 1} / {questions.length} 題</div>
      <article className="passport-review-item passport-review-current" key={reviewQuestion.id}><span className="passport-review-index">{reviewIndex + 1}</span><div><h3>{reviewQuestion.prompt}</h3><p className="passport-review-answer">正確答案：{reviewQuestion.options[reviewQuestion.answer]}</p><p>{reviewQuestion.explanation}</p><span className="passport-review-concept">{reviewQuestion.concept}</span></div><strong className={result.answers[reviewQuestion.id] === reviewQuestion.answer ? "is-correct" : "is-wrong"}>{result.answers[reviewQuestion.id] === reviewQuestion.answer ? "答對" : "再練習"}</strong></article>
      <div className="passport-review-controls"><button type="button" className="button button-secondary" disabled={reviewIndex === 0} onClick={() => setReviewIndex((current) => current - 1)}><ArrowLeft size={17} />上一題</button><button type="button" className="button button-primary" onClick={() => reviewIndex < questions.length - 1 ? setReviewIndex((current) => current + 1) : (setShowAnswers(false), setActive(false))}>{reviewIndex < questions.length - 1 ? <>下一題<ArrowRight size={17} /></> : "完成解析"}</button></div>
    </section>;
  }

  if (result) {
    return <section className="passport-assessment-card passport-submitted-card">
      <div className="passport-assessment-main"><span className="passport-station-number"><CheckCircle2 size={20} /></span><div><p className="eyebrow">{title}｜已完成</p><h2>你的成績：{Math.round(result.score / 20)} / {questions.length} 題</h2><p>每題 1 分，滿分 {questions.length} 分。你可以查看正確答案和解析，或重新作答。</p></div></div>
      <div className="passport-assessment-actions"><button type="button" className="button button-secondary" onClick={() => setShowAnswers(true)}><BookOpenCheck size={18} />看到答案與解析</button><button type="button" className="button button-primary" onClick={() => { onRestart(); startOver(); }}><RotateCcw size={18} />重新作答</button></div>
    </section>;
  }

  const selected = answers[question.id];
  return <section className="passport-quiz-card" aria-label={title}>
    <div className="passport-quiz-header"><div><p className="eyebrow">{title} · 不填姓名 · 每題只選一個答案</p><h2>{description}</h2></div><button type="button" className="button button-secondary passport-exit" onClick={() => setActive(false)}><Home size={17} /><span>回學習護照</span></button></div>
    <div className="passport-question-progress"><span>第 {questionIndex + 1} / {questions.length} 題</span><span>已作答 {Object.keys(answers).filter((key) => questions.some((item) => item.id === key)).length} 題</span><div><i style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div></div>
    <div className="passport-question-body" key={question.id}>
      <p className="passport-question-number">QUESTION {String(questionIndex + 1).padStart(2, "0")}</p>
      <h3 id={`prompt-${question.id}`}>{question.prompt}</h3>
      <fieldset aria-labelledby={`prompt-${question.id}`} className="passport-choice-list"><legend className="sr-only">請選一個答案</legend>{question.options.map((option, optionIndex) => <label key={option} className={`passport-choice${selected === optionIndex ? " is-selected" : ""}`}><input type="radio" name={question.id} checked={selected === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} /><span className="passport-choice-letter">{["A", "B", "C"][optionIndex]}</span><span>{option}</span></label>)}</fieldset>
    </div>
    <div className="passport-quiz-controls"><button type="button" className="button button-secondary" disabled={questionIndex === 0} onClick={() => setQuestionIndex((current) => current - 1)}><ArrowLeft size={18} />上一題</button><span>{selected === undefined ? "請選擇一個答案" : "答案已記錄"}</span>{questionIndex < questions.length - 1 ? <button type="button" className="button button-primary" disabled={selected === undefined} onClick={() => setQuestionIndex((current) => current + 1)}>下一題<ArrowRight size={18} /></button> : <button type="button" className="button button-primary" disabled={questions.some((item) => answers[item.id] === undefined)} onClick={onSubmit}><Send size={17} />送出答案</button>}</div>
  </section>;
}
