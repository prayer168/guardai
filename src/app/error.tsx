"use client";

import { RefreshCw } from "lucide-react";

export default function ErrorPage({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <div className="site-container grid min-h-[55vh] place-items-center py-16 text-center">
      <div><h1 className="text-4xl font-black text-navy">頁面暫時無法顯示</h1><p className="mt-3 text-ink-muted">你的資料不會因此送出。可以重新載入這個區段。</p><button type="button" className="button button-primary mt-7" onClick={unstable_retry}><RefreshCw aria-hidden="true" />重新載入</button></div>
    </div>
  );
}
