"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Info, Search, StickyNote } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, STATUS_LABEL } from "@/components/status-badge";
import { CategoryBadge, CATEGORY_LABEL } from "@/components/category-badge";
import { AiBadge } from "@/components/ai-badge";
import { achievementPct, CATEGORIES, STATUSES } from "@/lib/metrics";
import { formatUnitValue } from "@/lib/format";
import { downloadCsv, toCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import type { Kpi } from "@/lib/types";

type SortKey = "title" | "employee" | "category" | "status" | "achievement" | "weight";

const CATEGORY_SELECT_ITEMS: Record<string, string> = { all: "All categories", ...CATEGORY_LABEL };
const STATUS_SELECT_ITEMS: Record<string, string> = { all: "All statuses", ...STATUS_LABEL };
const SORT_LABEL: Record<SortKey, string> = {
  title: "KPI title",
  employee: "Employee",
  category: "Category",
  weight: "Weight",
  achievement: "Achievement",
  status: "Status",
};

export function KpiTable({
  kpis,
  showEmployeeColumn = true,
  renderActions,
  emptyMessage = "No KPIs match these filters.",
  defaultEmployeeId,
}: {
  kpis: Kpi[];
  showEmployeeColumn?: boolean;
  renderActions?: (kpi: Kpi) => React.ReactNode;
  emptyMessage?: string;
  defaultEmployeeId?: string;
}) {
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState(defaultEmployeeId ?? "all");
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

  const employeeSelectItems = useMemo(
    () => ({ all: "All employees", ...Object.fromEntries(employeeOptions) }),
    [employeeOptions]
  );

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

  function handleExportCsv() {
    const headers = [
      "Title",
      ...(showEmployeeColumn ? ["Employee"] : []),
      "Category",
      "Current",
      "Target",
      "Unit",
      "Weight (%)",
      "Achievement (%)",
      "Status",
    ];
    const data = rows.map(({ kpi, achievement }) => [
      kpi.title,
      ...(showEmployeeColumn ? [kpi.employee?.name ?? ""] : []),
      CATEGORY_LABEL[kpi.category],
      kpi.current,
      kpi.target,
      kpi.unit,
      kpi.weight,
      Math.round(achievement),
      STATUS_LABEL[kpi.status],
    ]);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(toCsv(headers, data), `kpis-${date}.csv`);
  }

  function SortHeader({
    label,
    sortKeyName,
    className,
    hint,
  }: {
    label: string;
    sortKeyName: SortKey;
    className?: string;
    hint?: string;
  }) {
    const isActive = sortKey === sortKeyName;
    const Icon = !isActive ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
    return (
      <TableHead className={className} aria-sort={isActive ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleSort(sortKeyName)}
            className="flex cursor-pointer items-center gap-1 text-left font-medium text-foreground hover:text-primary"
          >
            {label}
            <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          </button>
          {hint && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span
                    className="inline-flex cursor-help items-center text-muted-foreground/70 hover:text-muted-foreground"
                    aria-label={`What is ${label}?`}
                  />
                }
              >
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
              </TooltipTrigger>
              <TooltipContent className="max-w-56">{hint}</TooltipContent>
            </Tooltip>
          )}
        </span>
      </TableHead>
    );
  }

  const columnCount = 6 + (showEmployeeColumn ? 1 : 0) + (renderActions ? 1 : 0);

  const sortSelectItems = useMemo(() => {
    const entries = Object.entries(SORT_LABEL).filter(
      ([key]) => showEmployeeColumn || key !== "employee"
    );
    return Object.fromEntries(entries);
  }, [showEmployeeColumn]);

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
          <Select
            value={employeeFilter}
            onValueChange={(value) => setEmployeeFilter(value ?? "all")}
            items={employeeSelectItems}
          >
            <SelectTrigger className="w-full sm:w-44" aria-label="Filter by employee">
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
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value ?? "all")}
          items={CATEGORY_SELECT_ITEMS}
        >
          <SelectTrigger className="w-full sm:w-40" aria-label="Filter by category">
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
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value ?? "all")}
          items={STATUS_SELECT_ITEMS}
        >
          <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          disabled={rows.length === 0}
          className="w-full cursor-pointer gap-1.5 sm:ml-auto sm:w-auto"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      {/* Mobile-only sort control — column-header sorting doesn't translate to the card list below. */}
      <div className="flex items-center gap-2 sm:hidden">
        <Select
          value={sortKey}
          onValueChange={(value) => value && setSortKey(value as SortKey)}
          items={sortSelectItems}
        >
          <SelectTrigger className="flex-1" aria-label="Sort by">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sortSelectItems).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 cursor-pointer"
          onClick={() => setSortDir((dir) => (dir === "asc" ? "desc" : "asc"))}
          aria-label={sortDir === "asc" ? "Sort ascending" : "Sort descending"}
        >
          {sortDir === "asc" ? (
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Table — sm and up */}
      <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader label="KPI" sortKeyName="title" />
              {showEmployeeColumn && <SortHeader label="Employee" sortKeyName="employee" />}
              <SortHeader label="Category" sortKeyName="category" />
              <TableHead>Current / Target</TableHead>
              <SortHeader
                label="Weight"
                sortKeyName="weight"
                className="text-right"
                hint="How much this KPI counts toward the employee's overall score. One employee's KPI weights should add up to 100%."
              />
              <SortHeader
                label="Achievement"
                sortKeyName="achievement"
                hint="Current ÷ Target, capped between 0% and 100%."
              />
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
                      {kpi.notes && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <span
                                className="inline-flex shrink-0 items-center text-muted-foreground"
                                aria-label="Has review notes"
                              />
                            }
                          >
                            <StickyNote className="h-3.5 w-3.5" aria-hidden="true" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-64">{kpi.notes}</TooltipContent>
                        </Tooltip>
                      )}
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

      {/* Card list — below sm, so there's nothing to scroll sideways to see */}
      <div className="space-y-3 sm:hidden">
        {rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          rows.map(({ kpi, achievement }) => (
            <div key={kpi.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-foreground">{kpi.title}</p>
                    {kpi.aiGenerated && <AiBadge />}
                  </div>
                  {showEmployeeColumn && (
                    <p className="truncate text-xs text-muted-foreground">
                      {kpi.employee?.name ?? "Unassigned"}
                    </p>
                  )}
                </div>
                <StatusBadge status={kpi.status} />
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <CategoryBadge category={kpi.category} />
                <span
                  className={cn(
                    "font-mono text-base font-semibold tabular-nums",
                    achievement >= 90
                      ? "text-status-on-track"
                      : achievement >= 60
                        ? "text-status-at-risk"
                        : "text-status-behind"
                  )}
                >
                  {Math.round(achievement)}%
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Current / Target</p>
                  <p className="font-mono tabular-nums text-foreground">
                    {formatUnitValue(kpi.current, kpi.unit)} / {formatUnitValue(kpi.target, kpi.unit)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Weight</p>
                  <p className="font-mono tabular-nums text-foreground">{kpi.weight}%</p>
                </div>
              </div>

              {kpi.notes && (
                <div className="mt-3 flex items-start gap-1.5 border-t border-border pt-3 text-xs">
                  <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <p className="text-muted-foreground">{kpi.notes}</p>
                </div>
              )}

              {renderActions && (
                <div className="mt-3 flex justify-end gap-1 border-t border-border pt-3">
                  {renderActions(kpi)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
