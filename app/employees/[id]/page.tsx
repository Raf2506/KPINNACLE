"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Gauge, ListChecks, TrendingUp, AlertTriangle, Users } from "lucide-react";
import { ApiError, getEmployee } from "@/lib/api";
import { atRiskCount, onTrackPct, overallScore, statusDistribution } from "@/lib/metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { AvatarInitials } from "@/components/avatar-initials";
import { CycleSwitcher, useSelectedCycle } from "@/components/cycle-switcher";
import { StatusDonut } from "@/components/charts/status-donut";
import { KpiTable } from "@/components/kpi-table";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<EmployeeDetailSkeleton />}>
      <EmployeeDetailContent id={id} />
    </Suspense>
  );
}

function EmployeeDetailContent({ id }: { id: string }) {
  const { selectedCycleId } = useSelectedCycle();
  const employeeQuery = useQuery({
    queryKey: ["employee", id, selectedCycleId],
    queryFn: () => getEmployee(id, selectedCycleId),
  });

  const backLink = (
    <Link
      href="/employees"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
      Back to employees
    </Link>
  );

  if (employeeQuery.isPending) {
    return <EmployeeDetailSkeleton />;
  }

  if (employeeQuery.isError) {
    const notFound = employeeQuery.error instanceof ApiError && employeeQuery.error.status === 404;
    return (
      <div className="space-y-6">
        {backLink}
        {notFound ? (
          <EmptyState
            icon={Users}
            title="Employee not found"
            description="This employee may have been removed."
            actionLabel="Back to employees"
            actionHref="/employees"
          />
        ) : (
          <ErrorState message="Couldn't load this employee." onRetry={() => employeeQuery.refetch()} />
        )}
      </div>
    );
  }

  const employee = employeeQuery.data;
  const kpis = employee.kpis;
  const score = overallScore(kpis);
  const onTrack = onTrackPct(kpis);
  const atRisk = atRiskCount(kpis);
  const distribution = statusDistribution(kpis);

  return (
    <div className="space-y-7">
      {backLink}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <AvatarInitials name={employee.name} className="size-14 text-lg" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {employee.name}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {employee.role} · {employee.department}
            </p>
          </div>
        </div>
        <CycleSwitcher />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overall score"
          value={kpis.length > 0 ? `${Math.round(score)}%` : "—"}
          icon={Gauge}
          hint="Weighted across their KPIs"
        />
        <StatCard
          label="On track"
          value={kpis.length > 0 ? `${Math.round(onTrack * 100)}%` : "—"}
          icon={TrendingUp}
          hint="Share of KPIs on track"
        />
        <StatCard
          label="At risk"
          value={atRisk}
          icon={AlertTriangle}
          hint="At-risk + behind KPIs"
          tone="accent"
        />
        <StatCard label="KPIs" value={kpis.length} icon={ListChecks} hint="Tracked this cycle" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>KPI status</CardTitle>
            <CardDescription>This employee, this cycle</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDonut distribution={distribution} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>KPIs</CardTitle>
            <CardDescription>Read-only — manage from the KPIs page</CardDescription>
          </CardHeader>
          <CardContent>
            {kpis.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="No KPIs in this cycle"
                description="Add one from the KPIs page."
                actionLabel="Add a KPI"
                actionHref={`/kpis?employee=${employee.id}`}
              />
            ) : (
              <KpiTable kpis={kpis} showEmployeeColumn={false} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmployeeDetailSkeleton() {
  return (
    <div className="space-y-7">
      <Skeleton className="h-5 w-36" />
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
