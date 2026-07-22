import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrendBadge({
  delta,
  suffix = "",
  invert = false,
  precision = 0,
}: {
  delta: number;
  suffix?: string;
  invert?: boolean;
  precision?: number;
}) {
  const rounded = Number(delta.toFixed(precision));

  if (rounded === 0) {
    return (
      <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-muted-foreground">
        <Minus className="h-3 w-3" aria-hidden="true" />
        No change
      </span>
    );
  }

  const isPositive = rounded > 0;
  const isGood = invert ? !isPositive : isPositive;
  const Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 text-xs font-medium tabular-nums",
        isGood ? "text-status-on-track" : "text-status-behind"
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {isPositive ? "+" : ""}
      {rounded}
      {suffix}
    </span>
  );
}
