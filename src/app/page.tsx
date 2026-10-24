import Link from "next/link";
import { ArrowRight, BadgeCheck, HandHeart, MessageCircleQuestion, MousePointerClick, Phone, PlayCircle, SearchCheck } from "lucide-react";

import { verificationSteps } from "@/lib/content";

const stepIcons = [MousePointerClick, SearchCheck, MessageCircleQuestion, BadgeCheck, HandHeart];

export default function HomePage() {
  return (
    <section className="home-screen site-container grid items-center gap-5 py-5 lg:grid-cols-[1fr_.9fr] lg:gap-10 lg:py-8">
      <div className="home-copy">
        <p className="eyebrow">2026 TAIA AI 創意設計大賽｜高中職組</p>
        <h1 className="mt-3 text-4xl font-black leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-6xl">GuardAI <span className="text-coral">反詐守門員</span></h1>
        <p className="mt-3 text-xl font-black text-navy sm:text-2xl">不替你判斷，陪你完成查證。</p>
        <p className="mt-3 max-w-xl leading-7 text-ink-muted">把可疑訊息變成一次學習：找證據、問對問題、獨立查證，必要時向可信任的人求助。</p>
        <a href="tel:165" title="點擊後由手機或預設電話程式開啟撥號" className="home-hotline" aria-label="以目前裝置撥打 165 反詐騙諮詢專線">
          <span className="home-hotline-icon"><Phone aria-hidden="true" size={25} /></span>
          <span className="home-hotline-copy"><span className="home-hotline-label">遇到疑似詐騙？立即求助</span><strong>165</strong><span className="home-hotline-detail">反詐騙諮詢專線｜開啟裝置撥號</span></span>
          <ArrowRight aria-hidden="true" className="home-hotline-arrow" size={24} />
        </a>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/analyze" className="button button-primary">開始查證練習 <ArrowRight aria-hidden="true" size={18} /></Link>
          <Link href="/challenge" className="button button-outline">情境闖關</Link>
          <Link href="/showcase" className="button button-gold"><PlayCircle aria-hidden="true" size={18} />競賽展示</Link>
        </div>
        <p className="mt-4 text-xs font-bold text-ink-muted">不需註冊｜不永久保存貼入訊息｜不自動開啟陌生網址</p>
      </div>
      <div className="home-method rounded-3xl bg-navy p-5 text-ivory sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div><p className="text-xs font-black tracking-[.18em] text-gold">五步查證法</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">遇到可疑訊息，記住五個字</h2></div>
          <BadgeCheck aria-hidden="true" className="text-gold" size={28} />
        </div>
        <ol className="mt-4 grid grid-cols-5 gap-2">
          {verificationSteps.map((step, index) => {
            const Icon = stepIcons[index];
            return <li key={step.key} className="rounded-2xl border border-white/10 bg-white/5 p-2.5 sm:p-3">
              <span className="grid size-8 place-items-center rounded-full bg-gold text-sm font-black text-navy">{step.key}</span>
              <h3 className="mt-2 font-black">{step.title}</h3>
              <p className="mt-1 hidden text-xs leading-5 text-ivory/70 sm:block">{step.description}</p>
              <Icon aria-hidden="true" className="mt-2 text-gold/80 sm:hidden" size={16} />
            </li>;
          })}
        </ol>
        <p className="mt-4 border-t border-white/10 pt-3 text-sm leading-6 text-ivory/70">以可解釋 AI、六種情境練習與匿名前後測，培養能帶到日常生活的查證能力。</p>
      </div>
    </section>
  );
}
