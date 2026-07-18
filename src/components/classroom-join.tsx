"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, LogOut, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { classroomPackLabels, type ClassroomRecord } from "@/lib/classroom";

function normalizeCode(value: string) {
  const cleaned = value.trim().toUpperCase().replace(/\s+/g, "");
  return cleaned.startsWith("GUARD-") ? cleaned : `GUARD-${cleaned}`;
}

function getLearnerId() {
  const stored = window.localStorage.getItem("guardai-learner-id");
  if (stored) return stored;
  const created = window.crypto.randomUUID();
  window.localStorage.setItem("guardai-learner-id", created);
  return created;
}

async function responseError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
  return typeof body?.error === "string" ? body.error : fallback;
}

export function ClassroomJoin() {
  const [code, setCode] = useState("");
  const [classroom, setClassroom] = useState<ClassroomRecord | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const queryCode = new URLSearchParams(window.location.search).get("code");
      const savedCode = window.localStorage.getItem("guardai-class-code");
      setCode(queryCode ?? savedCode ?? "");
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  async function join() {
    const normalizedCode = normalizeCode(code);
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch(`/api/classes/${encodeURIComponent(normalizedCode)}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learnerId: getLearnerId() }),
      });
      if (!response.ok) throw new Error(await responseError(response, "無法加入班級。"));
      const body = (await response.json()) as { classroom: ClassroomRecord };
      window.localStorage.setItem("guardai-class-code", body.classroom.code);
      setClassroom(body.classroom);
      setCode(body.classroom.code);
      setStatus("已匿名加入班級。現在可前往學習護照完成前測。");
    } catch (reason) {
      setClassroom(null);
      setStatus(reason instanceof Error ? reason.message : "無法加入班級。");
    } finally {
      setBusy(false);
    }
  }

  function leaveClassroom() {
    window.localStorage.removeItem("guardai-class-code");
    setClassroom(null);
    setCode("");
    setStatus("已離開這台裝置上的班級連結；先前送出的匿名彙總會依期限自動刪除。");
  }

  return (
    <div className="space-y-8">
      <section className="section-card">
        <div className="flex items-start gap-4">
          <span className="icon-disc"><Users aria-hidden="true" /></span>
          <div>
            <p className="eyebrow">學生／家庭加入</p>
            <h2 className="section-title">輸入教師提供的班級代碼</h2>
            <p className="mt-2 leading-7 text-ink-muted">不需要姓名、Email、座號或密碼。系統只用這台裝置產生的隨機識別碼建立不可逆雜湊，避免重複計算。</p>
          </div>
        </div>

        <label className="mt-7 block font-black text-navy" htmlFor="class-code">班級代碼</label>
        <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            id="class-code"
            className="text-input uppercase"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="GUARD-ABC234"
            autoComplete="off"
            inputMode="text"
          />
          <button type="button" className="button button-primary" disabled={busy || code.trim().length < 6} onClick={join}>
            {busy ? "確認中…" : "匿名加入"}
          </button>
        </div>
        <p className="mt-4 min-h-6 font-bold text-navy" aria-live="polite">{status}</p>
      </section>

      {classroom ? (
        <section className="rounded-3xl bg-navy p-6 text-ivory md:p-8">
          <CheckCircle2 aria-hidden="true" className="text-gold" size={38} />
          <p className="eyebrow mt-5 text-gold">加入成功</p>
          <h2 className="mt-2 text-3xl font-black">{classroom.code}</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white/8 p-4"><dt className="text-sm text-ivory/65">指派內容</dt><dd className="mt-1 font-black">{classroomPackLabels[classroom.pack]}</dd></div>
            <div className="rounded-xl bg-white/8 p-4"><dt className="text-sm text-ivory/65">資料期限</dt><dd className="mt-1 font-black">{new Date(classroom.expiresAt).toLocaleDateString("zh-TW")} 自動刪除</dd></div>
          </dl>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/passport" className="button button-gold">前往學習護照 <ArrowRight aria-hidden="true" size={18} /></Link>
            <button type="button" className="button button-light" onClick={leaveClassroom}><LogOut aria-hidden="true" size={18} />離開班級</button>
          </div>
        </section>
      ) : null}

      <section className="notice notice-info">
        <ShieldCheck aria-hidden="true" />
        <div><strong>匿名不等於公開個人資料</strong><p>教師只能看到參與人數、完成率與平均趨勢，不能查看個別答案、裝置識別碼或公開排行榜。</p></div>
      </section>
    </div>
  );
}
