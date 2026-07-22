"use client";

import { Bar, BarChart, Cell, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { Category } from "@/lib/types";

const CATEGORY_LABEL: Record<Category, string> = {
  SALES: "Sales",
  OPERATIONS: "Operations",
  COMPLIANCE: "Compliance",
  DEVELOPMENT: "Development",
};

const CATEGORY_COLOR_VAR: Record<Category, string> = {
  SALES: "var(--color-chart-1)",
  OPERATIONS: "var(--color-chart-2)",
  COMPLIANCE: "var(--color-chart-3)",
  DEVELOPMENT: "var(--color-chart-4)",
};

const chartConfig = {
  value: { label: "Avg. achievement" },
} satisfies ChartConfig;

export function CategoryBarChart({ breakdown }: { breakdown: Record<Category, number> }) {
  const data = (Object.keys(breakdown) as Category[]).map((category) => ({
    category,
    label: CATEGORY_LABEL[category],
    value: Math.round(breakdown[category] * 10) / 10,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} stroke="var(--color-border)" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={82}
          interval={0}
          tick={{ fill: "var(--color-foreground)", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={CATEGORY_COLOR_VAR[entry.category]} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
