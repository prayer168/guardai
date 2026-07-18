import type { Metadata } from "next";

import { KnowledgeBrowser } from "@/components/knowledge-browser";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "防詐知識庫" };

export default function KnowledgePage() {
  return (
    <>
      <PageIntro eyebrow="官方來源 × 流程拆解 × Images 2.0 海報" title="防詐知識庫" description="深入認識 14 種詐騙如何接觸、取信、施壓與收割；看懂可能結果，練習可執行的查證與止損行動。" />
      <div className="site-container py-10 md:py-14"><KnowledgeBrowser /></div>
    </>
  );
}
