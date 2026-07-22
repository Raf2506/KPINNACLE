"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { getCycles } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReviewCycle } from "@/lib/types";

/** Resolves which cycle is "selected" from the `?cycle=` URL param, falling back to the active cycle. */
export function useSelectedCycle() {
  const searchParams = useSearchParams();
  const cyclesQuery = useQuery({ queryKey: ["cycles"], queryFn: getCycles });

  const cycles: ReviewCycle[] = cyclesQuery.data ?? [];
  const param = searchParams.get("cycle");
  const selectedCycleId =
    param && cycles.some((cycle) => cycle.id === param)
      ? param
      : (cycles.find((cycle) => cycle.isActive)?.id ?? cycles[0]?.id);

  return { cycles, cyclesQuery, selectedCycleId };
}

export function CycleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cycles, cyclesQuery, selectedCycleId } = useSelectedCycle();

  if (cyclesQuery.isPending) {
    return <Skeleton className="h-8 w-full sm:w-56" />;
  }

  if (cycles.length <= 1) {
    return null;
  }

  function handleChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("cycle", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const items = Object.fromEntries(
    cycles.map((cycle) => [cycle.id, `${cycle.name}${cycle.isActive ? " · Active" : ""}`])
  );

  return (
    <Select value={selectedCycleId} onValueChange={handleChange} items={items}>
      <SelectTrigger className="w-full gap-1.5 sm:w-56" aria-label="Review cycle">
        <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <SelectValue placeholder="Select cycle" />
      </SelectTrigger>
      <SelectContent>
        {cycles.map((cycle) => (
          <SelectItem key={cycle.id} value={cycle.id}>
            {cycle.name}
            {cycle.isActive ? " · Active" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
