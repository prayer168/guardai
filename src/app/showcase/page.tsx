import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";
import { ShowcaseExperience } from "@/components/showcase-experience";

export const metadata: Metadata = {
  title: "競賽展示",
  description: "在 3–5 分鐘內體驗 GuardAI 的查證教學流程、三種應用情境、AI 安全架構與評測證據。",
};

export default function ShowcasePage() {
  return (
    <>
      <PageIntro eyebrow="2026 TAIA 入圍作品" title="GuardAI 競賽展示" description="從一則可疑訊息出發，看見風險證據、查證問題、安全行動、求助、學習成果與可被檢查的 AI 安全架構。" />
      <div className="site-container py-10 md:py-14"><ShowcaseExperience /></div>
    </>
  );
}
