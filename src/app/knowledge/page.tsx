import type { Metadata } from "next";

import { KnowledgeBrowser } from "@/components/knowledge-browser";
import { OfficialRumorUpdates } from "@/components/official-rumor-updates";
import { PageIntro } from "@/components/page-intro";
import { getOfficialRumors } from "@/lib/official-rumors-source";

export const metadata: Metadata = { title: "防詐知識庫" };
export const revalidate = 86400;

export default async function KnowledgePage() {
  const officialRumors = await getOfficialRumors().catch(() => []);

  return (
    <>
      <PageIntro eyebrow="官方來源 × 流程拆解 × Images 2.0 海報" title="防詐知識庫" description="深入認識 14 種詐騙如何接觸、取信、施壓與收割；看懂可能結果，練習可執行的查證與止損行動。" />
      <div className="site-container space-y-8 py-10 md:py-14">
        <OfficialRumorUpdates items={officialRumors} />
        <KnowledgeBrowser />
      </div>
    </>
  );
}
