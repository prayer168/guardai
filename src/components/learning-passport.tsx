"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BarChart3, BookOpenCheck, CheckCircle2, Home, RotateCcw, Send, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { classroomPackLabels, type ClassroomPack } from "@/lib/classroom";
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
  const [classCode, setClassCode] = useState("");
  const [classPack, setClassPack] = useState<ClassroomPack | null>(null);
  const [classStatus, setClassStatus] = useState("");
  const [classSubmitted, setClassSubmitted] = useState(false);
  const [classBusy, setClassBusy] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const savedPre = window.localStorage.getItem("guardai-pretest-v2");
        const savedPost = window.localStorage.getItem("guardai-posttest-v2");
        setPreResult(savedPre ? (JSON.parse(savedPre) as StoredAssessment) : null);
        setPostResult(savedPost ? (JSON.parse(savedPost) as StoredAssessment) : null);
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
      const activeClassCode = window.localStorage.getItem("guardai-class-code") ?? "";
      setClassCode(activeClassCode);
      setClassSubmitted(Boolean(activeClassCode && window.localStorage.getItem(`guardai-class-submitted:${activeClassCode}`)));
      if (activeClassCode) {
        void fetch(`/api/classes/${encodeURIComponent(activeClassCode)}`, { cache: "no-store" })
          .then(async (response) => {
            if (!response.ok) throw new Error();
            return response.json() as Promise<{ classroom: { pack: ClassroomPack } }>;
          })
          .then((body) => setClassPack(body.classroom.pack))
          .catch(() => setClassStatus("班級代碼可能已過期，請向教師確認。"));
      }
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
  }

  function clearProgress() {
    if (!window.confirm("確定清除這台裝置上的匿名學習紀錄？")) return;
    ["guardai-pretest", "guardai-posttest", "guardai-pretest-v2", "guardai-posttest-v2", "guardai-challenge", "guardai-analysis-count"].forEach((key) => window.localStorage.removeItem(key));
    setPreResult(null);
    setPostResult(null);
    setChallengeComplete(false);
    setChallengeScore(null);
    setAnalysisCount(0);
    setPreAnswers({});
    setPostAnswers({});
    if (classCode) {
      window.localStorage.removeItem(`guardai-class-submitted:${classCode}`);
      setClassSubmitted(false);
    }
  }

  function learnerId() {
    const stored = window.localStorage.getItem("guardai-learner-id");
    if (stored) return stored;
    const created = window.crypto.randomUUID();
    window.localStorage.setItem("guardai-learner-id", created);
    return created;
  }

  async function submitAnonymousClassResult() {
    if (!classCode || !preResult || !postResult || challengeScore === null) return;
    setClassBusy(true);
    setClassStatus("");
    try {
      const response = await fetch(`/api/classes/${encodeURIComponent(classCode)}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learnerId: learnerId(), preScore: preResult.score, postScore: postResult.score, challengeScore, analysisCount, missedConcepts }),
      });
      const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
      if (!response.ok) throw new Error(typeof body?.error === "string" ? body.error : "匿名成果暫時無法提交。");
      window.localStorage.setItem(`guardai-class-submitted:${classCode}`, new Date().toISOString());
      setClassSubmitted(true);
      setClassStatus("匿名成果已提交；教師只會看到全班彙總。");
    } catch (reason) {
      setClassStatus(reason instanceof Error ? reason.message : "匿名成果暫時無法提交。");
    } finally {
      setClassBusy(false);
    }
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
        <button type="button" className="text-button" onClick={clearProgress}><RotateCcw aria-hidden="true" size={17} /><span className="passport-clear-label">清除紀錄</span></button>
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

        {classCode ? <section className="passport-class-card"><Users aria-hidden="true" /><div><p className="eyebrow">匿名班級 {classCode}</p><h2>提交學習成果</h2><p>{classPack ? `教師指派：${classroomPackLabels[classPack]}。` : ""}完成前測、六題闖關與後測後，可提交匿名分數彙總。系統不傳送姓名或個別答案。</p>{preResult && postResult && challengeScore !== null ? <button type="button" className="button button-primary" disabled={classBusy} onClick={submitAnonymousClassResult}><Send aria-hidden="true" size={18} />{classBusy ? "提交中…" : classSubmitted ? "更新匿名成果" : "提交匿名成果"}</button> : null}<p className="passport-class-status" aria-live="polite">{classStatus}</p></div></section> : <p className="passport-class-hint"><Users aria-hidden="true" size={17} />有教師提供班級代碼嗎？<Link href="/join">加入匿名班級</Link>後，可提交匿名分數彙總。</p>}
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
      <div className="passport-assessment-main"><span className="passport-station-number">{title.startsWith("第一") ? "01" : "03"}</span><div><p className="eyebrow">匿名學習評量 · 每題 1 分</p><h2>{title}</h2><p>{description}</p>{result ? <div className="passport-score"><CheckCircle2 aria-hidden="true" />已送出 · {Math.round(result.score / 20)} / {questions.length} 題答對</div> : <p className="passport-count">共 {questions.length} 題 · 約 3 分鐘</p>}</div></div>
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
    <div className="passport-quiz-header"><div><p className="eyebrow">{title}</p><h2>{description}</h2></div><button type="button" className="button button-secondary passport-exit" onClick={() => setActive(false)}><Home size={17} /><span>回學習護照</span></button></div>
    <div className="passport-question-progress"><span>第 {questionIndex + 1} / {questions.length} 題</span><span>已作答 {Object.keys(answers).filter((key) => questions.some((item) => item.id === key)).length} 題</span><div><i style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div></div>
    <div className="passport-question-body" key={question.id}>
      <p className="passport-question-number">QUESTION {String(questionIndex + 1).padStart(2, "0")}</p>
      <h3 id={`prompt-${question.id}`}>{question.prompt}</h3>
      <fieldset aria-labelledby={`prompt-${question.id}`} className="passport-choice-list"><legend className="sr-only">請選一個答案</legend>{question.options.map((option, optionIndex) => <label key={option} className={`passport-choice${selected === optionIndex ? " is-selected" : ""}`}><input type="radio" name={question.id} checked={selected === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} /><span className="passport-choice-letter">{["A", "B", "C"][optionIndex]}</span><span>{option}</span></label>)}</fieldset>
    </div>
    <div className="passport-quiz-controls"><button type="button" className="button button-secondary" disabled={questionIndex === 0} onClick={() => setQuestionIndex((current) => current - 1)}><ArrowLeft size={18} />上一題</button><span>{selected === undefined ? "請選擇一個答案" : "答案已記錄"}</span>{questionIndex < questions.length - 1 ? <button type="button" className="button button-primary" disabled={selected === undefined} onClick={() => setQuestionIndex((current) => current + 1)}>下一題<ArrowRight size={18} /></button> : <button type="button" className="button button-primary" disabled={questions.some((item) => answers[item.id] === undefined)} onClick={onSubmit}><Send size={17} />送出答案</button>}</div>
  </section>;
}
