"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { href: "/", label: "首頁" },
  { href: "/analyze", label: "AI 判讀實驗室" },
  { href: "/passport", label: "學習護照" },
  { href: "/teacher", label: "教師專區" },
  { href: "/knowledge", label: "知識庫" },
  { href: "/challenge", label: "防詐闖關" },
  { href: "/privacy", label: "隱私與 AI" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy/95 text-ivory shadow-lg backdrop-blur">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-ivory px-4 py-2 text-navy focus:not-sr-only focus:absolute focus:left-4 focus:top-3"
      >
        跳到主要內容
      </a>
      <div className="site-container flex min-h-18 items-center justify-between gap-4 py-3">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid size-11 place-items-center rounded-full border border-gold/50 bg-gold/10 text-gold transition group-hover:bg-gold/20">
            <ShieldCheck aria-hidden="true" size={24} strokeWidth={1.8} />
          </span>
          <span>
            <span className="block text-lg font-extrabold tracking-wide">GuardAI</span>
            <span className="block text-xs tracking-[0.18em] text-ivory/70">反詐守門員</span>
          </span>
        </Link>

        <nav aria-label="主要導覽" className="hidden items-center gap-1 xl:flex">
          {navigation.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                  active ? "bg-ivory text-navy" : "text-ivory/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className="grid size-12 place-items-center rounded-full border border-white/20 text-ivory transition hover:bg-white/10 xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "關閉選單" : "開啟選單"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {open ? (
        <nav id="mobile-navigation" aria-label="手機導覽" className="border-t border-white/10 bg-navy px-5 pb-5 xl:hidden">
          <div className="mx-auto grid max-w-7xl gap-1 pt-3">
            {navigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-base font-semibold ${
                    active ? "bg-ivory text-navy" : "text-ivory hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
