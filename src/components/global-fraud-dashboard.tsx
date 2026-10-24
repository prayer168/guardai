"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ArrowDown, ArrowUp, ExternalLink, Globe2, Search, ShieldAlert } from "lucide-react";

type HistoryRow = {
  year: number;
  fraudCount: number | null;
  fraudRate: number | null;
  cyberCount: number | null;
  cyberRate: number | null;
};

type Country = {
  iso3: string;
  name: string;
  region: string;
  subregion: string;
  history: HistoryRow[];
  coverage2015to2024: number;
};

type Dataset = {
  metadata: {
    workbookUpdated: string;
    retrievedAt: string;
    firstYear: number;
    lastYear: number;
    countriesWithFraudSeries: number;
    latestYear: number;
    latestYearCountries: number;
    countriesWithFull2015To2024: number;
    countriesWithCyberSeries: number;
    clearanceRateAvailable: boolean;
  };
  countries: Country[];
};

type Props = { data: Dataset };
type Metric = "fraudCount" | "fraudRate" | "cyberCount" | "cyberRate";

const REGIONS = ["全部地區", "Africa", "Americas", "Asia", "Europe", "Oceania"] as const;
const REGION_LABEL: Record<string, string> = {
  Africa: "非洲", Americas: "美洲", Asia: "亞洲", Europe: "歐洲", Oceania: "大洋洲",
};
const METRICS: { key: Metric; label: string; chart: string; unit: string; hint: string }[] = [
  { key: "fraudCount", label: "詐騙案件數", chart: "詐騙案件數", unit: "件", hint: "警方或執法機關紀錄的詐騙案件" },
  { key: "fraudRate", label: "詐騙率 / 每十萬人", chart: "詐騙率", unit: "件 / 十萬人", hint: "按人口標準化，方便比較不同人口規模的國家" },
  { key: "cyberCount", label: "網路相關詐騙數", chart: "網路相關詐騙", unit: "件", hint: "UNODC 分類的網路相關詐騙子類別" },
  { key: "cyberRate", label: "網路詐騙率 / 每十萬人", chart: "網路詐騙率", unit: "件 / 十萬人", hint: "網路相關詐騙的每十萬人口率" },
];

const TYPOLOGIES = [
  { title: "投資詐騙", description: "以高獲利、保證回報或假投資平台誘使匯款。" },
  { title: "預付費詐騙", description: "先要求支付手續費、稅金或保證金，承諾後續給付。" },
  { title: "戀愛與情感詐騙", description: "建立信任關係後，編造急難、投資或見面費用。" },
  { title: "商務電子郵件詐騙", description: "冒充主管、供應商或合作夥伴，誘導轉帳或交出資料。" },
  { title: "冒名與身分詐騙", description: "假扮政府機關、銀行、平台客服或熟人取得信任。" },
];

const SOURCES = [
  { label: "UNODC 官方資料", href: "https://data.unodc.org/datareport/econ-corruption" },
  { label: "原始統計表（Excel）", href: "https://data.unodc.org/sites/dataportal.unodc.org/files/2026-07/data_cts_corruption_and_economic_crime.xlsx" },
  { label: "資料定義與統計方法", href: "https://data.unodc.org/sites/dataportal.unodc.org/files/2026-07/metadata_corruption_and_economic_crime.pdf" },
  { label: "ICCS 國際犯罪分類", href: "https://www.unodc.org/documents/data-and-analysis/statistics/crime/ICCS/ICCS_final-2015-March12_FINAL.pdf" },
  { label: "INTERPOL 詐騙趨勢", href: "https://www.interpol.int/en/News-and-Events/News/2024/INTERPOL-Financial-Fraud-assessment-A-global-threat-boosted-by-technology" },
];

