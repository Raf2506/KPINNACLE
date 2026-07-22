import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const CATEGORY_LABEL: Record<Category, string> = {
  SALES: "Sales",
  OPERATIONS: "Operations",
  COMPLIANCE: "Compliance",
  DEVELOPMENT: "Development",
};

const CATEGORY_DOT: Record<Category, string> = {
  SALES: "bg-chart-1",
  OPERATIONS: "bg-chart-2",
  COMPLIANCE: "bg-chart-3",
  DEVELOPMENT: "bg-chart-4",
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", CATEGORY_DOT[category])} aria-hidden="true" />
      {CATEGORY_LABEL[category]}
    </span>
  );
}

export { CATEGORY_LABEL };
