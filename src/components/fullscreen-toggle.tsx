"use client";

import { Expand, Shrink } from "lucide-react";

type FullscreenToggleProps = {
  active: boolean;
  onToggle: () => void;
};

export function FullscreenToggle({ active, onToggle }: FullscreenToggleProps) {
  return (
    <button
      type="button"
      className="knowledge-icon-button"
      onClick={onToggle}
      aria-label={active ? "離開全螢幕" : "進入全螢幕"}
      aria-pressed={active}
      title={active ? "離開全螢幕" : "進入全螢幕"}
    >
      {active ? <Shrink aria-hidden="true" size={19} /> : <Expand aria-hidden="true" size={19} />}
      <span>{active ? "離開全螢幕" : "全螢幕"}</span>
    </button>
  );
}
