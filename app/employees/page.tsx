"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Pencil, Plus, Trash2, Users } from "lucide-react";
import { ApiError, deleteEmployee, getEmployees } from "@/lib/api";
import { overallScore } from "@/lib/metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmployeeFormDialog } from "@/components/employee-form-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ErrorState } from "@/components/error-state";
import { cn } from "@/lib/utils";

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const employeesQuery = useQuery({ queryKey: ["employees"], queryFn: getEmployees });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      toast.success("Employee removed");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : "Couldn't remove employee");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Employees</h1>
          <p className="text-sm text-muted-foreground">
            Manage employees and review their KPI weight totals.
          </p>
        </div>
        <EmployeeFormDialog
          trigger={
            <Button className="cursor-pointer gap-1.5">
              <Plus className="h-4 w-4" />
              Add employee
            </Button>
          }
        />
      </div>

      {employeesQuery.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : employeesQuery.isError ? (
        <ErrorState
          message="Couldn't load employees."
          onRetry={() => employeesQuery.refetch()}
        />
      ) : employeesQuery.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="space-y-1 px-4">
            <h3 className="font-medium text-foreground">No employees yet</h3>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Add your first employee, or run <code>npm run seed</code> for sample data.
            </p>
          </div>
          <EmployeeFormDialog
            trigger={<Button className="mt-2 cursor-pointer">Add employee</Button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employeesQuery.data.map((employee) => {
            const weightSum = employee.kpis.reduce((sum, kpi) => sum + kpi.weight, 0);
            const weightIsOff = employee.kpis.length > 0 && Math.abs(weightSum - 100) > 0.01;
            const score = overallScore(employee.kpis);
            const isDeletingThis =
              deleteMutation.isPending && deleteMutation.variables === employee.id;

            return (
              <Card key={employee.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate">{employee.name}</CardTitle>
                      <CardDescription className="truncate">
                        {employee.role} · {employee.department}
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <EmployeeFormDialog
                        employee={employee}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer"
                            aria-label={`Edit ${employee.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        }
                      />
                      <ConfirmDialog
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer text-destructive hover:text-destructive"
                            aria-label={`Delete ${employee.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        }
                        title={`Delete ${employee.name}?`}
                        description={`This permanently deletes ${employee.name} and all ${employee.kpis.length} of their KPIs. This can't be undone.`}
                        onConfirm={() => deleteMutation.mutateAsync(employee.id)}
                        pending={isDeletingThis}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall score</span>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {employee.kpis.length > 0 ? `${Math.round(score)}%` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">KPIs</span>
                    <span className="font-mono tabular-nums text-foreground">
                      {employee.kpis.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Weight total</span>
                    <span
                      className={cn(
                        "font-mono tabular-nums",
                        weightIsOff ? "text-status-at-risk" : "text-foreground"
                      )}
                    >
                      {weightSum}%
                    </span>
                  </div>
                  {weightIsOff && (
                    <Badge
                      variant="outline"
                      className="w-fit gap-1.5 border-status-at-risk/40 bg-status-at-risk/10 text-status-at-risk"
                    >
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      Weights should sum to 100%
                    </Badge>
                  )}
                  <Link
                    href={`/kpis?employee=${employee.id}`}
                    className="mt-auto pt-1 text-sm font-medium text-primary hover:underline"
                  >
                    View KPIs →
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
