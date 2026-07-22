/**
 * Pure metrics engine. No DB, no fetch, no framework imports — see AGENTS.md
 * "All metrics come from lib/metrics.ts pure functions. UI never re-implements formulas."
 */

export const CATEGORIES = ["SALES", "OPERATIONS", "COMPLIANCE", "DEVELOPMENT"] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ["NOT_STARTED", "ON_TRACK", "AT_RISK", "BEHIND"] as const;
export type Status = (typeof STATUSES)[number];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** clamp(current/target × 100, 0, 100); target <= 0 → 0 (undefined/negative targets can't be achieved). */
export function achievementPct(current: number, target: number): number {
  if (target <= 0) return 0;
  return clamp((current / target) * 100, 0, 100);
}

export interface WeightedKpi {
  weight: number;
  current: number;
  target: number;
}

/** Σ(weight × achievementPct) ÷ Σ(weight); Σweight = 0 → 0. Normalizes even if weights don't sum to 100. */
export function overallScore(kpis: WeightedKpi[]): number {
  const totalWeight = kpis.reduce((sum, kpi) => sum + kpi.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = kpis.reduce(
    (sum, kpi) => sum + kpi.weight * achievementPct(kpi.current, kpi.target),
    0
  );
  return weightedSum / totalWeight;
}

export interface StatusKpi {
  status: Status;
}

/** on_track ÷ total; empty → 0. */
export function onTrackPct(kpis: StatusKpi[]): number {
  if (kpis.length === 0) return 0;
  const onTrack = kpis.filter((kpi) => kpi.status === "ON_TRACK").length;
  return onTrack / kpis.length;
}

/** count(status ∈ {AT_RISK, BEHIND}). */
export function atRiskCount(kpis: StatusKpi[]): number {
  return kpis.filter((kpi) => kpi.status === "AT_RISK" || kpi.status === "BEHIND").length;
}

export interface CategoryKpi {
  category: Category;
  current: number;
  target: number;
}

/** Average achievementPct per category. Categories with no KPIs report 0. */
export function categoryBreakdown(kpis: CategoryKpi[]): Record<Category, number> {
  const acc = Object.fromEntries(
    CATEGORIES.map((category) => [category, { total: 0, count: 0 }])
  ) as Record<Category, { total: number; count: number }>;

  for (const kpi of kpis) {
    acc[kpi.category].total += achievementPct(kpi.current, kpi.target);
    acc[kpi.category].count += 1;
  }

  return Object.fromEntries(
    CATEGORIES.map((category) => [
      category,
      acc[category].count === 0 ? 0 : acc[category].total / acc[category].count,
    ])
  ) as Record<Category, number>;
}

/** Count of KPIs per status. Statuses with no KPIs report 0. */
export function statusDistribution(kpis: StatusKpi[]): Record<Status, number> {
  const counts = Object.fromEntries(STATUSES.map((status) => [status, 0])) as Record<
    Status,
    number
  >;

  for (const kpi of kpis) {
    counts[kpi.status] += 1;
  }

  return counts;
}
