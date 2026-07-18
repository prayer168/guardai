import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpenCheck, HandHeart, MessageCircleQuestion, MousePointerClick, SearchCheck, Users } from "lucide-react";

import { verificationSteps } from "@/lib/content";

const stepIcons = [MousePointerClick, SearchCheck, MessageCircleQuestion, BadgeCheck, HandHeart];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate min-h-[680px] overflow-hidden bg-navy text-ivory md:min-h-[720px]">
        <Image src="/images/guardai-hero.png" alt="學生陪祖母一起查看手機上的可疑訊息" fill priority sizes="100vw" className="object-cover object-[64%_center]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,24,41,.98)_0%,rgba(7,24,41,.9)_35%,rgba(7,24,41,.28)_72%,rgba(7,24,41,.12)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy/80 to-transparent" />
        <div className="site-container relative flex min-h-[680px] items-center py-20 md:min-h-[720px]">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-black leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">
              GuardAI
              <span className="mt-2 block text-gold">反詐守門員</span>
            </h1>
            <p className="mt-6 text-2xl font-bold leading-relaxed md:text-3xl">不替你判斷，陪你完成查證。</p>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ivory/75">
              貼上可疑訊息，找出風險線索、提出查證問題，學會在真正需要時停下來並找人幫忙。
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/analyze" className="button button-gold button-large">貼上可疑訊息 <ArrowRight aria-hidden="true" /></Link>
              <Link href="/challenge" className="button button-ghost-light button-large">先練一題</Link>
            </div>
            <p className="mt-6 text-sm font-semibold text-ivory/60">不需註冊｜不永久儲存貼入訊息｜不自動開啟陌生網址</p>
          </div>
        </div>
      </section>

      <section className="bg-ivory-deep/55 py-16 md:py-24">
        <div className="site-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">核心學習流程</p>
            <h2 className="mt-3 text-3xl font-black text-navy md:text-5xl">遇到可疑訊息，記住五個字</h2>
            <p className="mt-4 text-lg leading-8 text-ink-muted">不是猜真假，而是完成一套可以帶到下一個情境的查證流程。</p>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {verificationSteps.map((step, index) => {
              const Icon = stepIcons[index];
              return (
                <li key={step.key} className="step-card">
                  <div className="flex items-center justify-between">
                    <span className="step-key">{step.key}</span>
                    <Icon aria-hidden="true" className="text-gold-dark" />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="site-container grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
          <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem] bg-navy shadow-2xl shadow-navy/15">
            <Image src="/images/guardai-classroom.png" alt="教師與學生共同練習拆解詐騙訊息" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow">為什麼是教育科技？</p>
            <h2 className="mt-3 text-3xl font-black text-navy md:text-5xl">從一次判讀，走向能被證明的學習</h2>
            <p className="mt-5 text-lg leading-8 text-ink-muted">GuardAI 把 AI 判讀、情境闖關、前後測與匿名教師成果串成完整學習循環。</p>
            <div className="mt-7 grid gap-4">
              {[
                [BookOpenCheck, "會看證據", "AI 必須指出原文片段並用白話解釋，而不是只給分數。"],
                [Users, "會一起求助", "求助卡讓學生、家長與長者在壓力下仍能把問題交給可信任的人。"],
                [BadgeCheck, "看得見進步", "前測、六個情境與後測，讓評審與教師看見能力如何改變。"],
              ].map(([Icon, title, description]) => {
                const FeatureIcon = Icon as typeof BookOpenCheck;
                return <article key={String(title)} className="feature-row"><span><FeatureIcon aria-hidden="true" /></span><div><h3>{String(title)}</h3><p>{String(description)}</p></div></article>;
              })}
            </div>
            <Link href="/passport" className="button button-primary mt-8">查看學習護照 <ArrowRight aria-hidden="true" size={18} /></Link>
          </div>
        </div>
      </section>

      <section className="bg-navy py-16 text-ivory md:py-20">
        <div className="site-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold tracking-[.2em] text-gold">一個工具，三種真實場域</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">校園、家庭、社區都能開始</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["校園", "資訊素養課、班會與 AI 教學示範，搭配匿名前後測。"],
              ["家庭", "親子共同查證，降低長者獨自面對可疑訊息的壓力。"],
              ["社區", "用大字、少步驟與情境練習，支援據點防詐活動。"],
            ].map(([title, description], index) => (
              <article key={title} className="field-card"><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="site-container rounded-[2rem] border border-gold/30 bg-ivory-deep/60 px-6 py-12 text-center md:px-12">
          <p className="eyebrow">現在就練習</p>
          <h2 className="mt-3 text-3xl font-black text-navy md:text-5xl">下一則可疑訊息來時，你會知道怎麼做。</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-ink-muted">使用安全示範案例，不需輸入任何個人資料，也能完成一次完整判讀。</p>
          <Link href="/analyze" className="button button-primary button-large mt-7">進入 AI 判讀實驗室 <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>
    </>
  );
}
