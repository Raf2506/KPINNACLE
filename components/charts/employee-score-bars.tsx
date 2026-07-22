import { Progress } from "@/components/ui/progress";
import type { EmployeeMetric } from "@/lib/types";

export function EmployeeScoreBars({ employees }: { employees: EmployeeMetric[] }) {
  if (employees.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No employees yet.</p>;
  }

  const sorted = [...employees].sort((a, b) => b.overallScore - a.overallScore);

  return (
    <ul className="space-y-4">
      {sorted.map((employee) => {
        const score = Math.min(100, Math.max(0, employee.overallScore));
        return (
          <li key={employee.employeeId}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate font-medium text-foreground">{employee.name}</span>
              <span className="font-mono tabular-nums text-muted-foreground">{Math.round(score)}%</span>
            </div>
            <Progress
              value={score}
              aria-label={`${employee.name} overall score: ${Math.round(score)} percent`}
            />
          </li>
        );
      })}
    </ul>
  );
}
