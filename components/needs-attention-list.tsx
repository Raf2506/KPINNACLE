import Link from "next/link";
import { achievementPct } from "@/lib/metrics";
import { AvatarInitials } from "@/components/avatar-initials";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import type { Kpi } from "@/lib/types";

export function NeedsAttentionList({ kpis, limit = 5 }: { kpis: Kpi[]; limit?: number }) {
  const ranked = [...kpis]
    .map((kpi) => ({ kpi, achievement: achievementPct(kpi.current, kpi.target) }))
    .sort((a, b) => a.achievement - b.achievement)
    .slice(0, limit);

  if (ranked.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nothing needs attention right now.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {ranked.map(({ kpi, achievement }) => (
        <li key={kpi.id}>
          <Link
            href={`/kpis?employee=${kpi.employeeId}`}
            className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted"
          >
            {kpi.employee ? (
              <AvatarInitials name={kpi.employee.name} className="size-8 shrink-0 text-xs" />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{kpi.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {kpi.employee?.name ?? "Unassigned"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span
                className={cn(
                  "font-mono text-sm font-semibold tabular-nums",
                  achievement >= 90
                    ? "text-status-on-track"
                    : achievement >= 60
                      ? "text-status-at-risk"
                      : "text-status-behind"
                )}
              >
                {Math.round(achievement)}%
              </span>
              <StatusBadge status={kpi.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
