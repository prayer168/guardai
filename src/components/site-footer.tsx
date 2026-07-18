import Link from "next/link";
import { ExternalLink, Phone, ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-navy text-ivory">
      <div className="site-container grid gap-8 py-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xl font-bold">
            <ShieldCheck aria-hidden="true" className="text-gold" />
            GuardAI 反詐守門員
          </div>
          <p className="max-w-md leading-7 text-ivory/70">不替你判斷，陪你完成查證。讓每一次可疑訊息，都成為學會保護自己的練習。</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold tracking-widest text-gold">需要真人協助？</h2>
          <a href="tel:165" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-coral px-5 py-3 font-bold text-white hover:bg-coral-dark">
            <Phone aria-hidden="true" size={19} />
            撥打 165
          </a>
          <p className="mt-2 text-sm text-ivory/60">若已匯款或提供資料，請立即保留紀錄並尋求協助。</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold tracking-widest text-gold">官方查證資源</h2>
          <div className="grid gap-2 text-sm">
            <a className="inline-flex items-center gap-1 text-ivory/80 hover:text-white" href="https://165.npa.gov.tw/" target="_blank" rel="noreferrer">
              165 全民防騙網 <ExternalLink aria-hidden="true" size={14} />
            </a>
            <a className="inline-flex items-center gap-1 text-ivory/80 hover:text-white" href="https://data.gov.tw/dataset/38262" target="_blank" rel="noreferrer">
              165 詐騙闢謠開放資料 <ExternalLink aria-hidden="true" size={14} />
            </a>
            <Link className="text-ivory/80 hover:text-white" href="/privacy">隱私與 AI 使用說明</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-ivory/50">
        GuardAI 教育科技原型｜2026 TAIA AI 創意設計大賽高中職組
      </div>
    </footer>
  );
}
