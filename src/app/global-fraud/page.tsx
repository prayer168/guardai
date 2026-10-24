import type { Metadata } from "next";
import { GlobalFraudDashboard } from "@/components/global-fraud-dashboard";
import data from "@/data/global-fraud.json";

export const metadata: Metadata = {
  title: "全球詐騙資料觀測站",
  description: "互動式全球詐騙儀表板：國別前 20 與台灣、2013–2025 國家趨勢、3D 可旋轉風險地球及官方資料來源。",
};

export default function GlobalFraudPage() {
  return <GlobalFraudDashboard data={data} />;
}
