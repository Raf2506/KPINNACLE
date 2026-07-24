"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListChecks, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { ApiError, deleteKpi, getKpis } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiTable } from "@/components/kpi-table";
import { KpiFormDialog } from "@/components/kpi-form-dialog";
import { KpiGeneratorDialog } from "@/components/kpi-generator-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { KpiTipsCallout } from "@/components/kpi-tips-callout";
import type { Kpi } from "@/lib/types";

export default function KpisPage() {
  return (
    <Suspense fallback={<KpisSkeleton />}>
      <KpisPageContent />
    </Suspense>
  );
}

function KpisPageContent() {
  const searchParams = useSearchParams();
  const defaultEmployeeId = searchParams.get("employee") ?? undefined;
  const queryClient = useQueryClient();

  const kpisQuery = useQuery({ queryKey: ["kpis"], queryFn: () => getKpis() });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteKpi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("KPI removed");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : "Couldn't remove KPI");
    },
  });

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">KPIs</h1>
          <p className="text-sm text-muted-foreground">
            Manage every KPI across employees, categories, and statuses.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <KpiGeneratorDialog
            defaultEmployeeId={defaultEmployeeId}
            trigger={
              <Button variant="outline" className="cursor-pointer gap-1.5 rounded-full px-4">
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            }
          />
          <KpiFormDialog
            defaultEmployeeId={defaultEmployeeId}
            trigger={
              <Button className="cursor-pointer gap-1.5 rounded-full px-4">
                <Plus className="h-4 w-4" />
                Add KPI
              </Button>
            }
          />
        </div>
      </div>

      <KpiTipsCallout />

      <Card>
        <CardContent>
          {kpisQuery.isPending ? (
            <Skeleton className="h-64 w-full" />
          ) : kpisQuery.isError ? (
            <ErrorState message="Couldn't load KPIs." onRetry={() => kpisQuery.refetch()} />
          ) : kpisQuery.data.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No KPIs yet"
              description="Add your first KPI above, or run `npm run seed` for sample data."
            />
          ) : (
            <KpiTable
              kpis={kpisQuery.data}
              defaultEmployeeId={defaultEmployeeId}
              renderActions={(kpi: Kpi) => (
                <div className="flex justify-end gap-1">
                  <KpiFormDialog
                    kpi={kpi}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="cursor-pointer"
                        aria-label={`Edit ${kpi.title}`}
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
                        aria-label={`Delete ${kpi.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                    title={`Delete "${kpi.title}"?`}
                    description="This permanently removes this KPI. This can't be undone."
                    onConfirm={() => deleteMutation.mutateAsync(kpi.id)}
                    pending={deleteMutation.isPending && deleteMutation.variables === kpi.id}
                  />
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KpisSkeleton() {
  return (
    <div className="space-y-7">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
