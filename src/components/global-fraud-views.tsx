"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { X } from "lucide-react";
import type { GlobeMethods } from "react-globe.gl";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

type Row = { year: number; fraudCount: number | null; fraudRate: number | null };
type Country = { iso3: string; name: string; region: string; history: Row[] };
type Featured = { iso3: string; name: string; en: string; zh?: string; lat: number; lng: number; taiwan?: boolean; rate?: number | null; history: Row[] };

const COUNTRY_LABELS: Record<string, string> = {
  BRA:"巴西", DEU:"德國", ESP:"西班牙", ITA:"義大利", FRA:"法國", SWE:"瑞典", CAN:"加拿大", POL:"波蘭", COL:"哥倫比亞", MEX:"墨西哥", BEL:"比利時", AUT:"奧地利", FIN:"芬蘭", DNK:"丹麥", JPN:"日本", SGP:"新加坡", PRT:"葡萄牙", HUN:"匈牙利", CHE:"瑞士", ECU:"厄瓜多", THA:"泰國", IDN:"印尼", ISR:"以色列", NOR:"挪威", IRL:"愛爾蘭", TUR:"土耳其", USA:"美國", GBR:"英國", ARG:"阿根廷", RUS:"俄羅斯", TWN:"台灣",
};
const GEO: Record<string, [number, number]> = {
  BRA:[-10,-55],DEU:[51,10],ESP:[40,-4],ITA:[42,12],FRA:[46,2],SWE:[62,15],CAN:[56,-106],POL:[52,19],COL:[4,-72],MEX:[23,-102],BEL:[50.5,4.5],AUT:[47.5,14],FIN:[64,26],DNK:[56,10],JPN:[36,138],SGP:[1.35,103.8],PRT:[39.5,-8],HUN:[47,19],CHE:[47,8],ECU:[-1.5,-78],THA:[15,101],IDN:[-2,118],ISR:[31,35],NOR:[62,8],IRL:[53,-8],TUR:[39,35],USA:[39,-98],GBR:[54,-2],ARG:[-35,-64],RUS:[60,90],TWN:[23.7,121],VAT:[41.9,12.45],LIE:[47.16,9.55],MAC:[22.2,113.55],SVN:[46,15],EST:[59,25],CRI:[10,-84],URY:[-33,-56],MNG:[46,105],MLT:[35.9,14.4],KOR:[36,128],CHN:[35,103],IND:[22,79],PHL:[13,122],VNM:[16,108],NLD:[52,5],CZE:[49.8,15.5],ROU:[46,25],GRC:[39,22],ZAF:[-29,24],EGY:[27,30],NGA:[9,8],KEN:[0,38],GHA:[8,-2],SAU:[24,45],ARE:[24,54],CHL:[-30,-71],PER:[-9,-75],PAN:[9,-80],DOM:[19,-70],JAM:[18,-77],CUB:[22,-79],NZL:[-41,174],AUS:[-25,133],UKR:[49,32],PSE:[31.9,35.2],HRV:[45,16],SVK:[48.7,19.5],BGR:[42.7,25.5],LVA:[57,25],LTU:[56,24],ISL:[65,-19],LUX:[49.8,6.1],CYP:[35,33],MKD:[41.6,21.7],ALB:[41,20],BIH:[44,18],SRB:[44,21],MNE:[42.7,19.4],KAZ:[48,68],UZB:[41,64],PAK:[30,70],BGD:[24,90],LKA:[7,81],NPL:[28,84],MMR:[21,96],KHM:[12.5,105],LAO:[19,103],IRQ:[33,44],IRN:[32,53],JOR:[31,36],LBN:[33.9,35.8],MAR:[32,-6],DZA:[28,3],TUN:[34,9],ETH:[9,40],UGA:[1,32],TZA:[-6,35],SEN:[14,-14],CIV:[7,-5],CMR:[6,12],AGO:[-12,18],ZMB:[-13,28],ZWE:[-19,29],NAM:[-22,17],BWA:[-22,24],MOZ:[-18,35],MDG:[-19,47],FJI:[-17.7,178],PNG:[-6,147],QAT:[25.3,51.2],KWT:[29.3,47.5],OMN:[21,57],BHR:[26,50.5],ARM:[40,45],GEO:[42,43.5],AZE:[40,47.5],TJK:[39,71],KGZ:[41,75],AFG:[33,66],PRK:[40,127]
};
const TW_HISTORY: Row[] = [
  {year:2013,fraudCount:13916,fraudRate:null},{year:2014,fraudCount:18472,fraudRate:null},{year:2015,fraudCount:15725,fraudRate:null},
  {year:2016,fraudCount:null,fraudRate:null},{year:2017,fraudCount:22689,fraudRate:null},{year:2018,fraudCount:23470,fraudRate:null},{year:2019,fraudCount:23647,fraudRate:null},{year:2020,fraudCount:23054,fraudRate:97.76},{year:2021,fraudCount:24724,fraudRate:105.35},{year:2022,fraudCount:29509,fraudRate:126.54},{year:2023,fraudCount:37823,fraudRate:162.03},{year:2024,fraudCount:118535,fraudRate:506.34},{year:2025,fraudCount:197595,fraudRate:null},
];

