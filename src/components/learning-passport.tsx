"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, RotateCcw, Send, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { classroomPackLabels, type ClassroomPack } from "@/lib/classroom";

type Question = {
  id: string;
  prompt: string;
  options: [string, string, string];
  answer: number;
  concept: string;
};

const preQuestions: Question[] = [
  { id: "pre1", prompt: "客服說誤設分期並要求操作 ATM，第一步應該？", options: ["保持通話去 ATM", "先掛斷並獨立查證", "先提供帳號"], answer: 1, concept: "先暫停" },
  { id: "pre2", prompt: "陌生簡訊只要求補繳 35 元，風險較低嗎？", options: ["是，小額不會詐騙", "不一定，小額可能降低戒心", "有物流圖示就安全"], answer: 1, concept: "小額誘餌" },
  { id: "pre3", prompt: "親友用新號碼借錢，較可靠的查證是？", options: ["看語氣像不像", "用原本電話回撥", "請對方傳身分證"], answer: 1, concept: "獨立查證" },
  { id: "pre4", prompt: "誰可以向你索取 OTP 驗證碼？", options: ["自稱銀行客服的人", "熟識的朋友", "任何人都不應索取"], answer: 2, concept: "保護個資" },
  { id: "pre5", prompt: "AI 顯示低風險後，代表一定安全嗎？", options: ["是", "否，仍需確認來源", "只有學生需要確認"], answer: 1, concept: "理解 AI 限制" },
];

const postQuestions: Question[] = [
  { id: "post1", prompt: "訊息要求『不要告訴家人』，最重要的警示是？", options: ["文字不禮貌", "切斷外部求助", "對方可能很忙"], answer: 1, concept: "保密控制" },
  { id: "post2", prompt: "帳號停權私訊附登入連結，安全做法是？", options: ["趕快點連結", "直接開官方 App 查看", "回傳 OTP"], answer: 1, concept: "更換入口" },
  { id: "post3", prompt: "已經匯出第一筆保證金，接下來應？", options: ["再匯一筆出金", "停止、保留紀錄並求助", "刪除全部對話"], answer: 1, concept: "停止損失" },
  { id: "post4", prompt: "沒有連結、沒有金錢要求的通知需要怎麼看？", options: ["全部刪除", "仍從官方入口確認", "一定安全"], answer: 1, concept: "避免過度警示" },
  { id: "post5", prompt: "GuardAI 最重要的用途是？", options: ["替人宣布真假", "培養可重複使用的查證能力", "取代警察與銀行"], answer: 1, concept: "查證能力" },
];

