import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const notoSansTc = Noto_Sans_TC({
  weight: "variable",
  variable: "--font-noto-sans-tc",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "GuardAI 反詐守門員｜不替你判斷，陪你完成查證",
    template: "%s｜GuardAI 反詐守門員",
  },
  description: "運用生成式 AI 培養查證能力的防詐學習平台，陪你完成停、看、問、查、求。",
  applicationName: "GuardAI 反詐守門員",
  keywords: ["防詐", "教育科技", "AI", "媒體素養", "查證能力"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" className={`${notoSansTc.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main id="main-content" className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