function formatNumber(value: number | null, digits = 0) {
  if (value === null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("zh-TW", { maximumFractionDigits: digits }).format(value);
}

function getRow(country: Country, year: number) {
  return country.history.find((item) => item.year === year);
}

function observation(country: Country, year: number, metric: Metric) {
  return getRow(country, year)?.[metric] ?? null;
}

export function GlobalFraudDashboard({ data }: Props) {
  const years = useMemo(() => {
    const found = new Set<number>();
    data.countries.forEach((country) => country.history.forEach((row) => found.add(row.year)));
    return [...found].sort((a, b) => b - a);
  }, [data.countries]);
  const [year, setYear] = useState(data.metadata.latestYear);
  const [region, setRegion] = useState<string>("全部地區");
  const [metric, setMetric] = useState<Metric>("fraudCount");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [panel, setPanel] = useState<"overview" | "countries" | "types" | "method">("overview");
  const [countryView, setCountryView] = useState<"chart" | "table">("chart");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const pageSize = countryView === "table" ? 4 : 6;
  const selectedMetric = METRICS.find((item) => item.key === metric)!;

  const countries = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return data.countries
      .filter((country) => region === "全部地區" || country.region === region)
      .filter((country) => !term || `${country.name} ${country.iso3} ${country.subregion}`.toLocaleLowerCase().includes(term))
      .map((country) => ({ ...country, value: observation(country, year, metric) }))
      .filter((country) => country.value !== null)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  }, [data.countries, metric, query, region, year]);
  const pageCount = Math.max(1, Math.ceil(countries.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visibleCountries = countries.slice(safePage * pageSize, (safePage + 1) * pageSize);
  const topFraudCountries = useMemo(() => data.countries
    .map((country) => ({ name: country.name, value: observation(country, year, "fraudCount") }))
    .filter((country): country is { name: string; value: number } => country.value !== null)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6), [data.countries, year]);
  const chartRows = visibleCountries.map((country) => ({
    name: country.name,
    value: country.value,
    region: REGION_LABEL[country.region] ?? country.region,
  }));
  function resetPage() { setPage(0); }

  return (
    <div className="global-fraud-shell flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <header className="shrink-0 bg-navy text-ivory">
        <div className="site-container flex min-h-[76px] items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-gold sm:text-sm"><Globe2 size={16} aria-hidden="true" /> UNODC 官方統計・{data.metadata.firstYear}–{data.metadata.lastYear}</p>
            <h1 className="mt-1 truncate text-xl font-black sm:text-2xl">全球詐騙資料觀測站</h1>
          </div>
          <p className="hidden shrink-0 text-right text-sm font-semibold text-ivory/75 sm:block">最新年度 {data.metadata.latestYear}<br />{data.metadata.latestYearCountries} 國／地區有案件數</p>
        </div>
      </header>

      <main className="site-container flex min-h-0 w-full flex-1 flex-col py-3 sm:py-4">
        <nav aria-label="儀表板區段" role="tablist" className="flex shrink-0 gap-1 pb-1 sm:gap-2">
          <PanelTab id="overview" active={panel === "overview"} onClick={() => setPanel("overview")}>總覽</PanelTab>
          <PanelTab id="countries" active={panel === "countries"} onClick={() => setPanel("countries")}>國家數據</PanelTab>
          <PanelTab id="types" active={panel === "types"} onClick={() => setPanel("types")}>詐騙類型</PanelTab>
          <PanelTab id="method" active={panel === "method"} onClick={() => setPanel("method")}>資料與來源</PanelTab>
        </nav>

        <div id="dashboard-panel" role="tabpanel" aria-labelledby={`${panel}-tab`} className="global-fraud-panel mt-3 min-h-0 flex-1 overflow-y-auto rounded-2xl">
          {panel === "overview" && <section aria-labelledby="overview-title" className="grid h-full content-start gap-3 sm:gap-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              <Kpi label="國家／地區" value={`${data.metadata.countriesWithFraudSeries}`} detail="有案件數・2013–24" color="navy" />
              <Kpi label={`${data.metadata.latestYear} 年資料`} value={`${data.metadata.latestYearCountries}`} detail="國家／地區有紀錄" color="gold" />
              <Kpi label="完整十年" value={`${data.metadata.countriesWithFull2015To2024}`} detail="2015–24 每年有數據" color="sage" />
              <Kpi label="可比破案率" value="未提供" detail="來源無一致結案分母" color="coral" />
            </div>
            <div className="grid min-h-0 gap-3 xl:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.8fr)]">
              <section aria-labelledby="overview-chart-title" className="min-h-0 rounded-2xl border border-navy/10 bg-white p-3 sm:p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id="overview-chart-title" className="text-lg font-extrabold text-navy">{year} 年案件數最多的國家／地區</h2>
                  <button type="button" onClick={() => { setMetric("fraudCount"); setPanel("countries"); }} className="text-sm font-bold text-gold-dark underline underline-offset-4">查看完整國家圖表</button>
                </div>
                <div className="h-[min(25vh,240px)] min-h-[170px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topFraudCountries} layout="vertical" margin={{ top: 4, right: 18, bottom: 4, left: 8 }} barCategoryGap={8}>
                      <CartesianGrid stroke="#e7e1d5" horizontal={false} />
                      <XAxis type="number" tick={{ fill: "#58656c", fontSize: 11 }} tickFormatter={(value: number) => formatNumber(value)} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fill: "#10263d", fontSize: 11, fontWeight: 600 }} />
                      <Tooltip formatter={(value) => [`${formatNumber(Number(value))} 件`, "詐騙案件數"]} contentStyle={{ borderRadius: 10, borderColor: "#d9d2c5", fontSize: 13 }} />
                      <Bar dataKey="value" name="詐騙案件數" fill="#c4a15f" radius={[0, 6, 6, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-ink-muted">總覽先顯示前六名；「國家數據」頁可用分頁圖表查看所有有資料的國家／地區。</p>
              </section>
              <section className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-1" aria-label="資料提醒">
                <div className="rounded-2xl border border-amber/40 bg-[#fff6e7] p-3 sm:p-4">
                  <h2 className="flex items-center gap-2 font-extrabold text-navy"><AlertTriangle size={19} className="text-amber-dark" aria-hidden="true" />案件數不等於實際受害數</h2>
                  <p className="mt-2 text-sm leading-6 text-ink">這是警方或執法機關記錄的案件，會受報案意願、法律定義與統計方式影響。</p>
                </div>
                <div className="rounded-2xl border border-coral/30 bg-[#fff4f2] p-3 sm:p-4">
                  <h2 className="flex items-center gap-2 font-extrabold text-coral-dark"><ShieldAlert size={19} aria-hidden="true" />破案率沒有可比來源</h2>
                  <p className="mt-2 text-sm leading-6 text-ink">來源沒有統一的破案／結案件數分母，不以逮捕率或起訴率代替。</p>
                </div>
              </section>
            </div>
          </section>}

          {panel === "countries" && <section aria-labelledby="countries-title" className="grid content-start gap-2">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div><p className="eyebrow">各國趨勢比較</p><h2 id="countries-title" className="text-xl font-black text-navy">案件數與人口標準化率</h2></div>
              <p className="text-sm font-bold text-gold-dark">{countries.length} 國／地區有目前篩選資料</p>
            </div>
            <div className="global-fraud-filter-toggle flex items-center justify-between">
              <button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)} className="min-h-9 rounded-full border border-navy/20 bg-white px-3 text-sm font-bold text-navy">{filtersOpen ? "收合篩選" : "篩選國家與指標"}</button>
              <span className="text-xs font-semibold text-ink-muted">{year}・{selectedMetric.label}</span>
            </div>
            <div className={`global-fraud-filter-grid grid grid-cols-2 gap-2 rounded-2xl bg-[#f7f4ed] p-3 xl:grid-cols-4 ${filtersOpen ? "is-open" : ""}`}>
              <label className="grid gap-1 text-xs font-bold text-navy">年度<select value={year} onChange={(event) => { setYear(Number(event.target.value)); resetPage(); }} className="min-h-10 rounded-lg border border-navy/20 bg-white px-2 text-sm font-semibold">{years.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label className="grid gap-1 text-xs font-bold text-navy">地區<select value={region} onChange={(event) => { setRegion(event.target.value); resetPage(); }} className="min-h-10 rounded-lg border border-navy/20 bg-white px-2 text-sm font-semibold">{REGIONS.map((item) => <option key={item} value={item}>{item === "全部地區" ? item : REGION_LABEL[item]}</option>)}</select></label>
              <label className="grid gap-1 text-xs font-bold text-navy">統計指標<select value={metric} onChange={(event) => { setMetric(event.target.value as Metric); resetPage(); }} className="min-h-10 rounded-lg border border-navy/20 bg-white px-2 text-sm font-semibold">{METRICS.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
              <label className="grid gap-1 text-xs font-bold text-navy">搜尋國家／地區<span className="flex min-h-10 items-center gap-2 rounded-lg border border-navy/20 bg-white px-2"><Search size={16} aria-hidden="true" className="shrink-0 text-ink-muted" /><input value={query} onChange={(event) => { setQuery(event.target.value); resetPage(); }} placeholder="輸入名稱或代碼" className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none" /></span></label>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="hidden text-xs leading-5 text-ink-muted sm:block">{selectedMetric.hint}。缺值以「—」表示，不代表零；網路相關詐騙屬詐騙子類別。</p>
              <div className="flex rounded-full bg-[#f1ede4] p-1" aria-label="資料呈現方式">
                <button type="button" aria-pressed={countryView === "chart"} onClick={() => { setCountryView("chart"); setPage(0); }} className={`rounded-full px-3 py-1.5 text-sm font-bold ${countryView === "chart" ? "bg-navy text-white" : "text-navy"}`}>圖表</button>
                <button type="button" aria-pressed={countryView === "table"} onClick={() => { setCountryView("table"); setPage(0); }} className={`rounded-full px-3 py-1.5 text-sm font-bold ${countryView === "table" ? "bg-navy text-white" : "text-navy"}`}>資料表</button>
              </div>
            </div>
            <div className="min-h-0 rounded-2xl border border-navy/10 bg-white p-2 sm:p-4">
              {countryView === "chart" ? <>
                <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-lg font-extrabold text-navy">{year} 年・{selectedMetric.chart}</h3><span className="text-sm font-bold text-gold-dark">單位：{selectedMetric.unit}・第 {safePage + 1} / {pageCount} 頁</span></div>
                {chartRows.length ? <div className="h-[min(22vh,240px)] min-h-[130px] w-full">
                  <ResponsiveContainer width="100%" height="100%"><BarChart data={chartRows} layout="vertical" margin={{ top: 4, right: 20, bottom: 4, left: 8 }} barCategoryGap={7}>
                    <CartesianGrid stroke="#e7e1d5" horizontal={false} /><XAxis type="number" tick={{ fill: "#58656c", fontSize: 11 }} tickFormatter={(value: number) => formatNumber(value)} /><YAxis type="category" dataKey="name" width={105} tick={{ fill: "#10263d", fontSize: 11, fontWeight: 600 }} /><Tooltip formatter={(value) => [`${formatNumber(Number(value), metric.includes("Rate") ? 2 : 0)} ${selectedMetric.unit}`, selectedMetric.chart]} contentStyle={{ borderRadius: 10, borderColor: "#d9d2c5", fontSize: 13 }} /><Bar dataKey="value" name={selectedMetric.chart} fill="#c4a15f" radius={[0, 6, 6, 0]} maxBarSize={24} />
                  </BarChart></ResponsiveContainer>
                </div> : <EmptyState />}
              </> : <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-left text-sm"><thead className="bg-[#f7f4ed] text-navy"><tr><Th>國家／地區</Th><Th>地區</Th><Th>{year} 案件數</Th><Th>每十萬人</Th><Th>{year} 網路相關</Th><Th>2015–24 覆蓋</Th><Th>破案率</Th></tr></thead>
                  <tbody>{visibleCountries.map((country) => { const row = getRow(country, year); return <tr key={country.iso3} className="border-t border-navy/10 odd:bg-white even:bg-[#fbfaf7]"><td className="px-3 py-2 font-bold text-navy">{country.name}<span className="ml-2 text-xs font-semibold text-ink-muted">{country.iso3}</span></td><td className="px-3 py-2">{REGION_LABEL[country.region] ?? country.region}</td><td className="px-3 py-2 font-semibold">{formatNumber(row?.fraudCount ?? null)}</td><td className="px-3 py-2">{formatNumber(row?.fraudRate ?? null, 2)}</td><td className="px-3 py-2">{formatNumber(row?.cyberCount ?? null)}</td><td className="px-3 py-2">{country.coverage2015to2024} / 10 年</td><td className="px-3 py-2 font-bold text-coral-dark">未提供</td></tr>; })}{!visibleCountries.length && <tr><td colSpan={7} className="px-3 py-8 text-center text-ink-muted">此篩選條件目前沒有資料。</td></tr>}</tbody>
                </table>
              </div>}
              <Pagination page={safePage} pages={pageCount} onChange={setPage} />
            </div>
          </section>}

          {panel === "types" && <section aria-labelledby="types-title" className="grid content-start gap-3">
            <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="eyebrow">INTERPOL 描述的跨境詐騙型態</p><h2 id="types-title" className="text-xl font-black text-navy">常見詐騙手法</h2></div><p className="hidden max-w-2xl text-sm text-ink-muted sm:block">這些是國際組織描述的類型，非 UNODC 國別案件數的分項。</p></div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-5">{TYPOLOGIES.map((item, index) => <article key={item.title} className="rounded-2xl border border-navy/10 bg-white p-3 sm:p-4"><span className={`grid size-8 place-items-center rounded-lg ${index % 2 ? "bg-ivory text-gold-dark" : "bg-navy text-ivory"}`}><AlertTriangle size={16} aria-hidden="true" /></span><h3 className="mt-2 text-sm font-extrabold text-navy sm:text-base">{item.title}</h3><p className="mt-1 text-xs leading-5 text-ink-muted sm:text-sm sm:leading-6">{item.description}</p></article>)}</div>
            <p className="hidden rounded-xl border border-amber/30 bg-[#fff6e7] p-2 text-xs leading-5 text-ink sm:block sm:p-3 sm:text-sm sm:leading-6">UNODC 有詐騙與網路相關詐騙統計，沒有投資、戀愛等手法的逐國分項數字；類型卡片是認識手法用。</p>
          </section>}

          {panel === "method" && <section aria-labelledby="method-title" className="grid content-start gap-2 lg:grid-cols-2">
            <div className="rounded-2xl border border-navy/10 bg-white p-4 sm:p-5"><p className="eyebrow">資料方法</p><h2 id="method-title" className="mt-1 text-xl font-black text-navy">怎麼閱讀這些數字</h2><details className="mt-3 rounded-xl bg-[#f7f4ed] p-3"><summary className="cursor-pointer font-bold text-navy">查看統計口徑與限制</summary><ul className="mt-2 space-y-1 text-sm leading-6 text-ink-muted"><li><strong className="text-navy">統計單位：</strong>執法機關記錄的案件，不是受害者人數或損失金額。</li><li><strong className="text-navy">人口率：</strong>依人口標準化，方便比較不同人口規模地區。</li><li><strong className="text-navy">網路相關：</strong>詐騙子分類，不能與總數相加。</li><li><strong className="text-navy">缺值：</strong>「—」代表沒有觀測值，不代表零。</li><li><strong className="text-navy">破案率：</strong>來源沒有一致的結案資料與分母，不推算百分比。</li><li><strong className="text-navy">可比性：</strong>各國法律定義、記錄時點和報案率不同，適合觀察趨勢並謹慎比較。</li></ul></details><p className="mt-3 rounded-lg bg-ivory p-3 text-xs leading-5 text-gold-dark">快照整理：2026-10-24。UNODC 標示更新日：{data.metadata.workbookUpdated}。涵蓋年度依各國實際資料而異。</p></div>
            <div className="rounded-2xl border border-navy/10 bg-white p-3 sm:p-5"><p className="eyebrow">可追溯來源</p><h2 className="mt-1 text-xl font-black text-navy">資料來源與延伸閱讀</h2><ul className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">{SOURCES.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer" className="flex min-h-9 items-center justify-between gap-3 rounded-lg border border-navy/10 px-3 py-1.5 text-sm font-bold text-navy transition hover:border-gold hover:bg-ivory"><span>{source.label}</span><ExternalLink size={16} aria-hidden="true" className="shrink-0 text-gold-dark" /></a></li>)}</ul></div>
          </section>}
        </div>
      </main>
    </div>
  );
}

