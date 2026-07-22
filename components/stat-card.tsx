import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "primary",
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: string;
  tone?: "primary" | "accent";
  className?: string;
}) {
  return (
    <Card className={cn("gap-3", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            tone === "primary" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-2xl font-semibold tabular-nums text-foreground">{value}</div>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
