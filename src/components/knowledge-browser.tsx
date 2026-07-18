"use client";

import { ExternalLink, Search, ShieldQuestion } from "lucide-react";
import { useMemo, useState } from "react";

import { knowledgeItems } from "@/lib/content";

const categories = ["全部", ...Array.from(new Set(knowledgeItems.map((item) => item.category)))] as const;

export function KnowledgeBrowser() {
  const [category, setCategory] = useState<(typeof categories)[number]>("全部");
  const [query, setQuery] = useState("");

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return knowledgeItems.filter((item) => {
      const categoryMatch = category === "全部" || item.category === category;
      const queryMatch = !normalized || `${item.title}${item.cue}${item.verify}`.toLowerCase().includes(normalized);
      return categoryMatch && queryMatch;
    });
  }, [category, query]);

  return (
    <div className="space-y-7">
      <section className="section-card">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
            <span className="sr-only">搜尋防詐知識</span>
            <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={20} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="text-input pl-12" placeholder="搜尋風險線索或查證方法" />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="知識分類">
            {categories.map((item) => (
              <button key={item} type="button" className={`filter-chip ${category === item ? "filter-chip-active" : ""}`} onClick={() => setCategory(item)}>{item}</button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visibleItems.map((item) => (
          <article key={item.id} className="knowledge-card">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-gold/15 px-3 py-1 text-sm font-black text-gold-dark">{item.category}</span>
              <span className="text-xs font-semibold text-ink-muted">更新 {item.updated}</span>
            </div>
            <h2 className="mt-4 text-2xl font-black text-navy">{item.title}</h2>
            <div className="mt-5 space-y-4">
              <div><h3 className="text-sm font-black tracking-wider text-coral-dark">風險線索</h3><p className="mt-1 leading-7 text-ink-muted">{item.cue}</p></div>
              <div><h3 className="text-sm font-black tracking-wider text-sage-dark">怎麼查證</h3><p className="mt-1 leading-7 text-ink-muted">{item.verify}</p></div>
            </div>
            <a className="mt-5 inline-flex items-center gap-1 font-bold text-navy underline decoration-gold decoration-2 underline-offset-4" href={item.sourceUrl} target="_blank" rel="noreferrer">
              {item.source} <ExternalLink aria-hidden="true" size={15} />
            </a>
          </article>
        ))}
      </div>

      {!visibleItems.length ? (
        <div className="section-card text-center"><ShieldQuestion aria-hidden="true" className="mx-auto text-gold" size={42} /><h2 className="mt-3 text-xl font-black text-navy">找不到相符內容</h2><p className="mt-2 text-ink-muted">換一個關鍵字或切回「全部」。</p></div>
      ) : null}

      <section className="notice notice-info">
        <ExternalLink aria-hidden="true" />
        <div><strong>已預留 165 開放資料介面</strong><p>本 MVP 使用人工整理的官方資料摘要；後續可由 <code>/api/knowledge</code> 串接並定期更新。</p></div>
      </section>
    </div>
  );
}
