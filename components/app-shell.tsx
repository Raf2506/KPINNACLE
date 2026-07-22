"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ListChecks, Gauge } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/kpis", label: "KPIs", icon: ListChecks },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="flex w-[76px] shrink-0 flex-col items-center gap-1 bg-sidebar px-3 py-5 text-sidebar-foreground">
        <Link
          href="/"
          className="mb-6 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sidebar-accent text-sidebar-accent-foreground"
          aria-label="KPI Analyzer home"
        >
          <Gauge className="h-5 w-5" strokeWidth={2.25} />
        </Link>

        <nav className="flex flex-col items-center gap-1.5" aria-label="Primary">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Tooltip key={href}>
                <TooltipTrigger
                  render={
                    <Link
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={label}
                      className={cn(
                        "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/65 hover:bg-white/10 hover:text-sidebar-foreground"
                      )}
                    />
                  }
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-10">
          <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
            KPI Analyzer
          </span>
          <ThemeToggle />
        </header>

        <main id="main-content" className="flex-1 px-6 py-8 sm:px-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
