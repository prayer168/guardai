import type { Metadata } from "next";

import { KnowledgeBrowser } from "@/components/knowledge-browser";
import { getOfficialRumors } from "@/lib/official-rumors-source";

export const metadata: Metadata = { title: "防詐知識庫" };
export const revalidate = 86400;

export default async function KnowledgePage() {
  const officialRumors = await getOfficialRumors().catch(() => []);

  return (
    <KnowledgeBrowser officialRumors={officialRumors} />
  );
}
