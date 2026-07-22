import type { Category, EmployeeMetric, Kpi, MetricsResponse } from "@/lib/types";

/**
 * Rule-based highlights computed purely from existing metrics — no LLM involved.
 * Deliberately not labeled "AI" anywhere in the UI, to stay distinct from the
 * (not-yet-built) real AI features and their AiBadge convention.
 */
export interface Highlight {
  id: string;
  text: string;
}

const CATEGORY_LABEL: Record<Category, string> = {
  SALES: "Sales",
  OPERATIONS: "Operations",
  COMPLIANCE: "Compliance",
  DEVELOPMENT: "Development",
};

export function buildHighlights(metrics: MetricsResponse, kpis: Kpi[]): Highlight[] {
  const highlights: Highlight[] = [];

  const categoryEntries = (Object.entries(metrics.categoryBreakdown) as [Category, number][]).filter(
    ([, score]) => score > 0
  );
  if (categoryEntries.length > 0) {
    const sorted = [...categoryEntries].sort((a, b) => b[1] - a[1]);
    const [bestCategory, bestScore] = sorted[0];
    highlights.push({
      id: "best-category",
      text: `${CATEGORY_LABEL[bestCategory]} is leading this cycle at ${Math.round(bestScore)}% average achievement.`,
    });

    const [worstCategory, worstScore] = sorted[sorted.length - 1];
    if (worstCategory !== bestCategory) {
      highlights.push({
        id: "worst-category",
        text: `${CATEGORY_LABEL[worstCategory]} needs the most attention at ${Math.round(worstScore)}% average achievement.`,
      });
    }
  }

  const rankedEmployees: EmployeeMetric[] = [...metrics.perEmployee]
    .filter((employee) => employee.kpiCount > 0)
    .sort((a, b) => b.overallScore - a.overallScore);
  if (rankedEmployees.length > 0) {
    const top = rankedEmployees[0];
    highlights.push({
      id: "top-performer",
      text: `${top.name} has the highest overall score this cycle at ${Math.round(top.overallScore)}%.`,
    });
  }

  const weightSums = new Map<string, { name: string; sum: number }>();
  for (const kpi of kpis) {
    if (!kpi.employee) continue;
    const entry = weightSums.get(kpi.employeeId) ?? { name: kpi.employee.name, sum: 0 };
    entry.sum += kpi.weight;
    weightSums.set(kpi.employeeId, entry);
  }
  const offBalance = [...weightSums.values()].filter((entry) => Math.abs(entry.sum - 100) > 0.01);
  if (offBalance.length === 1) {
    highlights.push({
      id: "weight-balance",
      text: `${offBalance[0].name}'s KPI weights sum to ${offBalance[0].sum}% instead of 100%.`,
    });
  } else if (offBalance.length > 1) {
    highlights.push({
      id: "weight-balance",
      text: `${offBalance.length} employees have KPI weights that don't sum to 100%.`,
    });
  }

  if (metrics.cycle?.isActive) {
    const daysLeft = Math.ceil(
      (new Date(metrics.cycle.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysLeft > 0) {
      highlights.push({
        id: "cycle-countdown",
        text: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in ${metrics.cycle.name}.`,
      });
    }
  }

  return highlights;
}
