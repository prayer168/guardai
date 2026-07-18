import "server-only";

import { parseOfficialRumorCsv } from "@/lib/official-rumors";

export const officialRumorDatasetUrl = "https://data.gov.tw/dataset/38262";
export const officialRumorCsvUrl = "https://opdadm.moi.gov.tw/api/v1/no-auth/resource/api/dataset/4F4DF9A5-DF4C-4EE8-A50D-869347D38D9E/resource/93E0A77F-47FD-4873-A024-61D6DEFD4FBD/download";

export async function getOfficialRumors(limit = 6) {
  const response = await fetch(officialRumorCsvUrl, {
    headers: { Accept: "text/csv" },
    next: { revalidate: 24 * 60 * 60 },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`OFFICIAL_RUMOR_HTTP_${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("text/csv")) {
    throw new Error("OFFICIAL_RUMOR_CONTENT_TYPE_CHANGED");
  }
  return parseOfficialRumorCsv(await response.text(), limit);
}
