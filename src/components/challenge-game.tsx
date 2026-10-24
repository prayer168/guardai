"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { LearningRadar } from "@/components/learning-radar";
import { challengeScenarios, type SkillKey } from "@/lib/content";

const emptyScores: Record<SkillKey, number> = { 停: 35, 看: 35, 問: 35, 查: 35, 求: 35 };

export function ChallengeGame() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [skillScores, setSkillScores] = useState<Record<SkillKey, number>>(emptyScores);
  const [chosenAnswers, setChosenAnswers] = useState<Record<string, string>>({});
  const [reviewIndex, setReviewIndex] = useState(0);
  const complete = index >= challengeScenarios.length;
  const scenario = challengeScenarios[index];

  useEffect(() => {
    if (!complete) return;
    window.localStorage.setItem(
      "guardai-challenge",
      JSON.stringify({ correctCount, total: challengeScenarios.length, skillScores, answers: chosenAnswers, completedAt: new Date().toISOString() }),
    );
  }, [complete, correctCount, skillScores, chosenAnswers]);

  function choose(optionId: string) {
    if (selected || !scenario) return;
    setSelected(optionId);
    setChosenAnswers((answers) => ({ ...answers, [scenario.id]: optionId }));
    if (optionId === scenario.correctOption) {
      setCorrectCount((value) => value + 1);
      setSkillScores((scores) => ({ ...scores, [scenario.skill]: Math.min(100, scores[scenario.skill] + 32) }));
    } else {
      setSkillScores((scores) => ({ ...scores, [scenario.skill]: Math.min(100, scores[scenario.skill] + 12) }));
    }
  }

  function next() {
    setSelected(null);
    setIndex((value) => value + 1);
    document.getElementById("main-content")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setSkillScores(emptyScores);
    setChosenAnswers({});
    setReviewIndex(0);
    window.localStorage.removeItem("guardai-challenge");
  }

  if (complete) {
    const finalScore = Math.round((correctCount / challengeScenarios.length) * 100);
    const missedScenarios = challengeScenarios.filter((item) => chosenAnswers[item.id] !== item.correctOption);
    const reviewScenario = missedScenarios[reviewIndex];
    const chosenOption = reviewScenario?.options.find((option) => option.id === chosenAnswers[reviewScenario.id]);
    return (
      <section className="section-card challenge-results-card" aria-labelledby="challenge-results-title">
        <header className="challenge-results-heading">
          <div className="challenge-results-score">
            <span className="challenge-results-icon"><ShieldCheck aria-hidden="true" size={30} /></span>
            <div><p className="eyebrow">六個情境已完成</p><h2 id="challenge-results-title">查證力 {finalScore} 分</h2><p>答對 {correctCount}／{challengeScenarios.length} 題 · 分數是練習方向，不是能力標籤。</p></div>
          </div>
          <div className="challenge-results-actions">
            <Link className="button button-primary" href="/passport"><BookOpenCheck aria-hidden="true" size={18} />前往後測<ArrowRight aria-hidden="true" size={18} /></Link>
            <button type="button" className="button button-outline" onClick={restart}><RotateCcw aria-hidden="true" size={18} />再練一次</button>
            <Link className="button button-secondary" href="/passport">回學習護照</Link>
          </div>
        </header>
        <div className="challenge-results-details">
          <section className="challenge-results-radar" aria-label="查證策略學習概況"><h3>五項查證策略</h3><LearningRadar scores={skillScores} /></section>
          <section className="challenge-results-review" aria-live="polite">
            <div className="challenge-results-review-heading"><div><p className="eyebrow">學習回饋</p><h3>{missedScenarios.length ? `再看一次錯題（${missedScenarios.length} 題）` : "六題全答對"}</h3></div>{missedScenarios.length ? <span>{reviewIndex + 1}／{missedScenarios.length}</span> : null}</div>
            {reviewScenario ? <>
              <article className="challenge-results-review-item">
                <h4>{reviewScenario.title}</h4>
                <p><strong>你的選擇：</strong>{chosenOption?.label ?? "未作答"}</p>
                <p><strong>建議做法：</strong>{reviewScenario.options.find((option) => option.id === reviewScenario.correctOption)?.label}</p>
                <p className="challenge-results-explanation">{reviewScenario.explanation}</p>
              </article>
              <div className="challenge-results-review-controls">
                <button type="button" className="button button-secondary" disabled={reviewIndex === 0} onClick={() => setReviewIndex((value) => value - 1)}><ArrowLeft aria-hidden="true" size={16} />上一題</button>
                <button type="button" className="button button-secondary" disabled={reviewIndex >= missedScenarios.length - 1} onClick={() => setReviewIndex((value) => value + 1)}>下一題<ArrowRight aria-hidden="true" size={16} /></button>
              </div>
            </> : <div className="challenge-results-perfect"><CheckCircle2 aria-hidden="true" /><p>你能在不同情境中選出安全的查證行動。可以前往後測，看看策略是否也能用在新題目裡。</p></div>}
          </section>
        </div>
      </section>
    );
  }

  const isCorrect = selected === scenario.correctOption;

  return (
    <>
    <section className="section-card challenge-card p-0">
      <div className="challenge-card-header border-b border-navy/10 bg-ivory-deep/45 px-5 py-4 md:px-8">
        <div className="flex items-center justify-between gap-3 text-sm font-bold text-ink-muted">
          <span>情境 {index + 1}／{challengeScenarios.length}</span>
          <span>已答對 {correctCount} 題</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy/10" aria-hidden="true">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${((index + 1) / challengeScenarios.length) * 100}%` }} />
        </div>
      </div>

      <div className="challenge-card-body p-5 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-navy px-3 py-1 text-sm font-black text-gold">練習「{scenario.skill}」</span>
          {scenario.isBenign ? <span className="rounded-full bg-sage/15 px-3 py-1 text-sm font-bold text-sage-dark">正常訊息案例</span> : null}
        </div>
        <h2 className="challenge-card-title mt-4 text-3xl font-black text-navy">{scenario.title}</h2>
        <p className="mt-2 text-ink-muted">{scenario.context}</p>
        <blockquote className="message-bubble mt-6">{scenario.message}</blockquote>

        <fieldset className="mt-7">
          <legend className="text-lg font-black text-navy">你會選擇哪一步？</legend>
          <div className="mt-4 grid gap-3">
            {scenario.options.map((option) => {
              const chosen = selected === option.id;
              const correct = option.id === scenario.correctOption;
              const stateClass = selected ? (correct ? "option-correct" : chosen ? "option-wrong" : "option-muted") : "";
              return (
                <button
                  key={option.id}
                  type="button"
                  className={`challenge-option ${stateClass}`}
                  disabled={Boolean(selected)}
                  onClick={() => choose(option.id)}
                >
                  <span className="option-mark" aria-hidden="true">
                    {selected && correct ? <CheckCircle2 /> : selected && chosen ? <XCircle /> : String.fromCharCode(65 + scenario.options.indexOf(option))}
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

      </div>
    </section>
    {selected ? (
      <div className="challenge-feedback-backdrop">
        <section className={`challenge-feedback-dialog ${isCorrect ? "challenge-feedback-correct" : "challenge-feedback-review"}`} role="dialog" aria-modal="true" aria-labelledby="challenge-feedback-title" aria-describedby="challenge-feedback-explanation">
          <div className="challenge-feedback-icon">
            {isCorrect ? <CheckCircle2 aria-hidden="true" size={27} /> : <XCircle aria-hidden="true" size={27} />}
          </div>
          <div>
            <p className="challenge-feedback-eyebrow">情境 {index + 1} / {challengeScenarios.length}｜解題解析</p>
            <h2 id="challenge-feedback-title">{isCorrect ? "這一步很安全" : "先停一下，再想一次"}</h2>
            <p id="challenge-feedback-explanation">{scenario.explanation}</p>
          </div>
          <button type="button" className="button button-primary challenge-feedback-next" autoFocus onClick={next}>
            {index === challengeScenarios.length - 1 ? "查看學習成果" : "下一個情境"}
            <ArrowRight aria-hidden="true" size={18} />
          </button>
        </section>
      </div>
    ) : null}
    </>
  );
}
