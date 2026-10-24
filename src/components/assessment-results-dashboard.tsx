"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";

import type { PublicAssessmentAggregate } from "@/lib/assessment-results";

async function errorMessage(response: Response) {
  const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
  return typeof body?.error === "string" ? body.error : "無法讀取整體評量統計。";
}

function scoreLabel(score: number | null) {
  return score === null ? "樣本未達 5 份" : `${Math.round(score / 20 * 10) / 10} / 5 題`;
}

export function AssessmentResultsDashboard() {
  const [days, setDays] = useState<7 | 30>(30);
  const [data, setData] = useState<PublicAssessmentAggregate | null>(null);
  const [status, setStatus] = useState("載入匿名統計中…");
  const [busy, setBusy] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const frame = window.requestAnimationFrame(() => {
      setBusy(true);
      void fetch(`/api/assessment-results?days=${days}`, { cache: "no-store", signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error(await errorMessage(response));
          return response.json() as Promise<PublicAssessmentAggregate>;
        })
        .then((aggregate) => {
          setData(aggregate);
          setStatus("");
        })
        .catch((reason: unknown) => {
          if (reason instanceof DOMException && reason.name === "AbortError") return;
          setData(null);
          setStatus(reason instanceof Error ? reason.message : "無法讀取整體評量統計。");
        })
        .finally(() => setBusy(false));
    });
    return () => {
      window.cancelAnimationFrame(frame);
      controller.abort();
    };
  }, [days, refreshTick]);

  const pairedChange = data?.paired.averageChange ?? null;
  const positiveChange = pairedChange !== null && pairedChange >= 0;

  return (
    <section className="assessment-results-screen" aria-label="匿名前後測統計儀表板">
      <div className="assessment-results-topbar">
        <Link className="assessment-results-back" href="/passport"><ArrowLeft aria-hidden="true" size={18} />回學習護照</Link>
        <p><ShieldCheck aria-hidden="true" size={17} />只顯示匿名群體統計</p>
      </div>
      <main className="assessment-results-content">
        <header className="assessment-results-heading">
          <div><p className="eyebrow">自願參與 · 匿名彙總</p><h1>前後測整體成果</h1><p>不依班級或座號，顯示所有自願參與者的群體趨勢。</p></div>
          <div className="assessment-results-period" aria-label="選擇統計期間">
            <button type="button" aria-pressed={days === 7} disabled={busy} onClick={() => setDays(7)}>近 7 天</button>
            <button type="button" aria-pressed={days === 30} disabled={busy} onClick={() => setDays(30)}>近 30 天</button>
            <button type="button" aria-label="重新載入統計" disabled={busy} onClick={() => setRefreshTick((current) => current + 1)}><RefreshCw aria-hidden="true" size={16} /></button>
          </div>
        </header>

        {data ? (
          <>
            <div className="assessment-results-metrics">
              <article><Users aria-hidden="true" /><span>匿名裝置</span><strong>{data.participantCount ?? `未達 ${data.minimumSampleSize} 個`}</strong><small>至少 {data.minimumSampleSize} 個才顯示人數</small></article>
              <article><BarChart3 aria-hidden="true" /><span>前測完成</span><strong>{data.pre.submissions ?? `未達 ${data.minimumSampleSize} 份`}</strong><small>平均 {scoreLabel(data.pre.averageScore)}</small></article>
              <article><BarChart3 aria-hidden="true" /><span>後測完成</span><strong>{data.post.submissions ?? `未達 ${data.minimumSampleSize} 份`}</strong><small>平均 {scoreLabel(data.post.averageScore)}</small></article>
              <article><ShieldCheck aria-hidden="true" /><span>配對前後測</span><strong>{pairedChange === null ? `未達 ${data.minimumSampleSize} 人` : `${positiveChange ? "+" : ""}${(pairedChange / 20).toFixed(1)} 題`}</strong><small>{pairedChange === null ? "至少 5 位完成兩次測驗" : `平均變化 · ${data.paired.submissions} 位`}</small></article>
            </div>

            <div className="assessment-results-panels">
              <section className="assessment-results-panel" aria-labelledby="assessment-score-title">
                <div className="assessment-results-panel-heading"><div><p className="eyebrow">平均答對題數</p><h2 id="assessment-score-title">前測與後測比較</h2></div><span>滿分 5 題</span></div>
                <div className="assessment-score-bars">
                  {[
                    { label: "前測", score: data.pre.averageScore },
                    { label: "後測", score: data.post.averageScore },
                  ].map((item) => <div className="assessment-score-row" key={item.label}><span>{item.label}</span><div><i style={{ width: `${item.score ?? 0}%` }} /></div><strong>{scoreLabel(item.score)}</strong></div>)}
                </div>
                <p className="assessment-results-footnote">樣本數未達 {data.minimumSampleSize} 份時，平均分數會隱藏。</p>
              </section>

              <section className="assessment-results-panel" aria-labelledby="assessment-concepts-title">
                <div className="assessment-results-panel-heading"><div><p className="eyebrow">作答回饋彙整</p><h2 id="assessment-concepts-title">常見待加強概念</h2></div></div>
                <div className="assessment-concept-columns">
                  {[
                    { label: "前測", items: data.pre.missedConcepts },
                    { label: "後測", items: data.post.missedConcepts },
                  ].map((group) => <div className="assessment-concept-list" key={group.label}><h3>{group.label}</h3>{group.items.length ? group.items.slice(0, 3).map((item) => <div className="assessment-concept-row" key={item.concept}><span>{item.concept}</span><strong>{item.count}</strong></div>) : <p>樣本未達 {data.minimumSampleSize} 份，或尚無符合顯示門檻的概念</p>}</div>)}
                </div>
              </section>
            </div>
          </>
        ) : <div className="assessment-results-empty" role="status"><p>{status}</p><span>完成測驗後，可選擇加入匿名整體統計。統計資料保存最多 30 天。</span></div>}

        <footer className="assessment-results-note"><ShieldCheck aria-hidden="true" size={17} /><p>這是自願參與的匿名樣本，僅供教學觀察，不代表所有使用者；不同裝置可能重複計入。系統不保存姓名、班級、座號或逐題作答，資料保存最多 30 天。</p></footer>
      </main>
    </section>
  );
}
