"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Clipboard, Download, ExternalLink, PlayCircle, RefreshCw, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  classroomPackLabels,
  type ClassroomAggregate,
  type ClassroomPack,
  type ClassroomRecord,
} from "@/lib/classroom";

type ClassroomResponse = {
  classroom: ClassroomRecord;
  aggregate: ClassroomAggregate;
};

const demoData: ClassroomAggregate = {
  participants: 28,
  completed: 23,
  completionRate: 82,
  preAverage: 58,
  postAverage: 84,
  improvementAverage: 26,
  challengeAverage: 83,
  analysisTotal: 41,
  mostMissedConcept: "更換入口",
};

async function responseError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
  return typeof body?.error === "string" ? body.error : fallback;
}

export function TeacherDashboard() {
  const [pack, setPack] = useState<ClassroomPack>("student");
  const [activeClassroom, setActiveClassroom] = useState<ClassroomResponse | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const refreshClassroom = useCallback(async (code: string, quiet = false) => {
    if (!quiet) setBusy(true);
    try {
      const response = await fetch(`/api/classes/${encodeURIComponent(code)}`, { cache: "no-store" });
      if (!response.ok) throw new Error(await responseError(response, "無法讀取班級資料。"));
      const data = (await response.json()) as ClassroomResponse;
      setActiveClassroom(data);
      setPack(data.classroom.pack);
      if (!quiet) setStatus("匿名班級成果已更新");
    } catch (reason) {
      window.localStorage.removeItem("guardai-teacher-class-code");
      setActiveClassroom(null);
      if (!quiet) setStatus(reason instanceof Error ? reason.message : "無法讀取班級資料。");
    } finally {
      if (!quiet) setBusy(false);
    }
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const code = window.localStorage.getItem("guardai-teacher-class-code");
      if (code) void refreshClassroom(code, true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [refreshClassroom]);

  async function createAssignment() {
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack }),
      });
      if (!response.ok) throw new Error(await responseError(response, "班級建立失敗。"));
      const body = (await response.json()) as { classroom: ClassroomRecord };
      window.localStorage.setItem("guardai-teacher-class-code", body.classroom.code);
      await refreshClassroom(body.classroom.code, true);
      setStatus(`已建立「${classroomPackLabels[pack]}」，30 天後自動刪除。`);
    } catch (reason) {
      setStatus(reason instanceof Error ? reason.message : "班級建立失敗。");
    } finally {
      setBusy(false);
    }
  }

  function joinUrl(code: string) {
    return `${window.location.origin}/join?code=${encodeURIComponent(code)}`;
  }

  async function copyCode() {
    if (!activeClassroom) return;
    await navigator.clipboard.writeText(activeClassroom.classroom.code);
    setStatus("班級代碼已複製");
  }

  async function copyJoinLink() {
    if (!activeClassroom) return;
    await navigator.clipboard.writeText(joinUrl(activeClassroom.classroom.code));
    setStatus("學生加入連結已複製");
  }

  function startNewClassroom() {
    window.localStorage.removeItem("guardai-teacher-class-code");
    setActiveClassroom(null);
    setStatus("可選擇情境包並建立新的匿名班級；原班級會依期限自動刪除。");
  }

  function downloadCsv() {
    const aggregate = activeClassroom?.aggregate ?? demoData;
    const label = activeClassroom
      ? classroomPackLabels[activeClassroom.classroom.pack]
      : `${classroomPackLabels[pack]}（Demo）`;
    const csv = [
      ["指標", "數值"],
      ["情境包", label],
      ["匿名加入", String(aggregate.participants)],
      ["完成人數", String(aggregate.completed)],
      ["完成率", `${aggregate.completionRate}%`],
      ["前測平均", aggregate.preAverage === null ? "尚無資料" : String(aggregate.preAverage)],
      ["後測平均", aggregate.postAverage === null ? "尚無資料" : String(aggregate.postAverage)],
      ["平均進步", aggregate.improvementAverage === null ? "尚無資料" : String(aggregate.improvementAverage)],
      ["闖關平均", aggregate.challengeAverage === null ? "尚無資料" : String(aggregate.challengeAverage)],
      ["最常忽略概念", aggregate.mostMissedConcept ?? "尚無資料"],
    ].map((row) => row.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `GuardAI-${activeClassroom?.classroom.code ?? `${pack}-demo`}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("匿名成果摘要已下載");
  }

  const aggregate = activeClassroom?.aggregate ?? demoData;
  const currentCode = activeClassroom?.classroom.code;
  const currentPack = activeClassroom?.classroom.pack ?? pack;

  return (
    <div className="space-y-8">
      <section className="grid overflow-hidden rounded-3xl bg-navy text-ivory shadow-xl lg:grid-cols-[1fr_1.05fr]">
        <div className="relative min-h-72">
          <Image src="/images/guardai-classroom.png" alt="教師帶領學生一起辨認可疑訊息與查證" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
        </div>
        <div className="p-6 md:p-9">
          <div className="flex items-center gap-2 text-sm font-bold tracking-widest text-gold"><Users aria-hidden="true" size={18} />匿名班級工作階段</div>
          {activeClassroom ? (
            <>
              <h2 className="mt-3 text-3xl font-black">班級代碼 {activeClassroom.classroom.code}</h2>
              <p className="mt-3 leading-7 text-ivory/75">
                {classroomPackLabels[activeClassroom.classroom.pack]}已啟用。學生不需帳號或姓名，資料將於 {new Date(activeClassroom.classroom.expiresAt).toLocaleDateString("zh-TW")} 自動刪除。
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button type="button" className="button button-light" onClick={copyCode}><Clipboard aria-hidden="true" size={18} />複製班級代碼</button>
                <button type="button" className="button button-gold" onClick={copyJoinLink}><PlayCircle aria-hidden="true" size={18} />複製加入連結</button>
                <Link className="button button-light" href={`/join?code=${activeClassroom.classroom.code}`} target="_blank"><ExternalLink aria-hidden="true" size={18} />開啟學生畫面</Link>
                <button type="button" className="button button-light" disabled={busy} onClick={() => void refreshClassroom(activeClassroom.classroom.code)}><RefreshCw aria-hidden="true" size={18} />更新成果</button>
              </div>
              <button type="button" className="mt-4 text-sm font-bold text-gold underline underline-offset-4" onClick={startNewClassroom}>建立另一個班級</button>
            </>
          ) : (
            <>
              <h2 className="mt-3 text-3xl font-black">建立可實際加入的匿名班級</h2>
              <p className="mt-3 leading-7 text-ivory/75">選擇情境包後產生班級代碼。只統計前後測、闖關與練習次數，不收集姓名、座號或訊息內容。</p>
              <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="選擇指派情境包">
                {(Object.keys(classroomPackLabels) as ClassroomPack[]).map((key) => (
                  <button key={key} type="button" className={`filter-chip ${pack === key ? "filter-chip-active" : ""}`} onClick={() => setPack(key)}>{classroomPackLabels[key]}</button>
                ))}
              </div>
              <button type="button" className="button button-gold mt-6" disabled={busy} onClick={createAssignment}><PlayCircle aria-hidden="true" size={18} />{busy ? "建立中…" : "建立並指派練習"}</button>
            </>
          )}
          <p className="mt-4 min-h-6 text-sm font-bold text-gold" aria-live="polite">{status}</p>
        </div>
      </section>

      <section className="section-card">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">{activeClassroom ? "匿名即時彙總" : "Demo 操作示意"}</p>
            <h2 className="section-title">{classroomPackLabels[currentPack]}學習概況</h2>
          </div>
          <button type="button" className="button button-outline" onClick={downloadCsv}><Download aria-hidden="true" size={18} />匯出摘要</button>
        </div>

        {!activeClassroom ? (
          <p className="mt-4 rounded-xl bg-amber/10 p-4 text-sm font-bold text-amber-dark">尚未建立班級，以下顯示競賽 Demo 模擬資料。建立班級後會切換為 Redis 匿名即時資料。</p>
        ) : null}

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="data-tile"><span>匿名加入</span><strong>{aggregate.participants} 人</strong><small>不顯示姓名、座號與排名</small></article>
          <article className="data-tile"><span>完成率</span><strong>{aggregate.completionRate}%</strong><small>{aggregate.completed} 人已提交完整成果</small></article>
          <article className="data-tile"><span>前測平均</span><strong>{aggregate.preAverage ?? "—"}{aggregate.preAverage === null ? "" : " 分"}</strong><small>練習前的匿名基準</small></article>
          <article className="data-tile"><span>後測平均</span><strong className="text-sage-dark">{aggregate.postAverage ?? "—"}{aggregate.postAverage === null ? "" : " 分"}</strong><small>{aggregate.improvementAverage === null ? "等待成果提交" : `平均進步 ${aggregate.improvementAverage >= 0 ? "+" : ""}${aggregate.improvementAverage} 分`}</small></article>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-2xl bg-ivory-deep/55 p-5">
            <h3 className="font-black text-navy">最常忽略概念</h3>
            <p className="mt-2 text-xl font-bold text-coral-dark">{aggregate.mostMissedConcept ?? "等待匿名成果"}</p>
            <p className="mt-2 leading-7 text-ink-muted">只呈現全班趨勢，教師無法查看個別學生答案或建立公開排名。</p>
          </div>
          <div className="space-y-4 rounded-2xl border border-navy/10 p-5">
            {[
              { label: "闖關平均", value: aggregate.challengeAverage ?? 0 },
              { label: "前測平均", value: aggregate.preAverage ?? 0 },
              { label: "後測平均", value: aggregate.postAverage ?? 0 },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-sm font-bold"><span>{item.label}</span><span>{item.value}%</span></div>
                <div className="h-3 overflow-hidden rounded-full bg-navy/10"><div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(100, item.value)}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        {currentCode ? <p className="mt-5 text-sm text-ink-muted">班級 {currentCode} 累計完成 {aggregate.analysisTotal} 次 AI／離線判讀練習。</p> : null}
      </section>

      <section className="notice notice-info">
        <Check aria-hidden="true" />
        <div><strong>教師看到的是匿名學習趨勢，不是學生標籤</strong><p>伺服器只保存班級代碼、情境包、不可逆裝置雜湊與分數彙總所需欄位，30 天後自動刪除。</p></div>
      </section>
    </div>
  );
}
