import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCycleId } from "@/lib/cycles";
import { employeeInputSchema, zodIssues } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const cycleId = await resolveCycleId(request.nextUrl.searchParams.get("cycleId"));

  const employees = await prisma.employee.findMany({
    orderBy: { name: "asc" },
    include: { kpis: cycleId ? { where: { cycleId } } : true },
  });
  return NextResponse.json(employees);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = employeeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid employee data", issues: zodIssues(parsed.error) },
      { status: 400 }
    );
  }

  const employee = await prisma.employee.create({ data: parsed.data });
  return NextResponse.json(employee, { status: 201 });
}
