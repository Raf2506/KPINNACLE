"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Gauge, ListChecks, TrendingUp, Users } from "lucide-react";
import { getKpis, getMetrics } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { OverallScoreGauge } from "@/components/charts/overall-score-gauge";
import { StatusDonut } from "@/components/charts/status-donut";
import { CategoryBarChart } from "@/components/charts/category-bar-chart";
import { EmployeeScoreBars } from "@/components/charts/employee-score-bars";
import { KpiTable } from "@/components/kpi-table";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";

export default function DashboardPage() {
  const metricsQuery = useQuery({ queryKey: ["metrics"], queryFn: () => getMetrics() });
  const cycleId = metricsQuery.data?.cycle?.id;
  const kpisQuery = useQuery({
    queryKey: ["kpis", { cycleId }],
    queryFn: () => getKpis({ cycleId }),
    enabled: Boolean(cycleId),
  });

  if (metricsQuery.isPending) {
    return <DashboardSkeleton />;
  }

  if (metricsQuery.isError) {
    return (
      <ErrorState
        message="Couldn't load dashboard metrics. Check that the server is running and the database is seeded."
        onRetry={() => metricsQuery.refetch()}
      />
    );
  }

  const metrics = metricsQuery.data;

  if (!metrics.cycle || metrics.totalEmployees === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No data yet"
        description="Seed the database with `npm run seed`, or add your first employee to get started."
        actionLabel="Add an employee"
        actionHref="/employees"
      />
    );
  }

  const kpis = kpisQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {metrics.cycle.name} · {metrics.totalEmployees} employees · {metrics.totalKpis} KPIs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overall score"
          value={`${Math.round(metrics.overallScore)}%`}
          icon={Gauge}
          hint="Weighted across all KPIs"
        />
        <StatCard
          label="On track"
          value={`${Math.round(metrics.onTrackPct * 100)}%`}
          icon={TrendingUp}
          hint="Share of KPIs on track"
        />
        <StatCard
          label="At risk"
          value={metrics.atRiskCount}
          icon={AlertTriangle}
          hint="At-risk + behind KPIs"
        />
        <StatCard
          label="Employees"
          value={metrics.totalEmployees}
          icon={Users}
          hint={`${metrics.totalKpis} KPIs tracked`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overall score</CardTitle>
            <CardDescription>Weighted achievement across the company</CardDescription>
          </CardHeader>
          <CardContent>
            <OverallScoreGauge score={metrics.overallScore} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>KPI status</CardTitle>
            <CardDescription>Distribution across all KPIs</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDonut distribution={metrics.statusDistribution} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By category</CardTitle>
            <CardDescription>Average achievement per category</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBarChart breakdown={metrics.categoryBreakdown} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee scores</CardTitle>
          <CardDescription>Overall weighted score per employee, this cycle</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeScoreBars employees={metrics.perEmployee} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KPIs</CardTitle>
          <CardDescription>Sort and filter every KPI in the active cycle</CardDescription>
        </CardHeader>
        <CardContent>
          {kpisQuery.isPending ? (
            <Skeleton className="h-64 w-full" />
          ) : kpisQuery.isError ? (
            <ErrorState message="Couldn't load KPIs." onRetry={() => kpisQuery.refetch()} />
          ) : kpis.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No KPIs yet"
              description="Add KPIs from the KPIs page to see them here."
              actionLabel="Add a KPI"
              actionHref="/kpis"
            />
          ) : (
            <KpiTable kpis={kpis} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
      <Skeleton className="h-48" />
      <Skeleton className="h-96" />
    </div>
  );
}
