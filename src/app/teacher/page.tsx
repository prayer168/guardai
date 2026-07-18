import type { Metadata } from "next";

import { PageIntro } from "@/components/page-intro";
import { TeacherDashboard } from "@/components/teacher-dashboard";

export const metadata: Metadata = { title: "教師專區" };

export default function TeacherPage() {
  return (
    <>
      <PageIntro eyebrow="課堂 Demo" title="教師專區" description="用匿名班級代碼指派情境，查看前後測進步與常錯概念，不顯示姓名、不做公開排名。" />
      <div className="site-container py-10 md:py-14"><TeacherDashboard /></div>
    </>
  );
}
