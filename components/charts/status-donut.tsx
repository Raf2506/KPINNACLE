"use client";

import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { Status } from "@/lib/types";

const STATUS_ORDER: Status[] = ["ON_TRACK", "AT_RISK", "BEHIND", "NOT_STARTED"];

const STATUS_LABEL: Record<Status, string> = {
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  BEHIND: "Behind",
  NOT_STARTED: "Not started",
};

const STATUS_COLOR_VAR: Record<Status, string> = {
  ON_TRACK: "var(--color-status-on-track)",
  AT_RISK: "var(--color-status-at-risk)",
  BEHIND: "var(--color-status-behind)",
  NOT_STARTED: "var(--color-status-not-started)",
};

const chartConfig = {
  value: { label: "KPIs" },
} satisfies ChartConfig;

export function StatusDonut({ distribution }: { distribution: Record<Status, number> }) {
  const total = STATUS_ORDER.reduce((sum, status) => sum + distribution[status], 0);

  if (total === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No KPIs yet.</p>;
  }

  const data = STATUS_ORDER.filter((status) => distribution[status] > 0).map((status) => ({
    status,
    label: STATUS_LABEL[status],
    value: distribution[status],
  }));

  const summary = STATUS_ORDER.map((s) => `${STATUS_LABEL[s]}: ${distribution[s]}`).join(", ");

  return (
    <div className="flex flex-col items-center gap-4">
      <div role="img" aria-label={`KPI status distribution — ${summary}`}>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={55} outerRadius={80} strokeWidth={2}>
              {data.map((entry) => (
                <Cell key={entry.status} fill={STATUS_COLOR_VAR[entry.status]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {STATUS_ORDER.map((status) => (
          <li key={status} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: STATUS_COLOR_VAR[status] }}
              aria-hidden="true"
            />
            <span className="truncate text-muted-foreground">{STATUS_LABEL[status]}</span>
            <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
              {distribution[status]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
