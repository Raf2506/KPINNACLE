import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/types";

const STATUS_LABEL: Record<Status, string> = {
  NOT_STARTED: "Not started",
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  BEHIND: "Behind",
};

const STATUS_STYLE: Record<Status, string> = {
  NOT_STARTED: "bg-status-not-started/12 text-status-not-started",
  ON_TRACK: "bg-status-on-track/12 text-status-on-track",
  AT_RISK: "bg-status-at-risk/15 text-status-at-risk",
  BEHIND: "bg-status-behind/12 text-status-behind",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge className={cn("font-medium", STATUS_STYLE[status])}>{STATUS_LABEL[status]}</Badge>
  );
}

export { STATUS_LABEL, STATUS_STYLE };
