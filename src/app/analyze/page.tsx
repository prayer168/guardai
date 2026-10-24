import type { Metadata } from "next";

import { Analyzer } from "@/components/analyzer";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "AI 判讀實驗室" };

export default function AnalyzePage() {
  return (
    <div className="site-page analyze-page">
      <PageIntro eyebrow="60 秒查證練習" title="AI 判讀實驗室" description="貼上可疑文字，GuardAI 會先遮罩敏感資料，再帶你完成找線索、問問題、查來源與求助。" />
      <div className="site-container py-4 md:py-6"><Analyzer /></div>
    </div>
  );
}
