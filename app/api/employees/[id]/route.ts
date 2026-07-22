import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolveCycleId } from "@/lib/cycles";
import { employeeUpdateSchema, zodIssues } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const cycleId = await resolveCycleId(request.nextUrl.searchParams.get("cycleId"));
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { kpis: cycleId ? { where: { cycleId } } : true },
  });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }
  return NextResponse.json(employee);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = employeeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid employee data", issues: zodIssues(parsed.error) },
      { status: 400 }
    );
  }

  try {
    const employee = await prisma.employee.update({ where: { id }, data: parsed.data });
    return NextResponse.json(employee);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  try {
    await prisma.employee.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    throw error;
  }
}