const COORDS: Record<string, [number,number]> = { ...GEO };
const RISK = [
  {name:"低",max:50,color:"#f5f3ed",text:"低於 50 / 十萬人"}, {name:"注意",max:200,color:"#94a3b8",text:"50–199 / 十萬人"}, {name:"中高",max:500,color:"#e2b24d",text:"200–499 / 十萬人"}, {name:"嚴重",max:1000,color:"#ef7b47",text:"500–999 / 十萬人"}, {name:"極嚴重",max:Infinity,color:"#8b5cf6",text:"1,000 以上 / 十萬人"},
];
function risk(rate: number | null) { return rate === null ? { name: "缺值", max: 0, color: "#64748b", text: "來源未提供案件率" } : RISK.find((x) => rate < x.max) ?? RISK[RISK.length - 1]; }
const fmt = (v: number | null) => v == null ? "—" : new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 1 }).format(v);

export function GlobalTopCountries({ countries, onTrend }: { countries: Country[]; onTrend: (iso: string) => void }) {
  const rows = useMemo(() => countries.map((c) => {
    const latest = c.history.find((r) => r.year === 2024);
    return latest?.fraudCount == null ? null : { iso3:c.iso3,name:c.name,zh:COUNTRY_LABELS[c.iso3] ?? c.name, count:latest.fraudCount, rate:latest.fraudRate };
  }).filter((x): x is NonNullable<typeof x> => x !== null).sort((a,b)=>b.count-a.count).slice(0,20), [countries]);
  const taiwan = { iso3:"TWN", name:"Taiwan", zh:"台灣", count:118535, rate:506.34 };
  const all = [...rows, taiwan].sort((a,b)=>b.count-a.count);
  return <section className="grid min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_17rem]">
    <article className="min-h-0 rounded-2xl border border-navy/10 bg-white p-3 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="eyebrow">國際比較・按案件總數</p><h2 className="text-xl font-black text-navy sm:text-2xl">2024 國別前 20＋台灣</h2></div><span className="rounded-full bg-ivory px-3 py-1 text-xs font-bold text-gold-dark">橫向長條・台灣金色強調</span></div>
      <div className="mt-2 h-[min(68vh,720px)] min-h-[390px] w-full">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={all} layout="vertical" margin={{top:4,right:24,bottom:4,left:4}} barCategoryGap={5}>
          <CartesianGrid stroke="#e7e1d5" horizontal={false}/><XAxis type="number" tick={{fill:"#58656c",fontSize:12}} tickFormatter={(v:number)=>fmt(v)}/><YAxis type="category" dataKey="zh" width={76} tick={{fill:"#10263d",fontSize:12,fontWeight:700}}/><Tooltip formatter={(v)=>[`${fmt(Number(v))} 件`,"警方記錄案件"]} labelFormatter={(_,p)=>{const x=p?.[0]?.payload;return x?`${x.zh} / ${x.name}`:""}} contentStyle={{borderRadius:12,fontSize:13}}/><Bar dataKey="count" radius={[0,7,7,0]} maxBarSize={23}>{all.map((r)=><Cell key={r.iso3} fill={r.iso3==="TWN"?"#c4a15f":risk(r.rate).color}/>)}</Bar>
        </BarChart></ResponsiveContainer>
      </div>
      <p className="text-xs leading-5 text-ink-muted">UNODC 最新可比資料為 2024 年。台灣採警政署 2024 年統計（118,535 件），因統計口徑不同獨立加入，不與國際排行作直接名次比較。案件數非受害人數或實際盛行率。</p>
    </article>
    <aside className="grid content-start gap-2 rounded-2xl border border-navy/10 bg-white p-3 sm:p-4">
      <div><h3 className="font-extrabold text-navy">風險色階</h3><p className="text-xs text-ink-muted">依每十萬人口案件率分級</p></div>
      {RISK.map((item)=><div key={item.name} className="flex items-center gap-2 rounded-xl bg-[#f8f6f1] p-2"><span className="size-4 shrink-0 rounded-full border border-black/10" style={{backgroundColor:item.color}}/><span className="text-sm font-bold text-navy">{item.name}</span><span className="ml-auto text-xs text-ink-muted">{item.text}</span></div>)}
      <div className="flex items-center gap-2 rounded-xl bg-[#f8f6f1] p-2"><span className="size-4 shrink-0 rounded-full border border-black/10 bg-slate-500"/><span className="text-sm font-bold text-navy">缺值</span><span className="ml-auto text-xs text-ink-muted">來源無案件率</span></div>
      <div className="flex items-center gap-2 rounded-xl bg-[#fff8e9] p-2"><span className="size-4 shrink-0 rounded-full border border-black/10 bg-[#ffd166]"/><span className="text-sm font-bold text-navy">台灣</span><span className="ml-auto text-xs text-ink-muted">獨立強調</span></div>
      <div className="rounded-xl border border-gold/40 bg-[#fff8e9] p-3"><p className="font-extrabold text-gold-dark">台灣・Taiwan</p><p className="mt-1 text-sm text-ink">2024：118,535 件</p><p className="text-sm text-ink">犯罪率：506.34 / 十萬人</p><button onClick={()=>onTrend("TWN")} className="mt-2 text-sm font-bold text-navy underline">看台灣歷年趨勢</button></div>
      <p className="mt-1 text-xs leading-5 text-ink-muted">圖表以案件數排序，顏色反映每十萬人案件率。這是本儀表板的自訂參考級距，不是官方警戒標準；案件率仍受報案率與法律定義影響。</p>
    </aside>
  </section>;
}

