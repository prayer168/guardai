import type { Metadata } from "next";

import { LearningPassport } from "@/components/learning-passport";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "我的學習護照" };

export default function PassportPage() {
  return (
    <>
      <PageIntro eyebrow="匿名、沒有排行榜" title="我的學習護照" description="用五題前測、情境練習與五題後測，看見查證能力如何進步。紀錄預設只留在這台裝置；加入班級後可主動提交匿名分數彙總。" />
      <div className="site-container max-w-5xl py-10 md:py-14"><LearningPassport /></div>
    </>
  );
}
