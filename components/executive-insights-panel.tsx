"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Info, RefreshCw, Sparkles, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { generateExecutiveInsights, getCachedExecutiveInsights } from "@/lib/api";
import { aiErrorMessage } from "@/lib/ai/error-messages";
import { formatRelativeTime } from "@/lib/format";
import { AiBadge } from "@/components/ai-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";
import { cn } from "@/lib/utils";
import type { InsightSeverity } from "@/lib/ai/schemas";

const SEVERITY_STYLE: Record<InsightSeverity, string> = {
  critical: "border-status-behind/30 bg-status-behind/10 text-status-behind",
  warning: "border-status-at-risk/30 bg-status-at-risk/10 text-status-at-risk",
  info: "border-primary/20 bg-primary/5 text-primary",
};

const SEVERITY_ICON: Record<InsightSeverity, typeof Info> = {
  critical: TriangleAlert,
  warning: AlertTriangle,
  info: Info,
};

export function ExecutiveInsightsPanel({ cycleId }: { cycleId?: string }) {
  const queryClient = useQueryClient();

  const cachedQuery = useQuery({
    queryKey: ["ai-insights", cycleId],
    queryFn: () => getCachedExecutiveInsights(cycleId),
  });

  const mutation = useMutation({
    mutationFn: () => generateExecutiveInsights(cycleId),
    onSuccess: (result) => {
      queryClient.setQueryData(["ai-insights", cycleId], { cached: result });
      toast.success("Executive summary updated");
    },
    onError: (error) => {
      toast.error(aiErrorMessage(error));
    },
  });

  if (cachedQuery.isPending) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (cachedQuery.isError) {
    return (
      <ErrorState message={aiErrorMessage(cachedQuery.error)} onRetry={() => cachedQuery.refetch()} />
    );
  }

  const cached = cachedQuery.data.cached;

  if (mutation.isError && !cached) {
    return <ErrorState message={aiErrorMessage(mutation.error)} onRetry={() => mutation.mutate()} />;
  }

  if (!cached) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <AiBadge />
        <p className="max-w-sm text-sm text-muted-foreground">
          No executive summary yet for this cycle. Generate one for a plain-language overview
          and recommended next steps.
        </p>
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="cursor-pointer gap-1.5"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {mutation.isPending ? "Summarizing..." : "Generate summary"}
        </Button>
      </div>
    );
  }

  const data = cached.payload;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AiBadge />
          <span className="text-xs text-muted-foreground">
            Generated {formatRelativeTime(cached.updatedAt)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="cursor-pointer gap-1.5"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", mutation.isPending && "animate-spin")}
            aria-hidden="true"
          />
          Regenerate
        </Button>
      </div>

      {data.overallAssessment && <p className="text-sm text-foreground">{data.overallAssessment}</p>}

      {data.highlights.length > 0 && (
        <ul className="space-y-2">
          {data.highlights.map((highlight, index) => {
            const Icon = SEVERITY_ICON[highlight.severity] ?? Info;
            return (
              <li
                key={index}
                className={cn(
                  "flex items-start gap-2.5 rounded-lg border p-3",
                  SEVERITY_STYLE[highlight.severity] ?? SEVERITY_STYLE.info
                )}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{highlight.title}</p>
                  <p className="text-xs opacity-90">{highlight.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {data.recommendations.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Recommendations
          </p>
          <ul className="space-y-1.5">
            {data.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                <span
                  className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground"
                  aria-hidden="true"
                />
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