export function CountryTrend({ countries, initialCountry="BRA" }: { countries: Country[]; initialCountry?: string }) {
  const options = useMemo(() => [...countries.map((c)=>({iso3:c.iso3,name:c.name,zh:COUNTRY_LABELS[c.iso3]??c.name,history:c.history})),{iso3:"TWN",name:"Taiwan",zh:"台灣 Taiwan",history:TW_HISTORY}].sort((a,b)=>a.zh.localeCompare(b.zh,"zh-TW")),[countries]);
  const [iso,setIso]=useState(initialCountry); const [metric,setMetric]=useState<"fraudCount"|"fraudRate">("fraudCount");
  const selected=options.find((x)=>x.iso3===iso)??options[0];
  const rows=Array.from({length:13},(_,i)=>{const year=2013+i;const row=selected.history.find((x)=>x.year===year);return {year,value:row?.[metric]??null};});
  const source=iso==="TWN"?"台灣警政署／刑事警察局（逐年公布；2024 起統計方式變更）":"UNODC 國家犯罪統計資料庫";
  return <section className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1fr)_16rem]">
    <article className="min-h-[380px] rounded-2xl border border-navy/10 bg-white p-3 sm:p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">逐國觀察・缺年不補零</p><h2 className="text-xl font-black text-navy sm:text-2xl">{selected.zh} / {selected.name}</h2></div><label className="grid gap-1 text-xs font-bold text-navy">選擇國家<select value={iso} onChange={(e)=>setIso(e.target.value)} className="min-h-10 min-w-52 rounded-lg border border-navy/20 bg-white px-3 text-sm">{options.map((c)=><option key={c.iso3} value={c.iso3}>{c.zh} / {c.name}</option>)}</select></label></div>
      <div className="mt-3 flex gap-2">{(["fraudCount","fraudRate"] as const).map((m)=><button key={m} onClick={()=>setMetric(m)} aria-pressed={metric===m} className={`rounded-full px-4 py-2 text-sm font-bold ${metric===m?"bg-navy text-white":"bg-[#f1ede4] text-navy"}`}>{m==="fraudCount"?"案件數":"每十萬人案件率"}</button>)}</div>
      <div className="mt-3 h-[min(55vh,450px)] min-h-[260px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={rows} margin={{top:10,right:18,bottom:4,left:4}}><CartesianGrid stroke="#e7e1d5"/><XAxis dataKey="year" tick={{fontSize:12}}/><YAxis width={72} tick={{fontSize:11}} tickFormatter={(v:number)=>fmt(v)}/><Tooltip labelFormatter={(v)=>`${v} 年`} formatter={(v)=>[fmt(v==null?null:Number(v)),metric==="fraudCount"?"案件":"件 / 十萬人"]}/><Line type="monotone" dataKey="value" connectNulls={false} stroke={iso==="TWN"?"#c4a15f":"#12324a"} strokeWidth={3} dot={{r:4}} activeDot={{r:7}}/></LineChart></ResponsiveContainer></div>
      <p className="text-sm leading-6 text-ink-muted">資料來源：{source}。年份無官方觀測值時留白，不推估、不視為零。UNODC 各國涵蓋年度不一；截至 2026 年目前，全球可比較完整年度為 2024，台灣完整年度到 2025。警政署另有更新至 2026 年 8 月的年累計資料，因非全年不放進年度趨勢比較。</p>
    </article>
    <aside className="rounded-2xl border border-navy/10 bg-white p-4"><h3 className="font-extrabold text-navy">閱讀說明</h3><dl className="mt-3 grid gap-3 text-sm"><div><dt className="font-bold text-gold-dark">年度區間</dt><dd className="text-ink-muted">2013–2025。2026 尚未形成完整年度全球資料。</dd></div><div><dt className="font-bold text-gold-dark">資料空白</dt><dd className="text-ink-muted">來源未提供的年度以斷點呈現，沒有補值。</dd></div>{iso==="TWN"&&<div className="rounded-xl bg-[#fff8e9] p-3"><dt className="font-bold text-gold-dark">台灣統計斷點</dt><dd className="mt-1 text-ink-muted">2024 年 9 月起部分案件改採「一位被害人一件」，與早年數字不可直接視為同口徑。</dd></div>}</dl></aside>
  </section>;
}

