import { prisma } from "@/lib/prisma";

/** Resolves a cycle id: the given param if present, else the active cycle, else the most recent cycle. */
export async function resolveCycleId(cycleIdParam?: string | null): Promise<string | null> {
  if (cycleIdParam) return cycleIdParam;

  const active = await prisma.reviewCycle.findFirst({
    where: { isActive: true },
    orderBy: { startDate: "desc" },
  });
  if (active) return active.id;

  const latest = await prisma.reviewCycle.findFirst({ orderBy: { startDate: "desc" } });
  return latest?.id ?? null;
}
