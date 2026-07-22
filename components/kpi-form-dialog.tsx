"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, createKpi, getCycles, getEmployees, updateKpi } from "@/lib/api";
import { CATEGORIES, STATUSES } from "@/lib/metrics";
import { CATEGORY_LABEL } from "@/components/category-badge";
import { STATUS_LABEL } from "@/components/status-badge";
import type { Kpi } from "@/lib/types";

const UNITS = ["RM", "%", "count"] as const;

interface FormState {
  title: string;
  description: string;
  category: string;
  weight: string;
  target: string;
  current: string;
  unit: string;
  status: string;
  employeeId: string;
}

function toFormState(kpi: Kpi | undefined, defaultEmployeeId?: string): FormState {
  return {
    title: kpi?.title ?? "",
    description: kpi?.description ?? "",
    category: kpi?.category ?? "SALES",
    weight: kpi ? String(kpi.weight) : "",
    target: kpi ? String(kpi.target) : "",
    current: kpi ? String(kpi.current) : "",
    unit: kpi?.unit ?? "%",
    status: kpi?.status ?? "NOT_STARTED",
    employeeId: kpi?.employeeId ?? defaultEmployeeId ?? "",
  };
}

export function KpiFormDialog({
  kpi,
  trigger,
  defaultEmployeeId,
}: {
  kpi?: Kpi;
  trigger: React.ReactElement;
  defaultEmployeeId?: string;
}) {
  const isEdit = Boolean(kpi);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
    enabled: open,
  });
  const cyclesQuery = useQuery({ queryKey: ["cycles"], queryFn: getCycles, enabled: open });
  const activeCycleId = cyclesQuery.data?.find((c) => c.isActive)?.id ?? cyclesQuery.data?.[0]?.id;

  const [form, setForm] = useState<FormState>(() => toFormState(kpi, defaultEmployeeId));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(toFormState(kpi, defaultEmployeeId));
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const resolvedCycleId = kpi?.cycleId ?? activeCycleId;

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category as Kpi["category"],
        weight: Number(form.weight),
        target: Number(form.target),
        current: Number(form.current),
        unit: form.unit,
        status: form.status as Kpi["status"],
        employeeId: form.employeeId,
        cycleId: resolvedCycleId ?? "",
      };
      return isEdit && kpi ? updateKpi(kpi.id, payload) : createKpi(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success(isEdit ? "KPI updated" : "KPI added");
      setOpen(false);
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError && error.issues) {
        const fieldErrors =
          (error.issues as { fieldErrors?: Record<string, string[]> }).fieldErrors ?? {};
        setErrors(
          Object.fromEntries(
            Object.entries(fieldErrors).map(([key, messages]) => [key, messages?.[0]])
          )
        );
      } else {
        toast.error(error instanceof Error ? error.message : "Something went wrong");
      }
    },
  });

  const employees = employeesQuery.data ?? [];
  const noActiveCycle = open && !cyclesQuery.isPending && !resolvedCycleId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit KPI" : "Add KPI"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this KPI's targets and status." : "Add a new KPI for an employee."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="kpi-title">Title</Label>
            <Input
              id="kpi-title"
              value={form.title}
              onChange={(event) => setForm((f) => ({ ...f, title: event.target.value }))}
              aria-invalid={Boolean(errors.title)}
              autoFocus
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kpi-description">Description</Label>
            <Textarea
              id="kpi-description"
              value={form.description}
              onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))}
              aria-invalid={Boolean(errors.description)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="kpi-employee">Employee</Label>
              <Select
                value={form.employeeId}
                onValueChange={(value) => setForm((f) => ({ ...f, employeeId: value ?? "" }))}
              >
                <SelectTrigger id="kpi-employee" className="w-full" aria-invalid={Boolean(errors.employeeId)}>
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
              {errors.employeeId && <p className="text-xs text-destructive">{errors.employeeId}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kpi-category">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm((f) => ({ ...f, category: value ?? f.category }))}
              >
                <SelectTrigger id="kpi-category" className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {CATEGORY_LABEL[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="kpi-current">Current</Label>
              <Input
                id="kpi-current"
                type="number"
                step="any"
                value={form.current}
                onChange={(event) => setForm((f) => ({ ...f, current: event.target.value }))}
                aria-invalid={Boolean(errors.current)}
              />
              {errors.current && <p className="text-xs text-destructive">{errors.current}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kpi-target">Target</Label>
              <Input
                id="kpi-target"
                type="number"
                step="any"
                value={form.target}
                onChange={(event) => setForm((f) => ({ ...f, target: event.target.value }))}
                aria-invalid={Boolean(errors.target)}
              />
              {errors.target && <p className="text-xs text-destructive">{errors.target}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kpi-unit">Unit</Label>
              <Select value={form.unit} onValueChange={(value) => setForm((f) => ({ ...f, unit: value ?? f.unit }))}>
                <SelectTrigger id="kpi-unit" className="w-full">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="kpi-weight">Weight (%)</Label>
              <Input
                id="kpi-weight"
                type="number"
                step="any"
                min={0}
                max={100}
                value={form.weight}
                onChange={(event) => setForm((f) => ({ ...f, weight: event.target.value }))}
                aria-invalid={Boolean(errors.weight)}
              />
              {errors.weight && <p className="text-xs text-destructive">{errors.weight}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kpi-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm((f) => ({ ...f, status: value ?? f.status }))}
              >
                <SelectTrigger id="kpi-status" className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABEL[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {noActiveCycle && (
            <p className="text-xs text-destructive">
              No review cycle exists yet — run <code>npm run seed</code> or create one before adding
              KPIs.
            </p>
          )}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button
              type="submit"
              disabled={mutation.isPending || !form.employeeId || Boolean(noActiveCycle)}
              className="cursor-pointer"
            >
              {mutation.isPending ? "Saving..." : isEdit ? "Save changes" : "Add KPI"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
