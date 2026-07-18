import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";
import { TeacherDashboard } from "@/components/teacher-dashboard";

export const metadata: Metadata = { title: "教師專區" };

export default function TeacherPage() {
  return (
    <>
      <PageIntro eyebrow="可實際操作的匿名班級" title="教師專區" description="建立 30 天有效的匿名班級代碼，指派情境並查看全班前後測、闖關與常錯概念，不顯示姓名、不做公開排名。" />
      <div className="site-container py-10 md:py-14"><TeacherDashboard /></div>
    </>
  );
}
