import type { Metadata } from "next";
import { Bot, Database, EyeOff, LockKeyhole, Phone, ShieldCheck } from "lucide-react";

import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "隱私與 AI 說明" };

export default function PrivacyPage() {
  return (
    <>
      <PageIntro eyebrow="安全不是附加功能" title="隱私與 AI 使用說明" description="GuardAI 以最少資料、可解釋結果與真人求助為原則，清楚說明 AI 能做什麼、不能做什麼。" />
      <div className="site-container max-w-5xl space-y-7 py-10 md:py-14">
        <section className="grid gap-5 md:grid-cols-2">
          {[
            [EyeOff, "輸入前先少一點", "不要貼入姓名、身分證、帳號、密碼、信用卡或 OTP。系統會再次遮罩常見敏感格式。"],
            [Database, "不保存原始訊息", "不要求登入，也不把使用者貼入的訊息寫入資料庫。個人學習紀錄預設只存在本機 localStorage。"],
            [LockKeyhole, "金鑰留在伺服器", "啟用即時 AI 時，API Key 只存在伺服器環境變數，不會傳到瀏覽器。"],
            [Bot, "AI 不是最終裁判", "AI 可能誤判、漏判或欠缺最新資訊；結果只用來協助辨認風險與規劃查證。"],
          ].map(([Icon, title, description]) => {
            const ItemIcon = Icon as typeof ShieldCheck;
            return <article key={String(title)} className="section-card"><span className="icon-disc"><ItemIcon aria-hidden="true" /></span><h2 className="mt-5 text-2xl font-black text-navy">{String(title)}</h2><p className="mt-3 leading-7 text-ink-muted">{String(description)}</p></article>;
          })}
        </section>

        <section className="section-card">
          <p className="eyebrow">資料流程</p>
          <h2 className="section-title">一則訊息如何被處理</h2>
          <ol className="mt-7 grid gap-4 md:grid-cols-4">
            {["瀏覽器送出文字", "伺服器先遮罩敏感格式", "AI 或離線規則分析", "只回傳結構化學習結果"].map((item, index) => <li key={item} className="numbered-flow"><span>{index + 1}</span><p>{item}</p></li>)}
          </ol>
          <p className="mt-6 rounded-xl bg-ivory-deep/60 p-4 text-sm leading-7 text-ink-muted">即時 OpenAI 模式設定 <code>store: false</code>，應用本身不永久保存訊息。為控制公開網站用量，每日配額服務只保存日期、不可逆訪客雜湊與次數，於期限到達後自動刪除；不保存訊息文字、分析結果、姓名或 IP 原值。</p>
        </section>

        <section className="section-card">
          <p className="eyebrow">匿名班級資料</p>
          <h2 className="section-title">加入班級時會送出哪些內容？</h2>
          <p className="mt-3 leading-7 text-ink-muted">學生必須主動按下提交，才會送出前測分數、後測分數、闖關分數、判讀練習次數與常忽略概念。伺服器只保存班級代碼、情境包、不可逆裝置雜湊和這些成果欄位；不保存姓名、座號、Email、個別作答內容或貼入的可疑訊息。</p>
          <p className="mt-4 rounded-xl bg-sage/12 p-4 text-sm font-bold leading-7 text-sage-dark">匿名班級與成果會在建立後 30 天自動刪除。教師只能查看全班參與人數、完成率與平均趨勢。</p>
        </section>

        <section className="rounded-3xl bg-navy p-6 text-ivory md:p-8">
          <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="grid size-14 place-items-center rounded-full bg-coral text-white"><Phone aria-hidden="true" /></span>
            <div><h2 className="text-2xl font-black">遇到金錢或人身風險，交給真人處理</h2><p className="mt-2 leading-7 text-ivory/70">停止付款、保留紀錄，請可信任成人陪同並撥打 165。緊急危險請聯絡 110。</p></div>
            <a href="tel:165" className="button button-light">撥打 165</a>
          </div>
        </section>

        <section className="notice notice-warning"><ShieldCheck aria-hidden="true" /><div><strong>固定聲明</strong><p>此為 AI 初步風險分析，不代表警方、金融機構或法律上的最終認定。</p></div></section>
      </div>
    </>
  );
}
