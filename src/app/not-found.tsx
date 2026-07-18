import Link from "next/link";
import { ArrowLeft, ShieldQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="site-container grid min-h-[55vh] place-items-center py-16 text-center">
      <div><ShieldQuestion aria-hidden="true" className="mx-auto text-gold" size={64} /><h1 className="mt-5 text-4xl font-black text-navy">找不到這個頁面</h1><p className="mt-3 text-ink-muted">網址可能已變更，回首頁重新選擇功能。</p><Link href="/" className="button button-primary mt-7"><ArrowLeft aria-hidden="true" />回到首頁</Link></div>
    </div>
  );
}
