import type { Metadata } from "next";

import { Analyzer } from "@/components/analyzer";

export const metadata: Metadata = { title: "AI 判讀實驗室" };

export default function AnalyzePage() {
  return (
    <Analyzer />
  );
}
