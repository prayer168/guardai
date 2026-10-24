"use client";

import { ArrowLeft, ArrowRight, Expand, Home, Phone, Shrink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type PresentationFrameProps = {
  title: string;
  subtitle: string;
  pageNumber: number;
  pageCount: number;
  pageLabel: string;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  children: ReactNode;
  actions?: ReactNode;
  onPrevious: () => void;
  onNext: () => void;
};

export function PresentationFrame({ title, subtitle, pageNumber, pageCount, pageLabel, children, actions, onPrevious, onNext, previousDisabled = false, nextDisabled = false, nextLabel = "下一頁" }: PresentationFrameProps) {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);
  const [immersive, setImmersive] = useState(false);

  const leaveForHome = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Navigation still works if a mobile browser declines the fullscreen exit request.
      }
    }
    setImmersive(false);
    router.push("/");
  }, [router]);

  const togglePresentation = async () => {
    if (immersive) {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          setImmersive(false);
        }
      } else {
        setImmersive(false);
      }
      return;
    }

    setImmersive(true);
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      // Fixed-position presentation remains available when native fullscreen is unsupported.
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setImmersive(false);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && immersive && !document.fullscreenElement) {
        setImmersive(false);
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('[role="dialog"]')) return;
      if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName))) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        onPrevious();
      }
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        onNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [immersive, onNext, onPrevious]);

  return (
    <div ref={stageRef} className={`knowledge-stage presentation-stage${immersive ? " knowledge-stage-immersive" : ""}`} role="region" aria-label={title}>
      <header className="knowledge-topbar">
        <div className="knowledge-brand">
          <span className="presentation-brand-mark" aria-hidden="true"><Home size={17} /></span>
          <div><strong>{title}</strong><span>{subtitle}</span></div>
        </div>
        <div className="knowledge-top-actions">
          {actions}
          <button type="button" className="knowledge-icon-button" onClick={() => void togglePresentation()} aria-label={immersive ? "結束全螢幕展示" : "全螢幕展示"}>
            {immersive ? <Shrink aria-hidden="true" size={19} /> : <Expand aria-hidden="true" size={19} />}
            <span>{immersive ? "結束" : "全螢幕"}</span>
          </button>
          <Link href="/" className="knowledge-home-button" onClick={(event) => { event.preventDefault(); void leaveForHome(); }} aria-label="回到主畫面">
            <Home aria-hidden="true" size={18} /><span>首頁</span>
          </Link>
        </div>
      </header>

      <div className="presentation-progress-meta">
        <span aria-live="polite">第 {pageNumber} / {pageCount} 頁</span>
        <div className="knowledge-progress" role="progressbar" aria-label="簡報進度" aria-valuemin={0} aria-valuemax={pageCount || 1} aria-valuenow={pageNumber}>
          <span style={{ width: `${pageCount ? pageNumber / pageCount * 100 : 0}%` }} />
        </div>
      </div>

      <div className="presentation-body">{children}</div>

      <footer className="knowledge-navigation">
        <button type="button" className="knowledge-nav-button" onClick={onPrevious} disabled={previousDisabled} aria-label="上一頁"><ArrowLeft aria-hidden="true" /><span>上一頁</span></button>
        <p aria-live="polite">{pageLabel}</p>
        <a href="tel:165" className="knowledge-hotline-button" aria-label="撥打 165 反詐騙諮詢專線"><Phone aria-hidden="true" size={17} /><span>165 求助</span></a>
        <button type="button" className="knowledge-nav-button knowledge-nav-next" onClick={onNext} disabled={nextDisabled} aria-label={nextLabel}><span>{nextLabel}</span><ArrowRight aria-hidden="true" /></button>
      </footer>
    </div>
  );
}
