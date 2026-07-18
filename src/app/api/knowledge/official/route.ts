import { getOfficialRumors, officialRumorDatasetUrl } from "@/lib/official-rumors-source";

export const revalidate = 86400;

export async function GET() {
  try {
    const items = await getOfficialRumors();
    return Response.json(
      { sourceMode: "official-open-data", dataset: officialRumorDatasetUrl, itemCount: items.length, items },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch {
    return Response.json(
      { sourceMode: "official-unavailable", dataset: officialRumorDatasetUrl, itemCount: 0, items: [] },
      { status: 503, headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
    );
  }
}
