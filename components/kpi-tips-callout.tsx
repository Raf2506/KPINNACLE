"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "kpinnacle:kpi-tips-dismissed";

export function KpiTipsCallout() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
  }, []);

  if (dismissed) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium text-foreground">New to adding KPIs?</p>
        <p className="text-sm text-muted-foreground">
          Each KPI needs a title, a target, a current value, and a weight — one
          employee&apos;s KPI weights should add up to 100%. Hover the{" "}
          <span className="font-medium text-foreground">Weight</span> and{" "}
          <span className="font-medium text-foreground">Achievement</span> column headers
          below for a quick explanation, or read the full walkthrough.
        </p>
        <Link
          href="/guide"
          className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Open the beginner&apos;s guide →
        </Link>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0 cursor-pointer text-muted-foreground hover:text-foreground"
        aria-label="Dismiss tip"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, "true");
          setDismissed(true);
        }}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
    </div>
  );
}
