import type { Metadata } from "next";

import { PrivacyExperience } from "@/components/privacy-experience";

export const metadata: Metadata = { title: "隱私與 AI 說明" };

export default function PrivacyPage() {
  return <PrivacyExperience />;
}
