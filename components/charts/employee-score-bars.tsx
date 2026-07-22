import { AvatarInitials } from "@/components/avatar-initials";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { EmployeeMetric } from "@/lib/types";

const RANK_BADGE: Record<number, string> = {
  0: "bg-accent text-accent-foreground",
  1: "bg-muted text-foreground",
  2: "bg-chart-4/15 text-chart-4",
};

export function EmployeeScoreBars({ employees }: { employees: EmployeeMetric[] }) {
  if (employees.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No employees yet.</p>;
  }

  const sorted = [...employees].sort((a, b) => b.overallScore - a.overallScore);

  return (
    <ul className="space-y-1">
      {sorted.map((employee, index) => {
        const score = Math.min(100, Math.max(0, employee.overallScore));
        return (
          <li key={employee.employeeId} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                RANK_BADGE[index] ?? "bg-muted text-muted-foreground"
              )}
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <AvatarInitials name={employee.name} className="size-9 shrink-0 text-xs" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-foreground">{employee.name}</span>
                <span className="font-mono text-sm tabular-nums text-muted-foreground">
                  {Math.round(score)}%
                </span>
              </div>
              <Progress
                value={score}
                aria-label={`${employee.name} overall score: ${Math.round(score)} percent`}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
