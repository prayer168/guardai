import type { Metadata } from "next";

import { ClassroomJoin } from "@/components/classroom-join";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "加入匿名班級" };

export default function JoinClassroomPage() {
  return (
    <>
      <PageIntro eyebrow="不需帳號與姓名" title="加入 GuardAI 匿名班級" description="輸入教師提供的班級代碼，把這台裝置上的前測、闖關與後測成果以匿名彙總方式交給教師。" />
      <div className="site-container max-w-4xl py-10 md:py-14"><ClassroomJoin /></div>
    </>
  );
}
