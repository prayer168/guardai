import type { Metadata } from "next";

import { LearningPassport } from "@/components/learning-passport";

export const metadata: Metadata = { title: "我的學習護照" };

export default function PassportPage() {
  return (
    <div className="passport-page"><LearningPassport /></div>
  );
}
