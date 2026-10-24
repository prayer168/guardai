"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PresentationShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const presentationPage = ["/analyze", "/knowledge", "/privacy", "/showcase", "/passport", "/results"].includes(pathname);

  return <div className={`app-presentation-shell${presentationPage ? " is-presentation-page" : ""}`}>{children}</div>;
}
