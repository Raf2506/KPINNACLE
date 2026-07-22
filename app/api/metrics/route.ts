import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  atRiskCount,
  categoryBreakdown,
  onTrackPct,
  overallScore,
  statusDistribution,
} from "@/lib/metrics";

export async function GET(request: NextRequest) {
  const cycleIdParam = request.nextUrl.searchParams.get("cycleId");

  const cycle = cycleIdParam
    ? await prisma.reviewCycle.findUnique({ where: { id: cycleIdParam } })
    : await prisma.reviewCycle.findFirst({
        where: { isActive: true },
        orderBy: { startDate: "desc" },
      });

  if (!cycle) {
    return NextResponse.json({
      cycle: null,
      overallScore: 0,
      onTrackPct: 0,
      atRiskCount: 0,
      totalKpis: 0,
      totalEmployees: 0,
      categoryBreakdown: categoryBreakdown([]),
      statusDistribution: statusDistribution([]),
      perEmployee: [],
    });
  }

  const [kpis, employees] = await Promise.all([
    prisma.kpi.findMany({ where: { cycleId: cycle.id } }),
    prisma.employee.findMany({ orderBy: { name: "asc" } }),
  ]);

  const perEmployee = employees.map((employee) => {
    const employeeKpis = kpis.filter((kpi) => kpi.employeeId === employee.id);
    return {
      employeeId: employee.id,
      name: employee.name,
      role: employee.role,
      department: employee.department,
      kpiCount: employeeKpis.length,
      overallScore: overallScore(employeeKpis),
      onTrackPct: onTrackPct(employeeKpis),
      atRiskCount: atRiskCount(employeeKpis),
    };
  });

  return NextResponse.json({
    cycle: {
      id: cycle.id,
      name: cycle.name,
      startDate: cycle.startDate,
      endDate: cycle.endDate,
      isActive: cycle.isActive,
    },
    overallScore: overallScore(kpis),
    onTrackPct: onTrackPct(kpis),
    atRiskCount: atRiskCount(kpis),
    totalKpis: kpis.length,
    totalEmployees: employees.length,
    categoryBreakdown: categoryBreakdown(kpis),
    statusDistribution: statusDistribution(kpis),
    perEmployee,
  });
}
