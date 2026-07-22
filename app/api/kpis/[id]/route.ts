import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { kpiUpdateSchema, zodIssues } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const kpi = await prisma.kpi.findUnique({
    where: { id },
    include: { employee: true, cycle: true },
  });

  if (!kpi) {
    return NextResponse.json({ error: "KPI not found" }, { status: 404 });
  }
  return NextResponse.json(kpi);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = kpiUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid KPI data", issues: zodIssues(parsed.error) },
      { status: 400 }
    );
  }

  try {
    const kpi = await prisma.kpi.update({
      where: { id },
      data: parsed.data,
      include: { employee: true },
    });
    return NextResponse.json(kpi);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "KPI not found" }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  try {
    await prisma.kpi.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "KPI not found" }, { status: 404 });
    }
    throw error;
  }
}
