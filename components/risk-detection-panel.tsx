"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateRiskDetection, getCachedRiskDetection } from "@/lib/api";
import { aiErrorMessage } from "@/lib/ai/error-messages";
import { formatRelativeTime } from "@/lib/format";
import { AiBadge } from "@/components/ai-badge";
import { AvatarInitials } from "@/components/avatar-initials";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/error-state";
import { RiskScoreGauge } from "@/components/charts/risk-score-gauge";
import { cn } from "@/lib/utils";

const SEVERITY_STYLE: Record<string, string> = {
  high: "bg-status-behind/12 text-status-behind",
  medium: "bg-status-at-risk/15 text-status-at-risk",
  low: "bg-status-on-track/12 text-status-on-track",
};

export function RiskDetectionPanel({ cycleId }: { cycleId?: string }) {
  const queryClient = useQueryClient();

  const cachedQuery = useQuery({
    queryKey: ["ai-risk", cycleId],
    queryFn: () => getCachedRiskDetection(cycleId),
  });

  const mutation = useMutation({
    mutationFn: () => generateRiskDetection(cycleId),
    onSuccess: (result) => {
      queryClient.setQueryData(["ai-risk", cycleId], { cached: result });
      toast.success("Risk analysis updated");
    },
    onError: (error) => {
      toast.error(aiErrorMessage(error));
    },
  });

  if (cachedQuery.isPending) {
    return <Skeleton className="h-72 w-full" />;
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
          No risk analysis yet for this cycle. Generate one to surface which KPIs are most likely to
          slip.
        </p>
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="cursor-pointer gap-1.5"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {mutation.isPending ? "Analyzing..." : "Analyze this cycle"}
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <RiskScoreGauge score={data.riskScore} />
        <p className="text-sm text-muted-foreground">{data.summary}</p>
      </div>

      {data.risks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No significant risks identified this cycle.</p>
      ) : (
        <ul className="space-y-2">
          {data.risks.map((risk, index) => (
            <li key={`${risk.kpiId}-${index}`} className="rounded-lg border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <AvatarInitials name={risk.employeeName || "?"} className="size-8 shrink-0 text-xs" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {risk.employeeName || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">{risk.reason}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                    SEVERITY_STYLE[risk.severity] ?? SEVERITY_STYLE.medium
                  )}
                >
                  {risk.severity}
                </span>
              </div>
              {risk.recommendedAction && (
                <p className="mt-2 border-t border-border pt-2 text-xs text-foreground">
                  <span className="font-medium text-muted-foreground">Recommended: </span>
                  {risk.recommendedAction}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
