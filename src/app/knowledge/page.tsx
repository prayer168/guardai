import type { Metadata } from "next";

import { KnowledgeBrowser } from "@/components/knowledge-browser";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "防詐知識庫" };

export default function KnowledgePage() {
  return (
    <>
      <PageIntro eyebrow="官方來源 × 白話整理" title="防詐知識庫" description="依情境查看風險線索與獨立查證方法。內容標示來源與更新日期，不用聽信沒有出處的轉傳訊息。" />
      <div className="site-container py-10 md:py-14"><KnowledgeBrowser /></div>
    </>
  );
}
