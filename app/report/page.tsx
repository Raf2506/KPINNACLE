"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Gauge, Info, Printer, TriangleAlert, Users } from "lucide-react";
import { getCachedExecutiveInsights, getKpis, getMetrics } from "@/lib/api";
import { buildHighlights } from "@/lib/insights";
import { achievementPct } from "@/lib/metrics";
import { useSelectedCycle } from "@/components/cycle-switcher";
import { AiBadge } from "@/components/ai-badge";
import { AvatarInitials } from "@/components/avatar-initials";
import { StatusBadge } from "@/components/status-badge";
import { CategoryBadge } from "@/components/category-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import type { InsightSeverity } from "@/lib/ai/schemas";
import type { Category } from "@/lib/types";

const SEVERITY_ICON: Record<InsightSeverity, typeof Info> = {
  critical: TriangleAlert,
  warning: AlertTriangle,
  info: Info,
};

const SEVERITY_STYLE: Record<InsightSeverity, string> = {
  critical: "border-status-behind/30 bg-status-behind/10 text-status-behind",
  warning: "border-status-at-risk/30 bg-status-at-risk/10 text-status-at-risk",
  info: "border-primary/20 bg-primary/5 text-primary",
};

export default function ReportPage() {
  return (
    <Suspense fallback={<ReportSkeleton />}>
      <ReportPageContent />
    </Suspense>
  );
}