export function FraudGlobe({ countries, initialCountry="" }: { countries: Country[]; initialCountry?: string }) {
  const points = useMemo<Featured[]>(()=>{
    const top=countries.map((c)=>{const r=c.history.find(x=>x.year===2024);return r?.fraudCount==null?null:{iso3:c.iso3,name:c.name,en:c.name,lat:COORDS[c.iso3]?.[0]??0,lng:COORDS[c.iso3]?.[1]??0,history:c.history,rate:r.fraudRate};}).filter((x):x is NonNullable<typeof x>=>!!x).sort((a,b)=>Number(b.history.find(r=>r.year===2024)?.fraudCount??0)-Number(a.history.find(r=>r.year===2024)?.fraudCount??0)).slice(0,20);
    const global: Featured[] = top.map(x=>({...x,zh:COUNTRY_LABELS[x.iso3]??x.name}));
    global.push({iso3:"TWN",name:"Taiwan",en:"Taiwan",zh:"台灣",lat:COORDS.TWN[0],lng:COORDS.TWN[1],history:TW_HISTORY,rate:506.34,taiwan:true});
    return global;
  },[countries]);
  const [selected,setSelected]=useState<Featured|null>(()=>points.find(p=>p.iso3===initialCountry)??null);
  const [ready,setReady]=useState(false);
  const globeRef=useRef<GlobeMethods|undefined>(undefined);
  const canvasRef=useRef<HTMLDivElement>(null);
  const [size,setSize]=useState({width:960,height:620});
  useEffect(()=>{const node=canvasRef.current;if(!node)return;const observer=new ResizeObserver(([entry])=>{if(entry)setSize({width:Math.max(320,Math.floor(entry.contentRect.width)),height:Math.max(440,Math.floor(entry.contentRect.height))});});observer.observe(node);return()=>observer.disconnect();},[]);
  const trend=selected?.history.filter(x=>x.year>=2013&&x.year<=2025).map(x=>({year:x.year,value:x.fraudCount}))??[];
  const f=selected?.history.find(x=>x.year===2024);
  const selectedRate=selected?.iso3==="TWN"?506.34:f?.fraudRate??null;
  const selectedCount=selected?.iso3==="TWN"?118535:f?.fraudCount??null;
  return <section className="relative grid min-h-[70vh] overflow-hidden rounded-2xl border border-navy/20 bg-[#07182a] lg:grid-cols-[minmax(0,1fr)_20rem]">
    <div ref={canvasRef} className="relative min-h-[60vh] touch-none"><div className="absolute left-4 top-4 z-10 max-w-[min(82%,34rem)] rounded-xl border border-white/15 bg-[#07182a]/80 p-3 text-white backdrop-blur"><p className="text-xs font-bold uppercase tracking-widest text-gold">GUARDAI · GLOBAL FRAUD WATCH</p><h2 className="mt-1 text-lg font-black sm:text-2xl">互動式詐騙風險地球</h2><p className="mt-1 text-xs text-white/75 sm:text-sm">拖曳旋轉・觸控滑動・點選標記鎖定國家</p></div>
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-1.5">{RISK.map(x=><span key={x.name} className="flex items-center gap-1 rounded-full border border-white/10 bg-[#07182a]/75 px-2 py-1 text-[11px] font-bold text-white"><i className="size-2.5 rounded-full" style={{background:x.color}}/>{x.name}</span>)}</div>
      {!ready&&<div className="absolute inset-0 grid place-items-center text-sm font-semibold text-white/70">正在載入地球與地形紋理…</div>}
      <Globe ref={globeRef} width={size.width} height={size.height} backgroundColor="rgba(0,0,0,0)" globeImageUrl="/textures/earth-day.jpg" bumpImageUrl="/textures/earth-topology.png" showAtmosphere atmosphereColor="#72c8e6" atmosphereAltitude={0.14} showGraticules globeCurvatureResolution={3} pointsData={points} pointLat="lat" pointLng="lng" pointAltitude={0.04} pointRadius={0.42} pointColor={(p:object)=>{const x=p as Featured;return x.taiwan?"#ffd166":risk(x.rate??null).color;}} pointLabel={(p:object)=>{const x=p as Featured&{zh:string};return `<b>${x.zh} / ${x.en}</b><br/>點選查看趨勢`;}} onPointClick={(p:object)=>setSelected(p as Featured)} onGlobeReady={()=>{globeRef.current?.pointOfView({lat:24,lng:118,altitude:2.35},900);setReady(true);}} enablePointerInteraction={true} />
    </div>
    <aside className="relative z-10 flex min-h-[360px] flex-col border-t border-white/10 bg-[#f9f6ef] p-4 lg:border-l lg:border-t-0">
      {selected?<><button aria-label="解除釘選" onClick={()=>setSelected(null)} className="absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-navy/15 bg-white text-navy"><X size={18}/></button><p className="eyebrow">已釘選國家</p><h3 className="pr-10 text-xl font-black text-navy">{COUNTRY_LABELS[selected.iso3]??selected.name} <span className="text-base font-semibold">/ {selected.en}</span></h3><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white p-3"><p className="text-xs font-bold text-ink-muted">2024 年案件數</p><p className="mt-1 text-lg font-black text-navy">{fmt(selectedCount)}</p></div><div className="rounded-xl bg-white p-3"><p className="text-xs font-bold text-ink-muted">案件率 / 十萬人</p><p className="mt-1 text-lg font-black" style={{color:risk(selectedRate).color==="#f5f3ed"?"#10263d":risk(selectedRate).color}}>{fmt(selectedRate)}</p></div></div>{selected.iso3==="TWN"&&<div className="mt-2 rounded-xl border border-gold/40 bg-[#fff8e9] p-3"><p className="text-xs font-bold text-gold-dark">台灣最新完整年度（2025）</p><p className="mt-1 text-sm font-extrabold text-navy">197,595 件・官方破獲率 70.44%</p><p className="mt-1 text-xs leading-5 text-ink-muted">依警政署年度統計；與 UNODC 國別資料分開呈現。</p></div>}<div className="mt-4 flex items-center justify-between gap-2"><h4 className="font-extrabold text-navy">2013–2025 趨勢</h4><span className="rounded-full px-2 py-1 text-xs font-bold" style={{background:risk(selectedRate).color,color:risk(selectedRate).color==="#f5f3ed"?"#10263d":"white"}}>{selected.iso3==="TWN"?"台灣特別標示":risk(selectedRate).name}</span></div><div className="mt-1 h-52"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend} margin={{top:8,right:10,bottom:0,left:-18}}><CartesianGrid stroke="#ddd6c9"/><XAxis dataKey="year" tick={{fontSize:10}}/><YAxis tick={{fontSize:10}} tickFormatter={(v:number)=>fmt(v)}/><Tooltip labelFormatter={(v)=>`${v} 年`} formatter={(v)=>[fmt(v==null?null:Number(v)),"案件數"]}/><Line dataKey="value" connectNulls={false} stroke="#c4a15f" strokeWidth={2.5} dot={{r:3}}/></LineChart></ResponsiveContainer></div><p className="mt-auto text-xs leading-5 text-ink-muted">台灣資料來自警政署，國際比較來自 UNODC；統計口徑不同。空白年度表示來源缺值，不代表零。2026 年只有年累計資料，未當成完整年度繪圖。</p></>:<div className="grid flex-1 content-center gap-3 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-navy text-gold">◎</span><h3 className="text-xl font-black text-navy">選一個國家查看</h3><p className="text-sm leading-6 text-ink-muted">在地球上點選亮點即可釘選，查看國別資料和歷年案件趨勢。右上角 × 可解除釘選。</p><div className="rounded-xl bg-white p-3 text-left text-xs leading-5 text-ink-muted">色階以每十萬人口案件率為參考，是本儀表板自訂的參考級距，不是官方標準；台灣以金色標記，資料另採警政署口徑。</div></div>}
    </aside>
  </section>;
}
