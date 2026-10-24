import type { Metadata } from "next";
import { GlobalFraudDashboard } from "@/components/global-fraud-dashboard";
import data from "@/data/global-fraud.json";

export const metadata: Metadata = {
  title: "全球詐騙資料觀測站",
  description: "以 UNODC 官方資料呈現 100 個國家與地區的警方詐騙案件紀錄、網路相關詐騙與資料涵蓋情形。",
};

export default function GlobalFraudPage() {
  return <GlobalFraudDashboard data={data} />;
}
