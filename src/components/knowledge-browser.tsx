"use client";

import { CheckCircle2, ExternalLink, Newspaper, ShieldAlert, ShieldCheck, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PresentationFrame } from "@/components/presentation-frame";
import { knowledgeItems } from "@/lib/knowledge";
import { officialRumorDatasetUrl, type OfficialRumorItem } from "@/lib/official-rumors";

const groups = ["全部", ...Array.from(new Set(knowledgeItems.map((item) => item.group)))];
const panels = ["認識主題", "詐騙流程", "可能影響", "立即處置"] as const;
type PanelIndex = 0 | 1 | 2 | 3;

export function KnowledgeBrowser({ officialRumors }: { officialRumors: OfficialRumorItem[] }) {
  const dialogCloseRef = useRef<HTMLButtonElement>(null);
  const [group, setGroup] = useState("全部");
  const [query, setQuery] = useState("");
  const [topicIndex, setTopicIndex] = useState(0);
  const [panelIndex, setPanelIndex] = useState<PanelIndex>(0);
  const [rumorsOpen, setRumorsOpen] = useState(false);
  const [rumorIndex, setRumorIndex] = useState(0);

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("zh-Hant");
    return knowledgeItems.filter((item) => {
      const groupMatches = group === "全部" || item.group === group;
      const searchable = [item.category, item.title, item.tagline, item.summary, item.cue, item.verify, ...item.flow.flatMap((step) => [step.title, step.description]), ...item.outcomes, ...item.actions].join(" ").toLocaleLowerCase("zh-Hant");
      const searchMatches = !normalized || searchable.includes(normalized);
      return groupMatches && searchMatches;
    });
  }, [group, query]);

  const currentIndex = Math.min(topicIndex, Math.max(visibleItems.length - 1, 0));
  const item = visibleItems[currentIndex];
  const currentRumor = officialRumors[Math.min(rumorIndex, Math.max(officialRumors.length - 1, 0))];
  const pageNumber = visibleItems.length ? currentIndex * panels.length + panelIndex + 1 : 0;
  const pageCount = visibleItems.length * panels.length;

  const goNext = useCallback(() => {
    if (panelIndex < panels.length - 1) {
      setPanelIndex((value) => (value + 1) as PanelIndex);
      return;
    }
    setTopicIndex((value) => (value + 1) % Math.max(visibleItems.length, 1));
    setPanelIndex(0);
  }, [panelIndex, visibleItems.length]);

  const goPrevious = useCallback(() => {
    if (panelIndex > 0) {
      setPanelIndex((value) => (value - 1) as PanelIndex);
      return;
    }
    setTopicIndex((value) => (value - 1 + Math.max(visibleItems.length, 1)) % Math.max(visibleItems.length, 1));
    setPanelIndex(3);
  }, [panelIndex, visibleItems.length]);

  const changeGroup = (value: string) => {
    setGroup(value);
    setTopicIndex(0);
    setPanelIndex(0);
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    setTopicIndex(0);
    setPanelIndex(0);
  };

  useEffect(() => {
    if (!rumorsOpen) return;
    dialogCloseRef.current?.focus();
  }, [rumorsOpen]);

  useEffect(() => {
    if (!rumorsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRumorsOpen(false);
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setRumorIndex((value) => (value + 1) % Math.max(officialRumors.length, 1));
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setRumorIndex((value) => (value - 1 + Math.max(officialRumors.length, 1)) % Math.max(officialRumors.length, 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [officialRumors.length, rumorsOpen]);

  return (
    <PresentationFrame title="防詐簡報" subtitle="把可疑情境拆成看得懂的步驟" pageNumber={pageNumber} pageCount={pageCount} pageLabel={item ? `${item.category}　·　第 ${panelIndex + 1} 張` : "請重新搜尋"} onPrevious={goPrevious} onNext={goNext} actions={(
      <button type="button" className="knowledge-icon-button knowledge-rumor-button" onClick={() => setRumorsOpen(true)} aria-label="查看 165 官方最新闢謠">
        <Newspaper aria-hidden="true" size={18} /><span>165 闢謠</span>
      </button>
    )}>
      <div className="presentation-body-inner">
      <section className="knowledge-selector" aria-label="選擇知識主題">
        <label>
          <span>分類</span>
          <select value={group} onChange={(event) => changeGroup(event.target.value)} aria-label="篩選知識分類">
            {groups.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="knowledge-search-label">
          <span>搜尋主題</span>
          <input type="search" value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="輸入關鍵字" aria-label="搜尋防詐主題" />
        </label>
        <label className="knowledge-topic-label">
          <span>主題</span>
          <select
            value={item?.id ?? ""}
            onChange={(event) => {
              setTopicIndex(visibleItems.findIndex((candidate) => candidate.id === event.target.value));
              setPanelIndex(0);
            }}
            aria-label="選擇防詐主題"
          >
            {visibleItems.map((option) => <option key={option.id} value={option.id}>{option.category}｜{option.title}</option>)}
            {!visibleItems.length ? <option value="">沒有相符主題</option> : null}
          </select>
        </label>
      </section>

      <section className="knowledge-deck" aria-label="簡報頁面">
        <div className="knowledge-deck-heading">
          <p className="knowledge-page-kicker" aria-live="polite">{item ? `${item.group}　/　${item.category}` : "搜尋結果"}</p>
        </div>

        <nav className="knowledge-panel-tabs" aria-label="目前主題的簡報頁">
          {panels.map((panel, index) => (
            <button key={panel} type="button" aria-current={panelIndex === index ? "step" : undefined} className={panelIndex === index ? "knowledge-panel-tab is-current" : "knowledge-panel-tab"} onClick={() => setPanelIndex(index as PanelIndex)}>
              <span>{index + 1}</span>{panel}
            </button>
          ))}
        </nav>

        {item ? (
          <article key={`${item.id}-${panelIndex}`} className={`knowledge-slide knowledge-slide-${panelIndex}`} aria-live="polite" aria-atomic="true">
            {panelIndex === 0 ? (
              <>
                <div className="knowledge-overview">
                  <figure className="knowledge-slide-poster">
                    <Image src={item.poster} alt={item.posterAlt} fill sizes="(max-width: 640px) 28vw, 20vw" className="object-contain" priority={currentIndex < 2} />
                  </figure>
                  <div className="knowledge-overview-copy">
                    <span className="knowledge-category-tag">{item.category}</span>
                    <h1>{item.title}</h1>
                    <p>{item.summary}</p>
                    <p className="knowledge-tagline">{item.tagline}</p>
                  </div>
                  <div className="knowledge-clues">
                    <section className="knowledge-clue knowledge-clue-warning">
                      <ShieldAlert aria-hidden="true" size={20} />
                      <div><h2>先辨認危險線索</h2><p>{item.cue}</p></div>
                    </section>
                    <section className="knowledge-clue knowledge-clue-safe">
                      <ShieldCheck aria-hidden="true" size={20} />
                      <div><h2>安全查證方式</h2><p>{item.verify}</p></div>
                    </section>
                  </div>
                </div>
                <p className="knowledge-reviewed">資料查核日期：{item.reviewed}　·　海報內容以文字說明為準</p>
              </>
            ) : null}

            {panelIndex === 1 ? (
              <div className="knowledge-flow-panel">
                <div className="knowledge-slide-title"><span>02 / 話術拆解</span><h1>{item.title}：詐騙流程怎麼走？</h1><p>留意每一步如何逐漸取得信任，再把你推向不安全的行動。</p></div>
                <ol className="knowledge-flow-steps">
                  {item.flow.map((step, index) => (
                    <li key={`${item.id}-${step.stage}`}>
                      <span className="knowledge-flow-number">{index + 1}</span>
                      <span className="knowledge-flow-stage">{step.stage}</span>
                      <h2>{step.title}</h2>
                      <p>{step.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {panelIndex === 2 ? (
              <div className="knowledge-impact-panel">
                <div className="knowledge-slide-title"><span>03 / 停下來想一想</span><h1>可能發生什麼？先問自己三個問題。</h1><p>碰到催促或要求保密時，先暫停，再找可信任的人一起查證。</p></div>
                <div className="knowledge-impact-grid">
                  <section className="knowledge-impact-box">
                    <h2><ShieldAlert aria-hidden="true" size={19} />可能造成的影響</h2>
                    <ul>{item.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
                  </section>
                  <section className="knowledge-impact-box knowledge-questions-box">
                    <h2><CheckCircle2 aria-hidden="true" size={19} />查證前問自己</h2>
                    <ol>{item.verificationQuestions.map((question, index) => <li key={question}><span>{index + 1}</span>{question}</li>)}</ol>
                  </section>
                </div>
              </div>
            ) : null}

            {panelIndex === 3 ? (
              <div className="knowledge-action-panel">
                <div className="knowledge-slide-title"><span>04 / 保護自己</span><h1>現在可以採取的行動</h1><p>已經提供資料或匯款？先聯絡銀行並撥打 165 諮詢。</p></div>
                <ol className="knowledge-action-steps">
                  {item.actions.map((action, index) => <li key={action}><span>{index + 1}</span><p>{action}</p></li>)}
                </ol>
                <section className="knowledge-sources" aria-label="官方資料來源">
                  <span>官方資料來源</span>
                  {item.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" aria-label={`${source.name}，${source.publisher}`} title={`${source.name}｜${source.publisher}`}><span>{source.name}<small>{source.publisher}</small></span><ExternalLink aria-hidden="true" size={13} /></a>)}
                </section>
                <p className="knowledge-disclaimer">此為防詐教育資訊；若有即時財損，請聯絡金融機構並撥打 165 或 110。</p>
              </div>
            ) : null}
          </article>
        ) : (
          <div className="knowledge-empty"><ShieldAlert aria-hidden="true" size={38} /><h1>找不到相符主題</h1><p>試試別的關鍵字，或切回「全部」分類。</p><button type="button" className="knowledge-secondary-button" onClick={() => { changeQuery(""); changeGroup("全部"); }}>顯示全部主題</button></div>
        )}
      </section>

      {rumorsOpen ? (
        <div className="knowledge-rumor-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setRumorsOpen(false); }}>
          <section className="knowledge-rumor-dialog" role="dialog" aria-modal="true" aria-labelledby="knowledge-rumor-title">
            <header>
              <div><p className="knowledge-page-kicker">165 官方開放資料串接</p><h2 id="knowledge-rumor-title">最新可取得的詐騙闢謠</h2></div>
              <button ref={dialogCloseRef} type="button" className="knowledge-close-button" onClick={() => setRumorsOpen(false)} aria-label="關閉官方闢謠"><X aria-hidden="true" /></button>
            </header>
            {currentRumor ? (
              <article className="knowledge-rumor-card" aria-live="polite">
                <div className="knowledge-rumor-meta"><span>官方編號 {currentRumor.id}</span><time dateTime={currentRumor.publishedAt}>{currentRumor.publishedAt.slice(0, 10).replaceAll("-", "/")}</time></div>
                <h3>{currentRumor.title}</h3>
                <p>{currentRumor.excerpt}</p>
              </article>
            ) : (
              <div className="knowledge-rumor-unavailable"><ShieldCheck aria-hidden="true" /><p>官方資料暫時無法讀取，人工查核的知識卡仍可正常使用。</p></div>
            )}
            <footer>
              {currentRumor ? <div className="knowledge-rumor-pagination"><button type="button" className="knowledge-secondary-button" onClick={() => setRumorIndex((value) => (value - 1 + officialRumors.length) % officialRumors.length)} disabled={officialRumors.length < 2}>上一則</button><span aria-live="polite">{rumorIndex + 1} / {officialRumors.length}</span><button type="button" className="knowledge-secondary-button" onClick={() => setRumorIndex((value) => (value + 1) % officialRumors.length)} disabled={officialRumors.length < 2}>下一則</button></div> : <span>每日檢查更新</span>}
              <a href={officialRumorDatasetUrl} target="_blank" rel="noreferrer">查看政府資料集 <ExternalLink aria-hidden="true" size={14} /></a>
            </footer>
          </section>
        </div>
      ) : null}
      </div>
    </PresentationFrame>
  );
}
