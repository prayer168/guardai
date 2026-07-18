import type { Metadata } from "next";

import { ChallengeGame } from "@/components/challenge-game";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "防詐闖關" };

export default function ChallengePage() {
  return (
    <>
      <PageIntro eyebrow="六個分支情境" title="防詐闖關" description="每一題都要選擇下一步行動。答題後立即看解釋，也包含正常通知，避免把所有訊息都誤判成詐騙。" />
      <div className="site-container max-w-5xl py-10 md:py-14"><ChallengeGame /></div>
    </>
  );
}