type StoredAssessment = { score: number; answers: Record<string, number>; completedAt: string };
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
        const savedPre = window.localStorage.getItem("guardai-pretest");
        const savedPost = window.localStorage.getItem("guardai-posttest");
        setPreResult(savedPre ? (JSON.parse(savedPre) as StoredAssessment) : null);
        setPostResult(savedPost ? (JSON.parse(savedPost) as StoredAssessment) : null);
      } catch {
        window.localStorage.removeItem("guardai-pretest");
        window.localStorage.removeItem("guardai-posttest");
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
    const result = { score: calculateScore(questions, answers), answers, completedAt: new Date().toISOString() };
    window.localStorage.setItem(kind === "pre" ? "guardai-pretest" : "guardai-posttest", JSON.stringify(result));
    if (kind === "pre") setPreResult(result);
    else setPostResult(result);
  }

  function clearProgress() {
    if (!window.confirm("確定清除這台裝置上的匿名學習紀錄？")) return;
    ["guardai-pretest", "guardai-posttest", "guardai-challenge", "guardai-analysis-count"].forEach((key) => window.localStorage.removeItem(key));
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
        body: JSON.stringify({
          learnerId: learnerId(),
          preScore: preResult.score,
          postScore: postResult.score,
          challengeScore,
          analysisCount,
          missedConcepts,
        }),
      });
      const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
      if (!response.ok) {
        throw new Error(typeof body?.error === "string" ? body.error : "匿名成果暫時無法提交。");
      }
      window.localStorage.setItem(`guardai-class-submitted:${classCode}`, new Date().toISOString());
      setClassSubmitted(true);
      setClassStatus("匿名成果已提交；教師只會看到全班彙總。");
    } catch (reason) {
      setClassStatus(reason instanceof Error ? reason.message : "匿名成果暫時無法提交。");
    } finally {
      setClassBusy(false);
    }
  }

  const improvement = preResult && postResult ? postResult.score - preResult.score : null;
  const missedConcepts = postResult
    ? postQuestions.filter((question) => postResult.answers[question.id] !== question.answer).map((question) => question.concept)
    : [];

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="metric-card"><BookOpenCheck aria-hidden="true" /><strong>{preResult ? `${preResult.score} 分` : "未完成"}</strong><span>查證力前測</span></article>
        <article className="metric-card"><ShieldCheck aria-hidden="true" /><strong>{challengeComplete ? "已完成" : "待練習"}</strong><span>六個防詐情境</span></article>
        <article className="metric-card"><BarChart3 aria-hidden="true" /><strong>{analysisCount} 次</strong><span>AI 判讀練習</span></article>
      </section>

      {preResult && postResult ? (
        <section className="rounded-3xl bg-navy p-6 text-ivory md:p-8">
          <p className="text-sm font-bold tracking-widest text-gold">學習成果</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            <div><span className="text-sm text-ivory/65">前測</span><strong className="block text-4xl">{preResult.score}</strong></div>
            <div><span className="text-sm text-ivory/65">後測</span><strong className="block text-4xl">{postResult.score}</strong></div>
            <div><span className="text-sm text-ivory/65">進步幅度</span><strong className="block text-4xl text-gold">{improvement !== null && improvement >= 0 ? "+" : ""}{improvement}</strong></div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="font-bold">接下來最值得練習：</p>
            <p className="mt-1 text-ivory/75">{missedConcepts.length ? missedConcepts.join("、") : "你已掌握本次所有重點，可用新的真實情境繼續練習。"}</p>
          </div>
        </section>
      ) : null}

      {classCode ? (
        <section className="section-card">
          <div className="feature-row">
            <span><Users aria-hidden="true" /></span>
            <div>
              <p className="eyebrow">匿名班級 {classCode}</p>
              <h2 className="section-title">提交全班彙總所需的學習成果</h2>
              <p className="mt-2 leading-7 text-ink-muted">
                {classPack ? `教師指派：${classroomPackLabels[classPack]}。` : ""}
                只送出前測、後測、闖關分數、判讀次數及常忽略概念；不送出姓名、個別答案或可疑訊息。
              </p>
              {preResult && postResult && challengeScore !== null ? (
                <button type="button" className="button button-primary mt-5" disabled={classBusy} onClick={submitAnonymousClassResult}>
                  <Send aria-hidden="true" size={18} />{classBusy ? "提交中…" : classSubmitted ? "更新匿名成果" : "提交匿名成果"}
                </button>
              ) : (
                <p className="mt-4 rounded-xl bg-ivory-deep/65 p-4 font-bold text-navy">完成前測、六題闖關與後測後即可提交。</p>
              )}
              <p className="mt-3 min-h-6 text-sm font-bold text-navy" aria-live="polite">{classStatus}</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="notice notice-info">
          <Users aria-hidden="true" />
          <div><strong>有教師提供班級代碼嗎？</strong><p>先到 <Link href="/join" className="font-black underline underline-offset-4">加入匿名班級</Link>，完成後即可把分數以匿名彙總方式提交。</p></div>
        </section>
      )}

      <AssessmentSection
        title="第一站｜五題前測"
        description="先了解自己原本會怎麼做。答案只儲存在這台裝置，不會公開排名。"
        questions={preQuestions}
        answers={preAnswers}
        setAnswers={setPreAnswers}
        result={preResult}
        onSubmit={() => submitAssessment("pre")}
      />

      {preResult && !challengeComplete ? (
        <section className="section-card text-center">
          <p className="eyebrow">第二站｜情境練習</p>
          <h2 className="section-title">用六個情境練習「停、看、問、查、求」</h2>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-ink-muted">完成闖關後，後測才會解鎖，讓前後測真正反映學習歷程。</p>
          <Link href="/challenge" className="button button-primary mt-6">前往防詐闖關 <ArrowRight aria-hidden="true" size={18} /></Link>
        </section>
      ) : null}

      {preResult && challengeComplete ? (
        <AssessmentSection
          title="第三站｜五題後測"
          description="換一組情境，看看你是否已經能把查證策略帶到新的訊息裡。"
          questions={postQuestions}
          answers={postAnswers}
          setAnswers={setPostAnswers}
          result={postResult}
          onSubmit={() => submitAssessment("post")}
        />
      ) : null}

      <div className="flex justify-center">
        <button type="button" className="text-button" onClick={clearProgress}><RotateCcw aria-hidden="true" size={17} />清除本機匿名紀錄</button>
      </div>
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
};

function AssessmentSection({ title, description, questions, answers, setAnswers, result, onSubmit }: AssessmentSectionProps) {
  return (
    <section className="section-card">
      <p className="eyebrow">匿名學習評量</p>
      <h2 className="section-title">{title}</h2>
      <p className="mt-3 leading-7 text-ink-muted">{description}</p>
      {result ? (
        <div className="mt-6 rounded-2xl bg-sage/12 p-5 text-sage-dark">
          <strong className="text-2xl">已完成：{result.score} 分</strong>
          <p className="mt-1">你可以保留這份結果，繼續下一段學習。</p>
        </div>
      ) : (
        <div className="mt-7 space-y-7">
          {questions.map((question, questionIndex) => (
            <fieldset key={question.id}>
              <legend className="font-black leading-7 text-navy">{questionIndex + 1}. {question.prompt}</legend>
              <div className="mt-3 grid gap-2">
                {question.options.map((option, optionIndex) => (
                  <label key={option} className="radio-option">
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === optionIndex}
                      onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button type="button" className="button button-primary" disabled={Object.keys(answers).length !== questions.length} onClick={onSubmit}>
            完成評量
          </button>
        </div>
      )}
    </section>
  );
}
