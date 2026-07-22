import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCycleId } from "@/lib/cycles";
import { callLLM, httpStatusForLlmError } from "@/lib/llm";
import { achievementPct } from "@/lib/metrics";
import { riskDetectionSchema } from "@/lib/ai/schemas";
import { RISK_DETECTION_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function GET(request: NextRequest) {
  const cycleId = await resolveCycleId(request.nextUrl.searchParams.get("cycleId"));
  if (!cycleId) {
    return NextResponse.json({ cached: null });
  }

  const cached = await prisma.aiInsight.findUnique({
    where: { feature_cycleId: { feature: "RISK_DETECTION", cycleId } },
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
      { error: "No review cycle to analyze.", code: "MODEL_ERROR" },
      { status: 400 }
    );
  }

  const kpis = await prisma.kpi.findMany({
    where: { cycleId },
    include: { employee: true },
  });

  if (kpis.length === 0) {
    return NextResponse.json(
      { error: "This cycle has no KPIs to analyze.", code: "MODEL_ERROR" },
      { status: 400 }
    );
  }

  const dataset = kpis.map((kpi) => ({
    kpiId: kpi.id,
    employeeName: kpi.employee.name,
    title: kpi.title,
    category: kpi.category,
    weight: kpi.weight,
    achievementPct: Math.round(achievementPct(kpi.current, kpi.target)),
    status: kpi.status,
  }));

  const result = await callLLM({
    system: RISK_DETECTION_SYSTEM_PROMPT,
    user: `KPI data for this review cycle:\n${JSON.stringify(dataset)}`,
    schema: riskDetectionSchema,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.error },
      { status: httpStatusForLlmError(result.error) }
    );
  }

  // Hallucination guard: drop any risk referencing a kpiId that doesn't exist in this cycle.
  const validKpiIds = new Set(kpis.map((kpi) => kpi.id));
  const guarded = {
    ...result.data,
    risks: result.data.risks.filter((risk) => validKpiIds.has(risk.kpiId)),
  };

  const saved = await prisma.aiInsight.upsert({
    where: { feature_cycleId: { feature: "RISK_DETECTION", cycleId } },
    create: { feature: "RISK_DETECTION", cycleId, payload: guarded },
    update: { payload: guarded },
  });

  return NextResponse.json({ payload: saved.payload, updatedAt: saved.updatedAt });
}
