import { describe, expect, it } from "vitest";
import {
  achievementPct,
  atRiskCount,
  categoryBreakdown,
  onTrackPct,
  overallScore,
  statusDistribution,
} from "./metrics";

describe("achievementPct", () => {
  it("computes the basic percentage", () => {
    expect(achievementPct(50, 100)).toBe(50);
  });

  it("clamps above 100%", () => {
    expect(achievementPct(150, 100)).toBe(100);
  });

  it("clamps below 0% for negative current", () => {
    expect(achievementPct(-20, 100)).toBe(0);
  });

  it("returns 0 when target is 0 (division-by-zero guard)", () => {
    expect(achievementPct(50, 0)).toBe(0);
  });

  it("returns 0 when target is negative", () => {
    expect(achievementPct(50, -10)).toBe(0);
  });
});

describe("overallScore", () => {
  it("weights achievement by KPI weight", () => {
    const score = overallScore([
      { weight: 50, current: 100, target: 100 }, // 100%
      { weight: 50, current: 0, target: 100 }, // 0%
    ]);
    expect(score).toBe(50);
  });

  it("returns 0 for an empty KPI array (not NaN)", () => {
    expect(overallScore([])).toBe(0);
  });

  it("returns 0 when total weight is 0 (not NaN)", () => {
    const score = overallScore([
      { weight: 0, current: 100, target: 100 },
      { weight: 0, current: 50, target: 100 },
    ]);
    expect(score).toBe(0);
  });

  it("still normalizes correctly when weights don't sum to 100", () => {
    // weights sum to 95, both KPIs at 100% achievement -> normalized score is still 100
    const score = overallScore([
      { weight: 75, current: 100, target: 100 },
      { weight: 20, current: 100, target: 100 },
    ]);
    expect(score).toBe(100);
  });

  it("clamps per-KPI achievement before weighting", () => {
    const score = overallScore([{ weight: 100, current: 500, target: 100 }]);
    expect(score).toBe(100);
  });
});

describe("onTrackPct", () => {
  it("computes the on-track ratio", () => {
    const pct = onTrackPct([
      { status: "ON_TRACK" },
      { status: "ON_TRACK" },
      { status: "BEHIND" },
      { status: "AT_RISK" },
    ]);
    expect(pct).toBe(0.5);
  });

  it("returns 0 for an empty array (not NaN)", () => {
    expect(onTrackPct([])).toBe(0);
  });

  it("returns 1 when every KPI is on track (single-status distribution)", () => {
    expect(onTrackPct([{ status: "ON_TRACK" }, { status: "ON_TRACK" }])).toBe(1);
  });
});

describe("atRiskCount", () => {
  it("counts AT_RISK and BEHIND together", () => {
    const count = atRiskCount([
      { status: "AT_RISK" },
      { status: "BEHIND" },
      { status: "ON_TRACK" },
      { status: "NOT_STARTED" },
    ]);
    expect(count).toBe(2);
  });

  it("returns 0 for an empty array", () => {
    expect(atRiskCount([])).toBe(0);
  });
});

describe("categoryBreakdown", () => {
  it("averages achievement per category and zero-fills empty categories", () => {
    const breakdown = categoryBreakdown([
      { category: "SALES", current: 100, target: 100 },
      { category: "SALES", current: 0, target: 100 },
    ]);
    expect(breakdown).toEqual({
      SALES: 50,
      OPERATIONS: 0,
      COMPLIANCE: 0,
      DEVELOPMENT: 0,
    });
  });

  it("returns all-zero for an empty KPI array", () => {
    expect(categoryBreakdown([])).toEqual({
      SALES: 0,
      OPERATIONS: 0,
      COMPLIANCE: 0,
      DEVELOPMENT: 0,
    });
  });
});

describe("statusDistribution", () => {
  it("counts KPIs per status and zero-fills missing statuses", () => {
    const distribution = statusDistribution([
      { status: "ON_TRACK" },
      { status: "ON_TRACK" },
      { status: "BEHIND" },
    ]);
    expect(distribution).toEqual({
      NOT_STARTED: 0,
      ON_TRACK: 2,
      AT_RISK: 0,
      BEHIND: 1,
    });
  });

  it("handles a single-status distribution", () => {
    const distribution = statusDistribution([{ status: "NOT_STARTED" }]);
    expect(distribution).toEqual({
      NOT_STARTED: 1,
      ON_TRACK: 0,
      AT_RISK: 0,
      BEHIND: 0,
    });
  });

  it("returns all-zero for an empty array", () => {
    expect(statusDistribution([])).toEqual({
      NOT_STARTED: 0,
      ON_TRACK: 0,
      AT_RISK: 0,
      BEHIND: 0,
    });
  });
});
