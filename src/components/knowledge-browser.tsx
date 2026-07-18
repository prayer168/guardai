"use client";

import {
  ArrowRight,
  BookOpenCheck,
  CircleAlert,
  Download,
  ExternalLink,
  Search,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { knowledgeItems } from "@/lib/knowledge";

const groups = ["全部", ...Array.from(new Set(knowledgeItems.map((item) => item.group)))] as const;

export function KnowledgeBrowser() {
  const [group, setGroup] = useState<(typeof groups)[number]>("全部");
  const [query, setQuery] = useState("");

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return knowledgeItems.filter((item) => {
      const groupMatch = group === "全部" || item.group === group;
      const searchable = [
        item.category,
        item.title,
        item.tagline,
        item.summary,
        item.cue,
        item.verify,
        ...item.flow.flatMap((step) => [step.title, step.description]),
        ...item.outcomes,
        ...item.actions,
      ]
        .join(" ")
        .toLowerCase();
      return groupMatch && (!normalized || searchable.includes(normalized));
    });
  }, [group, query]);

  return (
    <div className="space-y-8">
      <section className="research-banner" aria-labelledby="research-title">
        <div className="research-icon"><Sparkles aria-hidden="true" /></div>
        <div>
          <p className="eyebrow">Deep research｜2026-07-18 完成查核</p>
          <h2 id="research-title" className="mt-2 text-2xl font-black text-navy">14 種詐騙 × 56 個流程節點 × 官方來源</h2>
          <p className="mt-2 leading-7 text-ink-muted">每一類都用「接觸、取信、施壓、收割」拆解，並列出可能結果、立即處置與三個查證問題。海報主視覺由 OpenAI Images 2.0 生成，文字內容則由官方資料人工查核後呈現。</p>
        </div>
      </section>

      <section className="section-card">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <span className="sr-only">搜尋詐騙方式、流程或因應方法</span>
            <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="text-input pl-12"
              placeholder="搜尋詐騙方式、流程或因應方法"
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="知識分類">
            {groups.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={group === item}
                className={`filter-chip ${group === item ? "filter-chip-active" : ""}`}
                onClick={() => setGroup(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 text-sm font-bold text-ink-muted" aria-live="polite">目前顯示 {visibleItems.length} 種詐騙方式</p>
      </section>

      <div className="grid gap-7 xl:grid-cols-2">
        {visibleItems.map((item, index) => (
          <article key={item.id} className="deep-knowledge-card">
            <figure className="knowledge-poster">
              <Image
                src={item.poster}
                alt={item.posterAlt}
                fill
                sizes="(max-width: 1279px) 100vw, 50vw"
                className="object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
              <figcaption className="knowledge-poster-caption">
                <span className="poster-kicker">{item.category}</span>
                <h2>{item.title}</h2>
                <p>{item.tagline}</p>
              </figcaption>
            </figure>

            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-gold/15 px-3 py-1 text-sm font-black text-gold-dark">{item.group}</span>
                <span className="text-xs font-semibold text-ink-muted">查核 {item.reviewed}</span>
              </div>
              <p className="mt-4 text-lg font-bold leading-8 text-navy">{item.summary}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="knowledge-callout knowledge-callout-risk">
                  <CircleAlert aria-hidden="true" />
                  <div><h3>先看這些線索</h3><p>{item.cue}</p></div>
                </div>
                <div className="knowledge-callout knowledge-callout-safe">
                  <ShieldCheck aria-hidden="true" />
                  <div><h3>改用這種查法</h3><p>{item.verify}</p></div>
                </div>
              </div>

              <section className="mt-6" aria-labelledby={`${item.id}-flow`}>
                <div className="flex items-center gap-2">
                  <BookOpenCheck aria-hidden="true" className="text-gold-dark" size={21} />
                  <h3 id={`${item.id}-flow`} className="text-lg font-black text-navy">詐騙流程怎麼走？</h3>
                </div>
                <ol className="scam-flow mt-4">
                  {item.flow.map((step, index) => (
                    <li key={`${item.id}-${step.stage}`}>
                      <span className="flow-number">{index + 1}</span>
                      <div>
                        <span className="flow-stage">{step.stage}</span>
                        <strong>{step.title}</strong>
                        <p>{step.description}</p>
                      </div>
                      {index < item.flow.length - 1 ? <ArrowRight aria-hidden="true" className="flow-arrow" /> : null}
                    </li>
                  ))}
                </ol>
              </section>

              <details className="knowledge-details mt-6">
                <summary>展開可能結果、因應步驟與查證問題</summary>
                <div className="knowledge-detail-grid">
                  <section className="impact-panel">
                    <h3>可能造成的結果</h3>
                    <ul>{item.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
                  </section>
                  <section className="action-panel">
                    <h3>現在應該怎麼做</h3>
                    <ol>{item.actions.map((action, index) => <li key={action}><span>{index + 1}</span>{action}</li>)}</ol>
                  </section>
                  <section className="question-panel">
                    <h3>先問這三個查證問題</h3>
                    <ol>{item.verificationQuestions.map((question, index) => <li key={question}><span>{index + 1}</span>{question}</li>)}</ol>
                  </section>
                  <section className="source-panel">
                    <h3>官方資料來源</h3>
                    <ul>
                      {item.sources.map((source) => (
                        <li key={source.url}>
                          <a href={source.url} target="_blank" rel="noreferrer">
                            <span>{source.name}</span>
                            <small>{source.publisher}</small>
                            <ExternalLink aria-hidden="true" size={15} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </details>

              <div className="mt-5 flex flex-wrap gap-3">
                <a className="button button-outline knowledge-button" href={item.poster} download>
                  <Download aria-hidden="true" size={17} />下載海報主視覺
                </a>
                <a className="button button-primary knowledge-button" href={item.sources[0].url} target="_blank" rel="noreferrer">
                  <ExternalLink aria-hidden="true" size={17} />查閱主要官方來源
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!visibleItems.length ? (
        <div className="section-card text-center">
          <ShieldQuestion aria-hidden="true" className="mx-auto text-gold" size={42} />
          <h2 className="mt-3 text-xl font-black text-navy">找不到相符內容</h2>
          <p className="mt-2 text-ink-muted">換一個關鍵字或切回「全部」。</p>
        </div>
      ) : null}

      <section className="notice notice-info">
        <ExternalLink aria-hidden="true" />
        <div>
          <strong>官方來源會持續更新</strong>
          <p>目前內容由警政署、刑事警察局、勞動部、地方檢察署與行政院消保會資料整理；<code>/api/knowledge</code> 已保留未來串接 165 開放資料的介面。</p>
        </div>
      </section>
    </div>
  );
}
