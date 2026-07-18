"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { LearningRadar } from "@/components/learning-radar";
import { challengeScenarios, type SkillKey } from "@/lib/content";

const emptyScores: Record<SkillKey, number> = { 停: 35, 看: 35, 問: 35, 查: 35, 求: 35 };

export function ChallengeGame() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [skillScores, setSkillScores] = useState<Record<SkillKey, number>>(emptyScores);
  const complete = index >= challengeScenarios.length;
  const scenario = challengeScenarios[index];

  useEffect(() => {
    if (!complete) return;
    window.localStorage.setItem(
      "guardai-challenge",
      JSON.stringify({ correctCount, total: challengeScenarios.length, skillScores, completedAt: new Date().toISOString() }),
    );
  }, [complete, correctCount, skillScores]);

  function choose(optionId: string) {
    if (selected || !scenario) return;
    setSelected(optionId);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setSkillScores(emptyScores);
  }

  if (complete) {
    const finalScore = Math.round((correctCount / challengeScenarios.length) * 100);
    return (
      <section className="section-card text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-sage/15 text-sage-dark">
          <ShieldCheck aria-hidden="true" size={42} />
        </span>
        <p className="eyebrow mt-6">闖關完成</p>
        <h2 className="mt-2 text-3xl font-black text-navy md:text-4xl">你的查證力：{finalScore} 分</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-ink-muted">
          你答對 {correctCount}／{challengeScenarios.length} 題。分數不是標籤，而是提醒你下一次最值得練習哪一步。
        </p>
        <div className="mx-auto mt-4 max-w-xl">
          <LearningRadar scores={skillScores} />
        </div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="button button-primary" href="/passport">查看學習護照 <ArrowRight aria-hidden="true" size={18} /></Link>
          <button type="button" className="button button-outline" onClick={restart}>
            <RotateCcw aria-hidden="true" size={18} /> 再練一次
          </button>
        </div>
      </section>
    );
  }

  const isCorrect = selected === scenario.correctOption;

  return (
    <section className="section-card p-0">
      <div className="border-b border-navy/10 bg-ivory-deep/45 px-5 py-4 md:px-8">
        <div className="flex items-center justify-between gap-3 text-sm font-bold text-ink-muted">
          <span>情境 {index + 1}／{challengeScenarios.length}</span>
          <span>已答對 {correctCount} 題</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy/10" aria-hidden="true">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${((index + 1) / challengeScenarios.length) * 100}%` }} />
        </div>
      </div>

      <div className="p-5 md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-navy px-3 py-1 text-sm font-black text-gold">練習「{scenario.skill}」</span>
          {scenario.isBenign ? <span className="rounded-full bg-sage/15 px-3 py-1 text-sm font-bold text-sage-dark">正常訊息案例</span> : null}
        </div>
        <h2 className="mt-4 text-3xl font-black text-navy">{scenario.title}</h2>
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

        {selected ? (
          <div className={`mt-6 rounded-2xl p-5 ${isCorrect ? "bg-sage/12 text-sage-dark" : "bg-coral/10 text-coral-dark"}`} aria-live="polite">
            <div className="flex items-center gap-2 text-lg font-black">
              {isCorrect ? <CheckCircle2 aria-hidden="true" /> : <XCircle aria-hidden="true" />}
              {isCorrect ? "這一步很安全" : "先停一下，再想一次"}
            </div>
            <p className="mt-2 leading-7">{scenario.explanation}</p>
            <button type="button" className="button button-primary mt-5" onClick={next}>
              {index === challengeScenarios.length - 1 ? "查看學習成果" : "下一個情境"}
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
