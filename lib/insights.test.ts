import { describe, expect, it } from "vitest";
import { buildHighlights } from "./insights";
import type { Kpi, MetricsResponse } from "./types";

function makeMetrics(overrides: Partial<MetricsResponse> = {}): MetricsResponse {
  return {
    cycle: {
      id: "cycle-1",
      name: "Q3 2026 (Jul–Sep)",
      startDate: "2026-07-01T00:00:00.000Z",
      endDate: "2026-09-30T00:00:00.000Z",
      isActive: true,
    },
    overallScore: 75,
    onTrackPct: 0.6,
    atRiskCount: 2,
    totalKpis: 8,
    totalEmployees: 2,
    categoryBreakdown: { SALES: 90, OPERATIONS: 40, COMPLIANCE: 0, DEVELOPMENT: 0 },
    statusDistribution: { NOT_STARTED: 0, ON_TRACK: 4, AT_RISK: 2, BEHIND: 2 },
    perEmployee: [
      {
        employeeId: "e1",
        name: "Aisha Rahman",
        role: "Sales Executive",
        department: "Sales",
        kpiCount: 4,
        overallScore: 90,
        onTrackPct: 0.75,
        atRiskCount: 1,
      },
      {
        employeeId: "e2",
        name: "Marcus Lim",
        role: "Operations Analyst",
        department: "Operations",
        kpiCount: 4,
        overallScore: 40,
        onTrackPct: 0.25,
        atRiskCount: 1,
      },
    ],
    ...overrides,
  };
}

function makeKpi(overrides: Partial<Kpi>): Kpi {
  return {
    id: "k1",
    title: "Test KPI",
    description: "",
    category: "SALES",
    weight: 50,
    target: 100,
    current: 50,
    unit: "%",
    status: "ON_TRACK",
    aiGenerated: false,
    notes: null,
    employeeId: "e1",
    cycleId: "cycle-1",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    employee: { id: "e1", name: "Aisha Rahman", role: "Sales Executive", department: "Sales" },
    ...overrides,
  };
}

describe("buildHighlights", () => {
  it("identifies the best and worst categories", () => {
    const highlights = buildHighlights(makeMetrics(), []);
    expect(highlights.find((h) => h.id === "best-category")?.text).toContain("Sales");
    expect(highlights.find((h) => h.id === "worst-category")?.text).toContain("Operations");
  });

  it("identifies the top performer", () => {
    const highlights = buildHighlights(makeMetrics(), []);
    expect(highlights.find((h) => h.id === "top-performer")?.text).toContain("Aisha Rahman");
  });

  it("flags a single employee with unbalanced weights", () => {
    const kpis = [
      makeKpi({ id: "k1", weight: 60, employeeId: "e1" }),
      makeKpi({ id: "k2", weight: 30, employeeId: "e1" }),
    ];
    const highlights = buildHighlights(makeMetrics(), kpis);
    const balance = highlights.find((h) => h.id === "weight-balance");
    expect(balance?.text).toContain("Aisha Rahman");
    expect(balance?.text).toContain("90");
  });

  it("flags multiple employees with unbalanced weights as a count", () => {
    const kpis = [
      makeKpi({ id: "k1", weight: 60, employeeId: "e1" }),
      makeKpi({
        id: "k2",
        weight: 50,
        employeeId: "e2",
        employee: { id: "e2", name: "Marcus Lim", role: "Operations Analyst", department: "Operations" },
      }),
    ];
    const highlights = buildHighlights(makeMetrics(), kpis);
    expect(highlights.find((h) => h.id === "weight-balance")?.text).toBe(
      "2 employees have KPI weights that don't sum to 100%."
    );
  });

  it("does not flag weights that sum to ~100 within tolerance", () => {
    const kpis = [
      makeKpi({ id: "k1", weight: 60, employeeId: "e1" }),
      makeKpi({ id: "k2", weight: 40, employeeId: "e1" }),
    ];
    const highlights = buildHighlights(makeMetrics(), kpis);
    expect(highlights.find((h) => h.id === "weight-balance")).toBeUndefined();
  });

  it("counts down days remaining for an active cycle", () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const highlights = buildHighlights(
      makeMetrics({ cycle: { id: "c", name: "Q3", startDate: "2026-07-01", endDate: future, isActive: true } }),
      []
    );
    const countdown = highlights.find((h) => h.id === "cycle-countdown");
    expect(countdown?.text).toMatch(/days? left in Q3/);
  });

  it("does not show a countdown for a closed cycle", () => {
    const highlights = buildHighlights(
      makeMetrics({
        cycle: { id: "c", name: "Q1", startDate: "2026-01-01", endDate: "2026-03-31", isActive: false },
      }),
      []
    );
    expect(highlights.find((h) => h.id === "cycle-countdown")).toBeUndefined();
  });

  it("returns an empty array gracefully when there is no data", () => {
    const highlights = buildHighlights(
      makeMetrics({
        cycle: null,
        categoryBreakdown: { SALES: 0, OPERATIONS: 0, COMPLIANCE: 0, DEVELOPMENT: 0 },
        perEmployee: [],
      }),
      []
    );
    expect(highlights).toEqual([]);
  });
});
