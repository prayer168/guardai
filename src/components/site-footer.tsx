import Link from "next/link";
import { ExternalLink, Phone, ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="shrink-0 border-t border-white/10 bg-navy text-ivory">
      <div className="site-container flex min-h-10 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1 text-xs">
        <span className="hidden items-center gap-1.5 text-ivory/65 sm:inline-flex"><ShieldCheck aria-hidden="true" className="text-gold" size={15} />GuardAI｜不替你判斷，陪你完成查證</span>
        <span className="text-ivory/55">© 2026 TAIA AI 創意設計大賽高中職組</span>
        <div className="flex items-center gap-3 font-bold">
          <a href="tel:165" className="inline-flex min-h-8 items-center gap-1 rounded-full bg-coral px-3 text-white hover:bg-coral-dark"><Phone aria-hidden="true" size={14} />165 求助</a>
          <a className="hidden items-center gap-1 text-ivory/75 hover:text-white md:inline-flex" href="https://165.npa.gov.tw/" target="_blank" rel="noreferrer">官方查證 <ExternalLink aria-hidden="true" size={12} /></a>
          <Link className="text-ivory/75 hover:text-white" href="/privacy">隱私說明</Link>
        </div>
      </div>
    </footer>
  );
}
