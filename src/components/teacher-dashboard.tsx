"use client";

import Image from "next/image";
import { Check, Clipboard, Download, PlayCircle, Users } from "lucide-react";
import { useState } from "react";

type Pack = "student" | "family" | "senior";

const packData = {
  student: { label: "學生情境包", completion: 82, pre: 58, post: 84, missed: "陌生連結與帳號驗證", students: 28 },
  family: { label: "親子情境包", completion: 74, pre: 61, post: 86, missed: "假冒親友與緊急借款", students: 19 },
  senior: { label: "長者情境包", completion: 69, pre: 52, post: 78, missed: "假客服與 ATM 操作", students: 16 },
} satisfies Record<Pack, { label: string; completion: number; pre: number; post: number; missed: string; students: number }>;

export function TeacherDashboard() {
  const [pack, setPack] = useState<Pack>("student");
  const [status, setStatus] = useState("");
  const data = packData[pack];

  async function copyCode() {
    await navigator.clipboard.writeText("GUARD-5Q7A");
    setStatus("班級代碼已複製");
  }

  function assignPractice() {
    setStatus(`已指派「${data.label}」Demo 練習`);
  }

  function downloadCsv() {
    const csv = `指標,數值\n情境包,${data.label}\n匿名人數,${data.students}\n完成率,${data.completion}%\n前測平均,${data.pre}\n後測平均,${data.post}\n最常錯概念,${data.missed}`;
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `GuardAI-${pack}-demo.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("匿名成果摘要已下載");
  }

  return (
    <div className="space-y-8">
      <section className="grid overflow-hidden rounded-3xl bg-navy text-ivory shadow-xl lg:grid-cols-[1fr_1.05fr]">
        <div className="relative min-h-72">
          <Image src="/images/guardai-classroom.png" alt="教師帶領學生一起辨認可疑訊息與查證" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
        </div>
        <div className="p-6 md:p-9">
          <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-gold"><Users aria-hidden="true" size={18} />課堂快速開始</div>
          <h2 className="mt-3 text-3xl font-black">班級代碼 GUARD-5Q7A</h2>
          <p className="mt-3 leading-7 text-ivory/75">學生不需建立帳號，以匿名代碼加入。此頁為競賽 Demo 模擬資料，不含真實學生資訊。</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" className="button button-light" onClick={copyCode}><Clipboard aria-hidden="true" size={18} />複製班級代碼</button>
            <button type="button" className="button button-gold" onClick={assignPractice}><PlayCircle aria-hidden="true" size={18} />指派練習</button>
          </div>
          <p className="mt-4 min-h-6 text-sm font-bold text-gold" aria-live="polite">{status}</p>
        </div>
      </section>

      <section className="section-card">
        <div className="section-title-row">
          <div><p className="eyebrow">Demo 模擬資料</p><h2 className="section-title">匿名班級學習概況</h2></div>
          <button type="button" className="button button-outline" onClick={downloadCsv}><Download aria-hidden="true" size={18} />匯出摘要</button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="切換情境包">
          {(Object.keys(packData) as Pack[]).map((key) => (
            <button key={key} type="button" className={`filter-chip ${pack === key ? "filter-chip-active" : ""}`} onClick={() => setPack(key)}>{packData[key].label}</button>
          ))}
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="data-tile"><span>匿名參與</span><strong>{data.students} 人</strong><small>不顯示姓名與排名</small></article>
          <article className="data-tile"><span>完成率</span><strong>{data.completion}%</strong><small>已完成前測、練習與後測</small></article>
          <article className="data-tile"><span>前測平均</span><strong>{data.pre} 分</strong><small>練習前的基準</small></article>
          <article className="data-tile"><span>後測平均</span><strong className="text-sage-dark">{data.post} 分</strong><small>平均提升 {data.post - data.pre} 分</small></article>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-2xl bg-ivory-deep/55 p-5">
            <h3 className="font-black text-navy">最常答錯概念</h3>
            <p className="mt-2 text-xl font-bold text-coral-dark">{data.missed}</p>
            <p className="mt-2 leading-7 text-ink-muted">教師可依錯誤概念重新指派對應情境，不需要查看個別學生姓名。</p>
          </div>
          <div className="space-y-4 rounded-2xl border border-navy/10 p-5">
            {[{ label: "辨認可疑線索", value: data.post }, { label: "選擇安全行動", value: data.post - 4 }, { label: "願意向他人求助", value: data.post + 3 }].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-sm font-bold"><span>{item.label}</span><span>{item.value}%</span></div>
                <div className="h-3 overflow-hidden rounded-full bg-navy/10"><div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(100, item.value)}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="notice notice-info">
        <Check aria-hidden="true" />
        <div><strong>教師看到的是學習趨勢，不是學生標籤</strong><p>正式版將採最少資料原則；本 MVP 只用模擬資料展示課堂流程。</p></div>
      </section>
    </div>
  );
}