function Kpi({ label, value, detail, color }: { label: string; value: string; detail: string; color: "navy" | "gold" | "sage" | "coral" }) {
  const colors = {
    navy: "border-navy/15 bg-navy text-white",
    gold: "border-gold/40 bg-[#fff9eb] text-navy",
    sage: "border-sage/30 bg-[#f1f6f0] text-navy",
    coral: "border-coral/30 bg-[#fff4f2] text-coral-dark",
  };
  return <article className={`rounded-2xl border p-3 shadow-sm sm:p-4 ${colors[color]}`}>
    <p className={`text-xs font-bold sm:text-sm ${color === "navy" ? "text-ivory/75" : "text-ink-muted"}`}>{label}</p>
    <p className="mt-1 text-2xl font-black sm:mt-2 sm:text-3xl">{value}</p>
    <p className={`mt-1 text-[11px] leading-4 sm:text-xs ${color === "navy" ? "text-ivory/75" : "text-ink-muted"}`}>{detail}</p>
  </article>;
}

function PanelTab({ id, active, onClick, children }: { id: "overview" | "countries" | "types" | "method"; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button id={`${id}-tab`} type="button" role="tab" aria-selected={active} aria-controls="dashboard-panel" onClick={onClick} className={`min-h-10 min-w-0 flex-1 whitespace-nowrap rounded-full px-2 text-xs font-extrabold transition sm:px-4 sm:text-sm ${active ? "bg-navy text-ivory shadow-sm" : "border border-navy/15 bg-white text-navy hover:bg-ivory"}`}>
    {children}
  </button>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th scope="col" className="px-4 py-3 text-sm font-extrabold">{children}</th>;
}

function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages <= 1) return null;
  return <div className="mt-5 flex items-center justify-between gap-3">
    <button type="button" onClick={() => onChange(Math.max(0, page - 1))} disabled={page === 0} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-navy/20 px-4 font-bold text-navy disabled:opacity-40"><ArrowUp className="-rotate-90" size={17} aria-hidden="true" />上一頁</button>
    <span className="text-sm font-bold text-ink-muted">第 {page + 1} / {pages} 頁</span>
    <button type="button" onClick={() => onChange(Math.min(pages - 1, page + 1))} disabled={page >= pages - 1} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-navy/20 px-4 font-bold text-navy disabled:opacity-40">下一頁<ArrowDown className="rotate-[-90deg]" size={17} aria-hidden="true" /></button>
  </div>;
}

function EmptyState() {
  return <div className="mt-5 grid h-72 place-items-center rounded-xl bg-[#f7f4ed] p-6 text-center text-base font-semibold text-ink-muted">目前篩選條件沒有可繪製的觀測資料。</div>;
}
