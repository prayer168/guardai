import { AlertOctagon, AlertTriangle, CircleHelp, Info, ShieldCheck } from "lucide-react";

import type { RiskLevel } from "@/lib/analysis";

const riskConfig = {
  unknown: { label: "不確定", icon: CircleHelp, className: "risk-unknown" },
  low: { label: "低風險", icon: ShieldCheck, className: "risk-low" },
  medium: { label: "中風險", icon: Info, className: "risk-medium" },
  high: { label: "高風險", icon: AlertTriangle, className: "risk-high" },
  critical: { label: "緊急風險", icon: AlertOctagon, className: "risk-critical" },
} satisfies Record<RiskLevel, { label: string; icon: typeof ShieldCheck; className: string }>;

export function RiskBadge({ level }: { level: RiskLevel }) {
  const config = riskConfig[level];
  const Icon = config.icon;

  return (
    <span className={`risk-badge ${config.className}`}>
      <Icon aria-hidden="true" size={20} />
      {config.label}
    </span>
  );
}
