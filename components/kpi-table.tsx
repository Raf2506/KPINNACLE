"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { CategoryBadge, CATEGORY_LABEL } from "@/components/category-badge";
import { AiBadge } from "@/components/ai-badge";
import { achievementPct, CATEGORIES, STATUSES } from "@/lib/metrics";
import { formatUnitValue } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Kpi } from "@/lib/types";

type SortKey = "title" | "employee" | "category" | "status" | "achievement" | "weight";

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Not started",
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  BEHIND: "Behind",
};

export function KpiTable({
  kpis,
  showEmployeeColumn = true,
  renderActions,
  emptyMessage = "No KPIs match these filters.",
}: {
  kpis: Kpi[];
  showEmployeeColumn?: boolean;
  renderActions?: (kpi: Kpi) => React.ReactNode;
  emptyMessage?: string;
}) {
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const employeeOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const kpi of kpis) {
      if (kpi.employee) map.set(kpi.employee.id, kpi.employee.name);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [kpis]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return kpis.filter((kpi) => {
      if (query && !kpi.title.toLowerCase().includes(query)) return false;
      if (employeeFilter !== "all" && kpi.employeeId !== employeeFilter) return false;
      if (categoryFilter !== "all" && kpi.category !== categoryFilter) return false;
      if (statusFilter !== "all" && kpi.status !== statusFilter) return false;
      return true;
    });
  }, [kpis, search, employeeFilter, categoryFilter, statusFilter]);

  const rows = useMemo(() => {
    const withAchievement = filtered.map((kpi) => ({
      kpi,
      achievement: achievementPct(kpi.current, kpi.target),
    }));

    withAchievement.sort((a, b) => {
      let result = 0;
      switch (sortKey) {
        case "title":
          result = a.kpi.title.localeCompare(b.kpi.title);
          break;
        case "employee":
          result = (a.kpi.employee?.name ?? "").localeCompare(b.kpi.employee?.name ?? "");
          break;
        case "category":
          result = a.kpi.category.localeCompare(b.kpi.category);
          break;
        case "status":
          result = a.kpi.status.localeCompare(b.kpi.status);
          break;
        case "weight":
          result = a.kpi.weight - b.kpi.weight;
          break;
        case "achievement":
          result = a.achievement - b.achievement;
          break;
      }
      return sortDir === "asc" ? result : -result;
    });

    return withAchievement;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortHeader({
    label,
    sortKeyName,
    className,
  }: {
    label: string;
    sortKeyName: SortKey;
    className?: string;
  }) {
    const isActive = sortKey === sortKeyName;
    const Icon = !isActive ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
    return (
      <TableHead className={className} aria-sort={isActive ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
        <button
          type="button"
          onClick={() => toggleSort(sortKeyName)}
          className="flex cursor-pointer items-center gap-1 text-left font-medium text-foreground hover:text-primary"
        >
          {label}
          <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </button>
      </TableHead>
    );
  }

  const columnCount = 6 + (showEmployeeColumn ? 1 : 0) + (renderActions ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search KPI title..."
            className="pl-8"
            aria-label="Search KPIs by title"
          />
        </div>
        {showEmployeeColumn && employeeOptions.length > 0 && (
          <Select value={employeeFilter} onValueChange={(value) => setEmployeeFilter(value ?? "all")}>
            <SelectTrigger className="sm:w-44" aria-label="Filter by employee">
              <SelectValue placeholder="Employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All employees</SelectItem>
              {employeeOptions.map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value ?? "all")}>
          <SelectTrigger className="sm:w-40" aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {CATEGORY_LABEL[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
          <SelectTrigger className="sm:w-40" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABEL[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader label="KPI" sortKeyName="title" />
              {showEmployeeColumn && <SortHeader label="Employee" sortKeyName="employee" />}
              <SortHeader label="Category" sortKeyName="category" />
              <TableHead>Current / Target</TableHead>
              <SortHeader label="Weight" sortKeyName="weight" className="text-right" />
              <SortHeader label="Achievement" sortKeyName="achievement" />
              <SortHeader label="Status" sortKeyName="status" />
              {renderActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map(({ kpi, achievement }) => (
                <TableRow key={kpi.id}>
                  <TableCell className="max-w-[240px]">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-foreground">{kpi.title}</span>
                      {kpi.aiGenerated && <AiBadge />}
                    </div>
                  </TableCell>
                  {showEmployeeColumn && (
                    <TableCell className="text-muted-foreground">{kpi.employee?.name ?? "—"}</TableCell>
                  )}
                  <TableCell>
                    <CategoryBadge category={kpi.category} />
                  </TableCell>
                  <TableCell className="font-mono text-sm tabular-nums text-muted-foreground">
                    {formatUnitValue(kpi.current, kpi.unit)} / {formatUnitValue(kpi.target, kpi.unit)}
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{kpi.weight}%</TableCell>
                  <TableCell
                    className={cn(
                      "font-mono tabular-nums font-medium",
                      achievement >= 90
                        ? "text-status-on-track"
                        : achievement >= 60
                          ? "text-status-at-risk"
                          : "text-status-behind"
                    )}
                  >
                    {Math.round(achievement)}%
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={kpi.status} />
                  </TableCell>
                  {renderActions && <TableCell className="text-right">{renderActions(kpi)}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
