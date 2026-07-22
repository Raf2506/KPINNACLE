"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ListChecks, Gauge, Menu, X } from "lucide-react";
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  return (
    <div className="flex min-h-dvh bg-background">
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[45] bg-black/40 sm:hidden"
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col gap-1 bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform duration-200 ease-out",
          "sm:static sm:z-auto sm:w-[76px] sm:translate-x-0 sm:items-center sm:px-3 sm:transition-none",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-6 flex items-center justify-between sm:justify-center">
          <Link
            href="/"
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sidebar-accent text-sidebar-accent-foreground"
            aria-label="KPINNACLE home"
          >
            <Gauge className="h-5 w-5" strokeWidth={2.25} />
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground sm:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col items-stretch gap-1.5 sm:items-center" aria-label="Primary">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Tooltip key={href}>
                <TooltipTrigger
                  render={
                    <Link
                      href={href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex h-11 shrink-0 cursor-pointer items-center gap-3 rounded-xl px-3 transition-colors",
                        "sm:w-11 sm:justify-center sm:px-0",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/65 hover:bg-white/10 hover:text-sidebar-foreground"
                      )}
                    />
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
                  <span className="text-sm font-medium sm:hidden">{label}</span>
                </TooltipTrigger>
                <TooltipContent side="right" className="hidden sm:block">
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="flex min-w-0 items-baseline gap-1.5 truncate">
              <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
                KPINNACLE
              </span>
              <span className="hidden truncate text-sm text-muted-foreground sm:inline">
                — KPI Analyzer
              </span>
            </span>
          </div>
          <ThemeToggle />
        </header>

        <main id="main-content" className="flex-1 px-4 py-6 sm:px-10 sm:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
