"use client";

import { AlertCircle, ArrowRight, Eraser, LoaderCircle, LockKeyhole, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

import { AnalysisResultView } from "@/components/analysis-result";
import type { AnalysisResult } from "@/lib/analysis";
import { sampleMessages } from "@/lib/content";

type ApiResponse = {
  result: AnalysisResult;
  mode: "live" | "mock";
  maskedMessage: string;
  notice: string;
  usage?: {
    protected: boolean;
    allowed: boolean;
    remaining: number;
    resetAt: string;
    reason?: string;
  };
};

const loadingSteps = ["先遮罩可能的敏感資料", "辨認語氣、金錢與連結線索", "整理查證問題與安全行動"];

export function Analyzer() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setInterval(() => {
      setLoadingStep((step) => (step + 1) % loadingSteps.length);
    }, 850);
    return () => window.clearInterval(timer);
  }, [loading]);

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResponse(null);

    if (message.trim().length < 8) {
      setError("請至少輸入 8 個字，或先選一個示範案例。");
      return;
    }

    setLoading(true);
    setLoadingStep(0);

    try {
      const request = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (request.status === 403 || request.status === 429) {
        throw new Error("操作太頻繁，請稍候一分鐘再試。你仍可先使用離線示範案例練習。");
      }
      const body = (await request.json()) as ApiResponse | { error?: string };
      if (!request.ok || !("result" in body)) {
        const apiError = "error" in body && typeof body.error === "string" ? body.error : undefined;
        throw new Error(apiError ?? "分析暫時無法完成，請稍後再試。");
      }

      setResponse(body);
      const current = Number(window.localStorage.getItem("guardai-analysis-count") ?? "0");
      window.localStorage.setItem("guardai-analysis-count", String(current + 1));
      window.setTimeout(() => resultRef.current?.focus(), 50);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "分析暫時無法完成，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResponse(null);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-8">
      {!response ? (
        <section className="section-card overflow-hidden p-0">
          <div className="notice notice-info rounded-none border-x-0 border-t-0">
            <LockKeyhole aria-hidden="true" />
            <div>
              <strong>貼上前，先移除不必要的個資</strong>
              <p>請勿輸入姓名、身分證、帳號、密碼、信用卡或驗證碼。系統仍會再次遮罩可能的敏感內容。</p>
            </div>
          </div>

          <form className="p-5 md:p-8" onSubmit={analyze}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="message" className="text-xl font-black text-navy">貼上收到的訊息</label>
              <span className="text-sm font-semibold text-ink-muted">{message.length} / 5,000</span>
            </div>
            <textarea
              id="message"
              value={message}
              maxLength={5000}
              rows={8}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="例如：您的帳戶即將停權，請立即點擊連結重新驗證……"
              className="input-area mt-4"
              disabled={loading}
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm leading-6 text-ink-muted">GuardAI 不會自動開啟訊息裡的任何網址。</p>
              {message ? (
                <button type="button" className="text-button" onClick={() => setMessage("")}>
                  <Eraser aria-hidden="true" size={17} /> 清除內容
                </button>
              ) : null}
            </div>

            <fieldset className="mt-7">
              <legend className="text-sm font-black tracking-wider text-navy">或選一個安全的示範案例</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {sampleMessages.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    className="sample-button"
                    onClick={() => setMessage(sample.message)}
                    disabled={loading}
                  >
                    <Sparkles aria-hidden="true" size={17} />
                    {sample.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {error ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-coral/10 p-4 font-semibold text-coral-dark" role="alert">
                <AlertCircle aria-hidden="true" /> {error}
              </div>
            ) : null}

            <button type="submit" className="button button-primary mt-7 w-full" disabled={loading}>
              {loading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Sparkles aria-hidden="true" />}
              {loading ? loadingSteps[loadingStep] : "開始 AI 查證練習"}
              {!loading ? <ArrowRight aria-hidden="true" /> : null}
            </button>
          </form>
        </section>
      ) : null}

      {response ? (
        <div ref={resultRef} tabIndex={-1} className="focus:outline-none">
          <AnalysisResultView {...response} onReset={reset} />
        </div>
      ) : null}
    </div>
  );
}
