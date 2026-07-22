import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCycleId } from "@/lib/cycles";
import { callLLM, httpStatusForLlmError } from "@/lib/llm";
import { atRiskCount, categoryBreakdown, onTrackPct, overallScore } from "@/lib/metrics";
import { executiveInsightsSchema } from "@/lib/ai/schemas";
import { EXECUTIVE_INSIGHTS_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function GET(request: NextRequest) {
  const cycleId = await resolveCycleId(request.nextUrl.searchParams.get("cycleId"));
  if (!cycleId) {
    return NextResponse.json({ cached: null });
  }

  const cached = await prisma.aiInsight.findUnique({
    where: { feature_cycleId: { feature: "EXECUTIVE_INSIGHTS", cycleId } },
  });

  if (!cached) {
    return NextResponse.json({ cached: null });
  }

  return NextResponse.json({ cached: { payload: cached.payload, updatedAt: cached.updatedAt } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const cycleId = await resolveCycleId(typeof body.cycleId === "string" ? body.cycleId : null);

  if (!cycleId) {
    return NextResponse.json(
      { error: "No review cycle to summarize.", code: "MODEL_ERROR" },
      { status: 400 }
    );
  }

  const [cycle, kpis, employees] = await Promise.all([
    prisma.reviewCycle.findUnique({ where: { id: cycleId } }),
    prisma.kpi.findMany({ where: { cycleId } }),
    prisma.employee.findMany(),
  ]);

  if (kpis.length === 0) {
    return NextResponse.json(
      { error: "This cycle has no KPIs to summarize.", code: "MODEL_ERROR" },
      { status: 400 }
    );
  }

  const perEmployee = employees
    .map((employee) => {
      const employeeKpis = kpis.filter((kpi) => kpi.employeeId === employee.id);
      return {
        name: employee.name,
        kpiCount: employeeKpis.length,
        overallScore: Math.round(overallScore(employeeKpis)),
      };
    })
    .filter((employee) => employee.kpiCount > 0);

  const summaryData = {
    cycleName: cycle?.name ?? "this cycle",
    overallScore: Math.round(overallScore(kpis)),
    onTrackPct: Math.round(onTrackPct(kpis) * 100),
    atRiskCount: atRiskCount(kpis),
    totalKpis: kpis.length,
    categoryBreakdown: Object.fromEntries(
      Object.entries(categoryBreakdown(kpis)).map(([category, score]) => [category, Math.round(score)])
    ),
    perEmployee,
  };

  const result = await callLLM({
    system: EXECUTIVE_INSIGHTS_SYSTEM_PROMPT,
    user: `Cycle metrics:\n${JSON.stringify(summaryData)}`,
    schema: executiveInsightsSchema,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.error },
      { status: httpStatusForLlmError(result.error) }
    );
  }

  const saved = await prisma.aiInsight.upsert({
    where: { feature_cycleId: { feature: "EXECUTIVE_INSIGHTS", cycleId } },
    create: { feature: "EXECUTIVE_INSIGHTS", cycleId, payload: result.data },
    update: { payload: result.data },
  });

  return NextResponse.json({ payload: saved.payload, updatedAt: saved.updatedAt });
}
