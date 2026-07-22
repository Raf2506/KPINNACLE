import { Lightbulb } from "lucide-react";
import type { Highlight } from "@/lib/insights";

export function HighlightsPanel({ highlights }: { highlights: Highlight[] }) {
  if (highlights.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Not enough data yet for highlights.
      </p>
    );
  }

  return (
    <ul className="space-y-3.5">
      {highlights.map((highlight) => (
        <li key={highlight.id} className="flex items-start gap-2.5 text-sm">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lightbulb className="h-3 w-3" aria-hidden="true" />
          </span>
          <span className="text-foreground">{highlight.text}</span>
        </li>
      ))}
    </ul>
  );
}
