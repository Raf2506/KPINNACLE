import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Distinct visual marker for AI-derived values, per AGENTS.md: "AI-derived
 * values always show an AI badge component, distinct from computed metrics."
 */
export function AiBadge({ className }: { className?: string }) {
  return (
    <Badge className={cn("gap-1 border-transparent bg-accent text-accent-foreground", className)}>
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      AI
    </Badge>
  );
}
