"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Eraser, ExternalLink, HelpCircle, LoaderCircle, LockKeyhole, Search, ShieldAlert, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { PresentationFrame } from "@/components/presentation-frame";
import type { AnalysisResult, SignalType } from "@/lib/analysis";
import { analysisSampleCategories, analysisSamples } from "@/lib/analysis-samples";
import { maskSensitiveData } from "@/lib/mask-sensitive";

type ApiResponse = {
  result: AnalysisResult;
  mode: "live" | "mock";
  maskedMessage: string;
  notice: string;
  usage?: { protected: boolean; allowed: boolean; remaining: number; resetAt: string; reason?: string };
};

const loadingSteps = ["先遮罩可能的敏感資料", "辨認語氣、金錢與連結線索", "整理查證問題與安全行動"];
const resultPages = ["初步結果", "風險線索", "查證問題", "建議行動", "學習與求助"];
const signalLabels: Record<SignalType, string> = {
  urgency: "催促與限時", money: "金錢要求", personal_data: "個資要求", link: "陌生連結",
  authority: "冒用權威", secrecy: "要求保密", reward: "不合理報酬", relationship: "關係與情感",
};

export function Analyzer() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");
  const [offlineSuggested, setOfflineSuggested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState("全部分類");
  const [search, setSearch] = useState("");
  const [selectedSample, setSelectedSample] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const filteredSamples = useMemo(() => analysisSamples.filter((sample) => {
    const categoryMatches = category === "全部分類" || sample.category === category;
    const term = search.trim().toLocaleLowerCase();
    const searchMatches = !term || `${sample.label} ${sample.message} ${sample.keywords} ${sample.category}`.toLocaleLowerCase().includes(term);
    return categoryMatches && searchMatches;
  }), [category, search]);
  const maskedPreview = useMemo(() => maskSensitiveData(message).masked, [message]);
  const sensitiveFound = useMemo(() => maskSensitiveData(message).sensitiveDataDetected, [message]);

  useEffect(() => {
    if (!loading) return;
    const timer = window.setInterval(() => setLoadingStep((step) => (step + 1) % loadingSteps.length), 850);
    return () => window.clearInterval(timer);
  }, [loading]);

  function requestConfirmation(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError("");
    setOfflineSuggested(false);
    if (message.trim().length < 8) {
      setError("請至少輸入 8 個字，或先選一個示範案例。");
      inputRef.current?.focus();
      return;
    }
    setConfirmOpen(true);
  }

  async function confirmAnalysis() {
    setConfirmOpen(false);
    setResponse(null);
    setLoading(true);
    setLoadingStep(0);
    try {
      const request = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: maskedPreview, sensitiveDataDetected: sensitiveFound }),
      });
      if (request.status === 403 || request.status === 429) throw new Error("操作太頻繁，請稍候一分鐘再試。你仍可使用示範案例練習。");
      const body = (await request.json()) as ApiResponse | { error?: string };
      if (!request.ok || !("result" in body)) {
        const apiError = "error" in body && typeof body.error === "string" ? body.error : undefined;
        throw new Error(apiError ?? "分析暫時無法完成，請稍後再試。");
      }
      setResponse(body);
      setPage(0);
      const current = Number(window.localStorage.getItem("guardai-analysis-count") ?? "0");
      window.localStorage.setItem("guardai-analysis-count", String(current + 1));
      window.setTimeout(() => resultRef.current?.focus(), 50);
    } catch (reason) {
      const networkFailure = !window.navigator.onLine || reason instanceof TypeError;
      setOfflineSuggested(networkFailure);
      setError(networkFailure
        ? "目前無法連上分析服務。你的原始訊息沒有被保存；可改用安全 Demo 完成查證練習。"
        : reason instanceof Error ? reason.message : "分析暫時無法完成，請稍後再試。");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResponse(null); setMessage(""); setError(""); setOfflineSuggested(false); setConfirmOpen(false); setPage(0); setSelectedSample("");
    inputRef.current?.focus();
  }

  function chooseSample(id: string) {
    setSelectedSample(id);
    const sample = analysisSamples.find((item) => item.id === id);
    if (sample) { setMessage(sample.message); setError(""); }
  }

  const pageCount = response ? resultPages.length : 1;
  const pageLabel = response ? resultPages[page] : "輸入訊息後開始查證";

  return (
    <PresentationFrame
      title="AI 判讀實驗室"
      subtitle={response ? "逐步看線索、提問題、採取安全行動" : "搜尋案例或貼上訊息，確認後開始 AI 查證"}
      pageNumber={response ? page + 1 : 1}
      pageCount={pageCount}
      pageLabel={pageLabel}
      previousDisabled={!response || page === 0}
      nextDisabled={loading}
      nextLabel={response ? (page === resultPages.length - 1 ? "分析另一則" : "下一步") : "開始查證"}
      onPrevious={() => setPage((value) => Math.max(0, value - 1))}
      onNext={() => response ? (page === resultPages.length - 1 ? reset() : setPage((value) => Math.min(resultPages.length - 1, value + 1))) : requestConfirmation()}
    >
      {response ? (
        <div ref={resultRef} tabIndex={-1} className="analyzer-slide" aria-labelledby="analysis-step-title">
          <div className="analyzer-slide-heading"><p>查證練習　/　{resultPages[page]}</p><h1 id="analysis-step-title">{page === 0 ? "先看整體風險，再逐步完成查證" : resultPages[page]}</h1></div>
          {page === 0 ? <section className="analyzer-result-overview">
            <div className={`analyzer-risk analyzer-risk-${response.result.riskLevel}`}><span>初步風險</span><strong>{{unknown:"證據不足",low:"較低",medium:"需要留意",high:"偏高",critical:"緊急風險"}[response.result.riskLevel]}</strong><small>信心程度：{{low:"低",medium:"中",high:"高"}[response.result.confidence]}</small></div>
            <div className="analyzer-result-summary"><span className={`analyzer-mode ${response.mode}`}>{response.mode === "live" ? "即時 AI" : "離線 Demo"}</span><p>{response.result.summary}</p><small>{response.notice}</small></div>
            {response.result.sensitiveDataDetected ? <div className="analyzer-masked-note"><ShieldAlert aria-hidden="true" />輸入中偵測到可能的敏感資料，已在送出前遮罩。</div> : null}
          </section> : null}
          {page === 1 ? <section className="analyzer-result-panel"><div className="analyzer-result-title"><span>看｜找到證據</span><strong>{response.result.signals.length} 項線索</strong></div>{response.result.signals.length ? <div className="analyzer-signal-grid">{response.result.signals.map((signal) => <article key={`${signal.type}-${signal.excerpt}`}><span>{signalLabels[signal.type]}</span><blockquote>「{signal.excerpt}」</blockquote><p>{signal.explanation}</p></article>)}</div> : <p className="analyzer-empty-note">目前證據不足以指出具體警示。這不代表安全，請從獨立官方管道確認來源。</p>}{response.result.manipulationTactics.length ? <div className="analyzer-tactics">{response.result.manipulationTactics.map((tactic) => <span key={tactic}>{tactic}</span>)}</div> : null}</section> : null}
          {page === 2 ? <section className="analyzer-result-panel"><div className="analyzer-result-title"><span>問｜把懷疑變成可驗證的問題</span><strong>三個查證問題</strong></div><ol className="analyzer-numbered-list">{response.result.verificationQuestions.map((question, index) => <li key={question}><span>{index + 1}</span><p>{question}</p></li>)}</ol></section> : null}
          {page === 3 ? <section className="analyzer-result-panel"><div className="analyzer-result-title"><span>查｜照安全順序採取行動</span><strong>建議行動</strong></div><ol className="analyzer-numbered-list analyzer-actions-list">{response.result.recommendedActions.map((action, index) => <li key={action}><span>{index + 1}</span><p>{action}</p></li>)}</ol></section> : null}
          {page === 4 ? <section className="analyzer-result-panel analyzer-learning-panel"><div><span>我學到什麼</span><h2>{response.result.learningPoint}</h2><p className="analyzer-result-title">求助摘要</p><blockquote>{response.result.helpSummary}</blockquote><p className="analyzer-disclaimer">{response.result.disclaimer}</p></div><aside><HelpCircle aria-hidden="true" /><h2>找真人一起確認</h2><p>涉及金錢或帳號風險時，先停止操作並保留紀錄。</p><a href="tel:165">撥打 165</a><button type="button" onClick={reset}>分析另一則訊息 <ArrowRight size={16} /></button></aside></section> : null}
        </div>
      ) : (
        <div className="analyzer-input-slide">
          <div className="analyzer-privacy-banner"><LockKeyhole aria-hidden="true"/><div><strong>先保護個資，再送出查證</strong><p>不要輸入姓名、身分證、帳號、密碼、信用卡或 OTP。送出前會先遮罩常見敏感資料；GuardAI 不會開啟訊息中的網址。</p></div></div>
          <form className="analyzer-input-form" onSubmit={requestConfirmation}>
            <div className="analyzer-message-heading"><label htmlFor="message">貼上訊息，或直接描述你遇到的情況</label><span>{message.length} / 5,000</span></div>
            <textarea ref={inputRef} id="message" value={message} maxLength={5000} rows={3} onChange={(event) => setMessage(event.target.value)} placeholder="例如：有人自稱銀行客服，說我的帳戶異常，要我提供驗證碼……" disabled={loading}/>
            <div className="analyzer-message-tools"><span>原文只用於本次查證；送出前先遮罩敏感格式。</span>{message ? <button type="button" onClick={() => { setMessage(""); setSelectedSample(""); }}><Eraser size={16}/>清除</button> : null}</div>
            <div className="analyzer-sample-picker">
              <div className="analyzer-picker-heading"><div><strong>從案例庫挑選合成情境</strong><small>目前 {analysisSamples.length} 則｜含原有 6 種與新增案例，文案為教學模擬</small></div><a href="https://www.cib.npa.gov.tw/ch/app/data/list?id=1909&module=wg116" target="_blank" rel="noreferrer">刑事局案例資料 <ExternalLink size={13}/></a></div>
              <div className="analyzer-picker-controls">
                <label><span>分類</span><select value={category} onChange={(event) => { setCategory(event.target.value); setSelectedSample(""); }}>{analysisSampleCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="analyzer-search-label"><span>搜尋案例</span><div><Search size={16}/><input value={search} onChange={(event) => { setSearch(event.target.value); setSelectedSample(""); }} placeholder="輸入關鍵字"/></div></label>
                <label className="analyzer-case-label"><span>案例（{filteredSamples.length}）</span><select value={selectedSample} onChange={(event) => chooseSample(event.target.value)}><option value="">選擇一則合成案例</option>{filteredSamples.map((sample) => <option key={sample.id} value={sample.id}>[{sample.category}] {sample.label}</option>)}</select></label>
              </div>
              {selectedSample ? <p className="analyzer-source-note">案例主題參考：<a href={analysisSamples.find((sample) => sample.id === selectedSample)?.source.url} target="_blank" rel="noreferrer">{analysisSamples.find((sample) => sample.id === selectedSample)?.source.label} <ExternalLink size={12}/></a></p> : <p className="analyzer-source-note">可自由輸入訊息；不需要先選案例。</p>}
            </div>
            {error ? <div className="analyzer-error" role="alert"><AlertCircle size={18}/><span>{error}{offlineSuggested ? <>　<a href="/showcase">改用離線競賽展示</a></> : null}</span></div> : null}
          </form>
          {loading ? <div className="analyzer-loading" role="status"><LoaderCircle className="animate-spin"/><span>{loadingSteps[loadingStep]}…</span></div> : null}
        </div>
      )}

      {confirmOpen ? <div className="analyzer-confirm-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmOpen(false); }}><section className="analyzer-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="analyzer-confirm-title"><div className="analyzer-confirm-icon"><CheckCircle2/></div><div><p className="analyzer-confirm-kicker">最後確認</p><h2 id="analyzer-confirm-title">確認送出遮罩後的文字？</h2><p>系統將以以下內容進行風險分析。原始訊息不會儲存。</p></div><pre>{maskedPreview}</pre>{sensitiveFound ? <p className="analyzer-mask-warning"><ShieldAlert size={16}/>已遮罩可能的電話、Email、驗證碼、帳號或卡號。</p> : null}<div className="analyzer-confirm-actions"><button type="button" onClick={() => setConfirmOpen(false)}>返回修改</button><button type="button" onClick={() => void confirmAnalysis()}><Sparkles size={17}/>確認並送出</button></div></section></div> : null}
    </PresentationFrame>
  );
}
