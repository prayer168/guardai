import type { Metadata } from "next";

import { AssessmentResultsDashboard } from "@/components/assessment-results-dashboard";

export const metadata: Metadata = { title: "前後測整體成果" };

export default function AssessmentResultsPage() {
  return <AssessmentResultsDashboard />;
}
