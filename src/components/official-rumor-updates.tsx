import { ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";

import type { OfficialRumorItem } from "@/lib/official-rumors";
import { officialRumorDatasetUrl } from "@/lib/official-rumors-source";

export function OfficialRumorUpdates({ items }: { items: OfficialRumorItem[] }) {
  return (
    <section className="section-card" aria-labelledby="official-updates-title">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">165 官方開放資料串接</p>
          <h2 id="official-updates-title" className="section-title">最新可取得的詐騙闢謠</h2>
        </div>
        <span className="metric-pill"><RefreshCw aria-hidden="true" size={15} className="mr-1 inline" />每日檢查更新</span>
      </div>
      {items.length ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-navy/10 bg-ivory-deep/45 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black tracking-widest text-gold-dark">官方編號 {item.id}</span>
                <time className="text-xs font-bold text-ink-muted" dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString("zh-TW")}</time>
              </div>
              <h3 className="mt-3 text-lg font-black leading-7 text-navy">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-muted">{item.excerpt}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="notice notice-warning mt-6">
          <ShieldCheck aria-hidden="true" />
          <div><strong>官方資料暫時無法讀取</strong><p>人工查核的 14 類知識卡仍可正常使用，網站不會顯示未驗證的替代內容。</p></div>
        </div>
      )}
      <a href={officialRumorDatasetUrl} target="_blank" rel="noreferrer" className="button button-outline mt-6">
        <ExternalLink aria-hidden="true" size={18} />查看政府資料集與授權
      </a>
    </section>
  );
}
