import type { Metadata } from "next";

import { ShowcaseExperience } from "@/components/showcase-experience";

export const metadata: Metadata = {
  title: "競賽展示",
  description: "在 3–5 分鐘內體驗 GuardAI 的查證教學流程、三種應用情境、AI 安全架構與評測證據。",
};

export default function ShowcasePage() {
  return (
    <div className="site-page showcase-page">
      <div className="site-container py-2"><ShowcaseExperience /></div>
    </div>
  );
}
