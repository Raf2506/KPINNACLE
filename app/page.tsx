"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, FileText, Gauge, ListChecks, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getKpis, getMetrics } from "@/lib/api";
import { buildHighlights } from "@/lib/insights";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { TrendBadge } from "@/components/trend-badge";
import { WelcomeBanner } from "@/components/welcome-banner";
import { CycleSwitcher, useSelectedCycle } from "@/components/cycle-switcher";
import { OverallScoreGauge } from "@/components/charts/overall-score-gauge";
import { StatusDonut } from "@/components/charts/status-donut";
import { CategoryBarChart } from "@/components/charts/category-bar-chart";
import { EmployeeScoreBars } from "@/components/charts/employee-score-bars";
import { NeedsAttentionList } from "@/components/needs-attention-list";
import { HighlightsPanel } from "@/components/highlights-panel";
import { RiskDetectionPanel } from "@/components/risk-detection-panel";
import { ExecutiveInsightsPanel } from "@/components/executive-insights-panel";
import { AiBadge } from "@/components/ai-badge";
import { KpiTable } from "@/components/kpi-table";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPageContent />
    </Suspense>
  );
}

function DashboardPageContent() {
  const { cycles, selectedCycleId } = useSelectedCycle();

  const metricsQuery = useQuery({
    queryKey: ["metrics", selectedCycleId],
    queryFn: () => getMetrics(selectedCycleId),
  });
  const cycleId = metricsQuery.data?.cycle?.id;
  const kpisQuery = useQuery({
    queryKey: ["kpis", { cycleId }],
    queryFn: () => getKpis({ cycleId }),
    enabled: Boolean(cycleId),
  });

  const previousCycleId = useMemo(() => {
    if (!cycleId) return undefined;
    const sorted = [...cycles].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    const index = sorted.findIndex((cycle) => cycle.id === cycleId);
    return index >= 0 ? sorted[index + 1]?.id : undefined;
  }, [cycles, cycleId]);

  const previousMetricsQuery = useQuery({
    queryKey: ["metrics", previousCycleId],
    queryFn: () => getMetrics(previousCycleId),
    enabled: Boolean(previousCycleId),
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
  const previous = previousMetricsQuery.data;
  const highlights = buildHighlights(metrics, kpis);

  const summary = `${metrics.cycle.name} is trending at ${Math.round(metrics.overallScore)}% overall, with ${metrics.atRiskCount} KPI${metrics.atRiskCount === 1 ? "" : "s"} needing attention.`;
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-7">
      <WelcomeBanner summary={summary} dateLabel={dateLabel} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Overview</h2>
          <p className="text-sm text-muted-foreground">
            {metrics.cycle.name} · {metrics.totalEmployees} employees · {metrics.totalKpis} KPIs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5"
            render={<Link href={`/report?cycle=${metrics.cycle.id}`} />}
            nativeButton={false}
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Print report
          </Button>
          <CycleSwitcher />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overall score"
          value={`${Math.round(metrics.overallScore)}%`}
          icon={Gauge}
          hint="Weighted across all KPIs"
          trend={
            previous ? (
              <TrendBadge delta={metrics.overallScore - previous.overallScore} suffix="pts" />
            ) : undefined
          }
        />
        <StatCard
          label="On track"
          value={`${Math.round(metrics.onTrackPct * 100)}%`}
          icon={TrendingUp}
          hint="Share of KPIs on track"
          trend={
            previous ? (
              <TrendBadge
                delta={(metrics.onTrackPct - previous.onTrackPct) * 100}
                suffix="pts"
              />
            ) : undefined
          }
        />
        <StatCard
          label="At risk"
          value={metrics.atRiskCount}
          icon={AlertTriangle}
          hint="At-risk + behind KPIs"
          tone="accent"
          trend={
            previous ? (
              <TrendBadge delta={metrics.atRiskCount - previous.atRiskCount} invert />
            ) : undefined
          }
        />
        <StatCard
          label="Employees"
          value={metrics.totalEmployees}
          icon={Users}
          hint={`${metrics.totalKpis} KPIs tracked`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Needs attention</CardTitle>
            <CardDescription>Lowest-achievement KPIs this cycle</CardDescription>
          </CardHeader>
          <CardContent>
            <NeedsAttentionList kpis={kpis} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
            <CardDescription>Computed from this cycle&apos;s data</CardDescription>
          </CardHeader>
          <CardContent>
            <HighlightsPanel highlights={highlights} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Risk Detection</CardTitle>
              <AiBadge />
            </div>
            <CardDescription>Which KPIs are most likely to slip this cycle, and why</CardDescription>
          </CardHeader>
          <CardContent>
            <RiskDetectionPanel cycleId={metrics.cycle.id} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Executive Summary</CardTitle>
              <AiBadge />
            </div>
            <CardDescription>Plain-language overview and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <ExecutiveInsightsPanel cycleId={metrics.cycle.id} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee leaderboard</CardTitle>
          <CardDescription>Ranked by overall weighted score, this cycle</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeScoreBars employees={metrics.perEmployee} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KPIs</CardTitle>
          <CardDescription>Sort and filter every KPI in this cycle</CardDescription>
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
    <div className="space-y-7">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
      <Skeleton className="h-48" />
      <Skeleton className="h-96" />
    </div>
  );
}
