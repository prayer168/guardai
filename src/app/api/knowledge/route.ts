import { knowledgeItems } from "@/lib/content";

export const dynamic = "force-static";

export async function GET() {
  return Response.json({
    sourceMode: "curated",
    openDataDataset: "https://data.gov.tw/dataset/38262",
    lastReviewed: "2026-07-18",
    items: knowledgeItems,
  });
}
