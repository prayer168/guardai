export type OfficialRumorItem = {
  id: string;
  title: string;
  publishedAt: string;
  excerpt: string;
};

export function parseCsvRows(csv: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const next = csv[index + 1];

    if (character === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
  }

  return rows;
}

function parsePublishedAt(value: string) {
  const normalized = value.trim().replace(" ", "T").replace(/\//g, "-");
  const timestamp = Date.parse(`${normalized}+08:00`);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
}

function excerpt(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  return normalized.length > 220 ? `${normalized.slice(0, 218)}…` : normalized;
}

export function parseOfficialRumorCsv(csv: string, limit = 6): OfficialRumorItem[] {
  const rows = parseCsvRows(csv.replace(/^\uFEFF/, ""));
  const [header, ...records] = rows;
  if (!header || header.slice(0, 4).join("|") !== "編號|標題|發佈時間|發佈內容") {
    throw new Error("OFFICIAL_RUMOR_SCHEMA_CHANGED");
  }

  return records
    .map(([id, title, publishedAt, content]) => {
      const isoDate = parsePublishedAt(publishedAt ?? "");
      if (!id?.trim() || !title?.trim() || !isoDate || !content?.trim()) return null;
      return {
        id: id.trim(),
        title: title.trim(),
        publishedAt: isoDate,
        excerpt: excerpt(content),
      };
    })
    .filter((item): item is OfficialRumorItem => Boolean(item))
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
    .slice(0, Math.max(1, Math.min(20, limit)));
}