function ReportPageContent() {
  const { selectedCycleId } = useSelectedCycle();

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

  const insightsQuery = useQuery({
    queryKey: ["ai-insights", cycleId],
    queryFn: () => getCachedExecutiveInsights(cycleId),
    enabled: Boolean(cycleId),
  });

  if (metricsQuery.isPending) {
    return <ReportSkeleton />;
  }

  if (metricsQuery.isError) {
    return (
      <ErrorState
        message="Couldn't load this cycle's data for the report."
        onRetry={() => metricsQuery.refetch()}
      />
    );
  }

  const metrics = metricsQuery.data;

  if (!metrics.cycle) {
    return (
      <EmptyState
        icon={Users}
        title="No review cycle to report on"
        description="Seed the database or select a review cycle from the dashboard first."
        actionLabel="Back to dashboard"
        actionHref="/"
      />
    );
  }

  const kpis = kpisQuery.data ?? [];
  const highlights = buildHighlights(metrics, kpis);
  const insights = insightsQuery.data?.cached ?? null;

  const needsAttention = [...kpis]
    .map((kpi) => ({ kpi, achievement: achievementPct(kpi.current, kpi.target) }))
    .sort((a, b) => a.achievement - b.achievement)
    .slice(0, 8);

  const leaderboard = [...metrics.perEmployee]
    .filter((employee) => employee.kpiCount > 0)
    .sort((a, b) => b.overallScore - a.overallScore);

  const categoryEntries = Object.entries(metrics.categoryBreakdown) as [Category, number][];

  const generatedOn = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const cycleRange = `${new Date(metrics.cycle.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} – ${new Date(metrics.cycle.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16 print:max-w-none print:space-y-6">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer gap-1.5"
          render={<Link href="/" />}
          nativeButton={false}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to dashboard
        </Button>
        <Button size="sm" className="cursor-pointer gap-1.5" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" aria-hidden="true" />
          Print / Save as PDF
        </Button>
      </div>

      <header className="space-y-1 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Gauge className="h-4 w-4" aria-hidden="true" />
          KPINNACLE
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Performance Report</h1>
        <p className="text-sm text-muted-foreground">
          {metrics.cycle.name} · {cycleRange}
        </p>
        <p className="text-xs text-muted-foreground">Generated {generatedOn}</p>
      </header>

      <section aria-labelledby="report-summary">
        <h2 id="report-summary" className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground">
          Executive summary
          <AiBadge />
        </h2>
        {insights ? (
          <div className="space-y-4">
            <p className="text-sm text-foreground">{insights.payload.overallAssessment}</p>
            {insights.payload.highlights.length > 0 && (
              <ul className="space-y-2">
                {insights.payload.highlights.map((highlight, index) => {
                  const Icon = SEVERITY_ICON[highlight.severity] ?? Info;
                  return (
                    <li
                      key={index}
                      className={cn(
                        "flex items-start gap-2.5 rounded-lg border p-3 text-sm print:border-border print:bg-transparent print:text-foreground",
                        SEVERITY_STYLE[highlight.severity] ?? SEVERITY_STYLE.info
                      )}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="font-medium">{highlight.title}</p>
                        <p className="opacity-90">{highlight.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            {insights.payload.recommendations.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Recommendations
                </p>
                <ul className="space-y-1 text-sm text-foreground">
                  {insights.payload.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No AI executive summary has been generated for this cycle yet. Generate one from the
            dashboard to include it here.
          </p>
        )}
      </section>

      <section aria-labelledby="report-stats">
        <h2 id="report-stats" className="mb-3 text-base font-semibold text-foreground">
          Key numbers
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4">
          <ReportStat label="Overall score" value={`${Math.round(metrics.overallScore)}%`} />
          <ReportStat label="On track" value={`${Math.round(metrics.onTrackPct * 100)}%`} />
          <ReportStat label="At risk" value={String(metrics.atRiskCount)} />
          <ReportStat label="Employees" value={String(metrics.totalEmployees)} />
        </div>
      </section>

      <section aria-labelledby="report-categories">
        <h2 id="report-categories" className="mb-3 text-base font-semibold text-foreground">
          Average achievement by category
        </h2>
        <table className="w-full border-collapse text-sm">
          <tbody>
            {categoryEntries.map(([category, score]) => (
              <tr key={category} className="border-b border-border last:border-0">
                <td className="py-2 pr-4">
                  <CategoryBadge category={category} />
                </td>
                <td className="py-2 text-right font-mono tabular-nums text-foreground">
                  {Math.round(score)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-labelledby="report-highlights">
        <h2 id="report-highlights" className="mb-3 text-base font-semibold text-foreground">
          Highlights
        </h2>
        {highlights.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing notable this cycle.</p>
        ) : (
          <ul className="space-y-1.5 text-sm text-foreground">
            {highlights.map((highlight) => (
              <li key={highlight.id} className="flex items-start gap-2">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
                {highlight.text}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="report-attention" className="break-inside-avoid">
        <h2 id="report-attention" className="mb-3 text-base font-semibold text-foreground">
          Needs attention
        </h2>
        {needsAttention.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing needs attention right now.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">KPI</th>
                <th className="py-2 pr-3 font-medium">Employee</th>
                <th className="py-2 pr-3 font-medium">Achievement</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {needsAttention.map(({ kpi, achievement }) => (
                <tr key={kpi.id} className="border-b border-border last:border-0">
                  <td className="py-2 pr-3 text-foreground">{kpi.title}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{kpi.employee?.name ?? "—"}</td>
                  <td className="py-2 pr-3 font-mono tabular-nums text-foreground">
                    {Math.round(achievement)}%
                  </td>
                  <td className="py-2">
                    <StatusBadge status={kpi.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section aria-labelledby="report-leaderboard" className="break-inside-avoid">
        <h2 id="report-leaderboard" className="mb-3 text-base font-semibold text-foreground">
          Employee leaderboard
        </h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-2 pr-3 font-medium">#</th>
              <th className="py-2 pr-3 font-medium">Employee</th>
              <th className="py-2 pr-3 font-medium">Role</th>
              <th className="py-2 pr-3 font-medium">Overall score</th>
              <th className="py-2 font-medium">At risk</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((employee, index) => (
              <tr key={employee.employeeId} className="border-b border-border last:border-0">
                <td className="py-2 pr-3 text-muted-foreground">{index + 1}</td>
                <td className="py-2 pr-3">
                  <span className="flex items-center gap-2 text-foreground">
                    <AvatarInitials name={employee.name} className="size-6 text-[10px] print:hidden" />
                    {employee.name}
                  </span>
                </td>
                <td className="py-2 pr-3 text-muted-foreground">{employee.role}</td>
                <td className="py-2 pr-3 font-mono tabular-nums text-foreground">
                  {Math.round(employee.overallScore)}%
                </td>
                <td className="py-2 font-mono tabular-nums text-muted-foreground">
                  {employee.atRiskCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="border-t border-border pt-4 text-xs text-muted-foreground">
        Generated by KPINNACLE. Sections marked <span className="font-medium">AI</span> are
        model-generated and grounded in this cycle&apos;s data — everything else is computed
        directly from KPI records.
      </footer>
    </div>
  );
}

function ReportStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
