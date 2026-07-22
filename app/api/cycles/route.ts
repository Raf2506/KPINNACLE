import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cycles = await prisma.reviewCycle.findMany({
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(cycles);
}
