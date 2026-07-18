"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

import type { SkillKey } from "@/lib/content";

type LearningRadarProps = {
  scores: Record<SkillKey, number>;
};

export function LearningRadar({ scores }: LearningRadarProps) {
  const data = (Object.keys(scores) as SkillKey[]).map((skill) => ({
    skill,
    score: scores[skill],
    fullMark: 100,
  }));

  return (
    <div className="h-72 w-full" role="img" aria-label={`查證能力雷達圖：${data.map((item) => `${item.skill} ${item.score} 分`).join("、")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#C9B88F" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: "#10263D", fontSize: 16, fontWeight: 800 }} />
          <Radar name="查證力" dataKey="score" stroke="#B99352" fill="#B99352" fillOpacity={0.35} strokeWidth={3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
