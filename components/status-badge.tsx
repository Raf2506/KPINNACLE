import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/types";

const STATUS_LABEL: Record<Status, string> = {
  NOT_STARTED: "Not started",
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  BEHIND: "Behind",
};

const STATUS_DOT: Record<Status, string> = {
  NOT_STARTED: "bg-status-not-started",
  ON_TRACK: "bg-status-on-track",
  AT_RISK: "bg-status-at-risk",
  BEHIND: "bg-status-behind",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge variant="outline" className="gap-1.5 font-medium">
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[status])} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
