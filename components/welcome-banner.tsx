"use client";

import { useMemo } from "react";
import { MoonStar, Sun, Sunrise } from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", Icon: Sunrise };
  if (hour < 18) return { text: "Good afternoon", Icon: Sun };
  return { text: "Good evening", Icon: MoonStar };
}

export function WelcomeBanner({ summary, dateLabel }: { summary: string; dateLabel: string }) {
  const { text, Icon } = useMemo(getGreeting, []);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 px-6 py-8 text-primary-foreground sm:px-10 sm:py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden="true"
      />
      <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
        <div className="max-w-lg">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur-sm">
            <Icon className="h-4 w-4" aria-hidden="true" />
            {text}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome to your KPI dashboard
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/85 sm:text-base">{summary}</p>
          <p className="mt-1 text-xs text-primary-foreground/60">{dateLabel}</p>
        </div>
        <DashboardIllustration className="hidden h-32 w-auto shrink-0 sm:block lg:h-40" />
      </div>
    </div>
  );
}

function DashboardIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="10" y="20" width="150" height="110" rx="14" fill="white" fillOpacity="0.12" />
      <rect x="10" y="20" width="150" height="110" rx="14" stroke="white" strokeOpacity="0.3" />
      <rect x="28" y="90" width="14" height="24" rx="3" fill="white" fillOpacity="0.55" />
      <rect x="50" y="75" width="14" height="39" rx="3" fill="white" fillOpacity="0.75" />
      <rect x="72" y="60" width="14" height="54" rx="3" fill="white" fillOpacity="0.9" />
      <rect x="94" y="82" width="14" height="32" rx="3" fill="white" fillOpacity="0.65" />
      <rect x="116" y="48" width="14" height="66" rx="3" fill="white" />
      <path
        d="M28 55 L58 40 L86 48 L116 22 L138 30"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle cx="180" cy="40" r="28" fill="white" />
      <path
        d="M168 40 L176 48 L192 30"
        stroke="var(--color-primary)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="195" cy="112" r="6" fill="white" fillOpacity="0.5" />
      <circle cx="185" cy="132" r="4" fill="white" fillOpacity="0.35" />
    </svg>
  );
}
