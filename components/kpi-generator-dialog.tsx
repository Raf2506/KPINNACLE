"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiBadge } from "@/components/ai-badge";
import { CategoryBadge } from "@/components/category-badge";
import { aiErrorMessage } from "@/lib/ai/error-messages";
import { createKpi, generateKpiSuggestions, getCycles, getEmployees } from "@/lib/api";
import { formatUnitValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { KpiSuggestion } from "@/lib/ai/schemas";

export function KpiGeneratorDialog({
  defaultEmployeeId,
  trigger,
}: {
  defaultEmployeeId?: string;
  trigger: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId ?? "");
  const [context, setContext] = useState("");
  const [suggestions, setSuggestions] = useState<KpiSuggestion[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: () => getEmployees(),
    enabled: open,
  });
  const cyclesQuery = useQuery({ queryKey: ["cycles"], queryFn: getCycles, enabled: open });
  const activeCycleId = cyclesQuery.data?.find((c) => c.isActive)?.id ?? cyclesQuery.data?.[0]?.id;
  const employees = employeesQuery.data ?? [];

  useEffect(() => {
    if (open) {
      setEmployeeId(defaultEmployeeId ?? "");
      setContext("");
      setSuggestions(null);
      setSelected(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const generateMutation = useMutation({
    mutationFn: () => generateKpiSuggestions(employeeId, context),
    onSuccess: (result) => {
      setSuggestions(result.suggestions);
      setSelected(new Set(result.suggestions.map((_, index) => index)));
    },
    onError: (error) => {
      toast.error(aiErrorMessage(error));
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!activeCycleId) throw new Error("No active review cycle to add KPIs to.");
      const toApply = (suggestions ?? []).filter((_, index) => selected.has(index));
      await Promise.all(
        toApply.map((suggestion) =>
          createKpi({
            title: suggestion.title,
            description: suggestion.description,
            category: suggestion.category,
            weight: suggestion.weight,
            target: suggestion.target,
            current: 0,
            unit: suggestion.unit,
            status: "NOT_STARTED",
            employeeId,
            cycleId: activeCycleId,
            aiGenerated: true,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success(`Added ${selected.size} KPI${selected.size === 1 ? "" : "s"}`);
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Couldn't apply suggestions");
    },
  });

  function toggleSelected(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            AI KPI Generator
            <AiBadge />
          </DialogTitle>
          <DialogDescription>
            Suggests 4-6 KPIs for an employee based on their role and any context you provide.
          </DialogDescription>
        </DialogHeader>

        {!suggestions ? (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              generateMutation.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="generator-employee">Employee</Label>
              <Select
                value={employeeId}
                onValueChange={(value) => setEmployeeId(value ?? "")}
                items={Object.fromEntries(employees.map((employee) => [employee.id, employee.name]))}
              >
                <SelectTrigger id="generator-employee" className="w-full">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="generator-context">Context (optional)</Label>
              <Textarea
                id="generator-context"
                value={context}
                onChange={(event) => setContext(event.target.value)}
                placeholder="e.g. Focus areas for next quarter, recent projects, growth goals..."
                rows={3}
              />
            </div>

            {generateMutation.isError && (
              <p className="text-xs text-destructive">{aiErrorMessage(generateMutation.error)}</p>
            )}

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <Button
                type="submit"
                disabled={!employeeId || generateMutation.isPending}
                className="cursor-pointer gap-1.5"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                )}
                {generateMutation.isPending ? "Generating..." : "Generate"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            {suggestions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No suggestions came back. Try adding more context and generating again.
              </p>
            ) : (
              <ul className="max-h-[360px] space-y-2 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                      selected.has(index) ? "border-primary/40 bg-primary/5" : "border-border"
                    )}
                  >
                    <Checkbox
                      checked={selected.has(index)}
                      onCheckedChange={() => toggleSelected(index)}
                      className="mt-0.5"
                      aria-label={`Include ${suggestion.title}`}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{suggestion.title}</p>
                        <AiBadge />
                      </div>
                      <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs">
                        <CategoryBadge category={suggestion.category} />
                        <span className="text-muted-foreground">
                          Target:{" "}
                          <span className="font-mono text-foreground">
                            {formatUnitValue(suggestion.target, suggestion.unit)}
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          Weight:{" "}
                          <span className="font-mono text-foreground">{Math.round(suggestion.weight)}%</span>
                        </span>
                      </div>
                      {suggestion.rationale && (
                        <p className="border-t border-border pt-1 text-xs text-muted-foreground italic">
                          {suggestion.rationale}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <DialogFooter className="sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => setSuggestions(null)} className="cursor-pointer">
                Back
              </Button>
              <Button
                type="button"
                onClick={() => applyMutation.mutate()}
                disabled={selected.size === 0 || applyMutation.isPending}
                className="cursor-pointer"
              >
                {applyMutation.isPending ? "Applying..." : `Apply selected (${selected.size})`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
