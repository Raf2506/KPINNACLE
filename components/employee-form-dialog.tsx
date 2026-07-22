"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ApiError, createEmployee, updateEmployee } from "@/lib/api";
import type { Employee } from "@/lib/types";

interface FormState {
  name: string;
  role: string;
  department: string;
}

const EMPTY_FORM: FormState = { name: "", role: "", department: "" };

export function EmployeeFormDialog({
  employee,
  trigger,
}: {
  employee?: Employee;
  trigger: React.ReactElement;
}) {
  const isEdit = Boolean(employee);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(
        employee
          ? { name: employee.name, role: employee.role, department: employee.department }
          : EMPTY_FORM
      );
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      isEdit && employee ? updateEmployee(employee.id, form) : createEmployee(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      toast.success(isEdit ? "Employee updated" : "Employee added");
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit employee" : "Add employee"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this employee's details."
              : "Add a new employee to track KPIs against."}
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
            <Label htmlFor="employee-name">Name</Label>
            <Input
              id="employee-name"
              value={form.name}
              onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
              aria-invalid={Boolean(errors.name)}
              autoFocus
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="employee-role">Role</Label>
            <Input
              id="employee-role"
              value={form.role}
              onChange={(event) => setForm((f) => ({ ...f, role: event.target.value }))}
              aria-invalid={Boolean(errors.role)}
              placeholder="e.g. Sales Executive"
            />
            {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="employee-department">Department</Label>
            <Input
              id="employee-department"
              value={form.department}
              onChange={(event) => setForm((f) => ({ ...f, department: event.target.value }))}
              aria-invalid={Boolean(errors.department)}
              placeholder="e.g. Sales"
            />
            {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={mutation.isPending} className="cursor-pointer">
              {mutation.isPending ? "Saving..." : isEdit ? "Save changes" : "Add employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
