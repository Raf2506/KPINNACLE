"use client";

import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  value: { label: "Risk score" },
} satisfies ChartConfig;

function riskColorVar(score: number): string {
  if (score >= 67) return "var(--color-status-behind)";
  if (score >= 34) return "var(--color-status-at-risk)";
  return "var(--color-status-on-track)";
}

export function RiskScoreGauge({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score));
  const data = [{ name: "risk", value: clamped }];

  return (
    <div role="img" aria-label={`Risk score: ${Math.round(clamped)} out of 100`}>
      <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
        <RadialBarChart
          data={data}
          startAngle={90}
          endAngle={-270}
          innerRadius="72%"
          outerRadius="100%"
          barSize={16}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={8}
            fill={riskColorVar(clamped)}
            background={{ fill: "var(--color-muted)" }}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground font-mono text-3xl font-semibold tabular-nums"
          >
            {Math.round(clamped)}
          </text>
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
}
