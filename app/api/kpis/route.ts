import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { categorySchema, kpiInputSchema, statusSchema, zodIssues } from "@/lib/validation";

const querySchema = z.object({
  employeeId: z.string().min(1).optional(),
  cycleId: z.string().min(1).optional(),
  category: categorySchema.optional(),
  status: statusSchema.optional(),
});

export async function GET(request: NextRequest) {
  const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
  const cleaned = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== ""));
  const parsed = querySchema.safeParse(cleaned);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid filters", issues: zodIssues(parsed.error) },
      { status: 400 }
    );
  }

  const { employeeId, cycleId, category, status } = parsed.data;

  const kpis = await prisma.kpi.findMany({
    where: {
      ...(employeeId ? { employeeId } : {}),
      ...(cycleId ? { cycleId } : {}),
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
    },
    include: { employee: true, cycle: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(kpis);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = kpiInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid KPI data", issues: zodIssues(parsed.error) },
      { status: 400 }
    );
  }

  const kpi = await prisma.kpi.create({ data: parsed.data, include: { employee: true } });
  return NextResponse.json(kpi, { status: 201 });
}
