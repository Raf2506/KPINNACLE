import { z } from "zod";
import { CATEGORIES, STATUSES } from "@/lib/metrics";

export const categorySchema = z.enum(CATEGORIES);
export const statusSchema = z.enum(STATUSES);

export const employeeInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  role: z.string().trim().min(1, "Role is required").max(120),
  department: z.string().trim().min(1, "Department is required").max(120),
});

export const employeeUpdateSchema = employeeInputSchema.partial();

export const kpiInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  description: z.string().trim().max(2000).default(""),
  category: categorySchema,
  weight: z.number().min(0, "Weight must be at least 0").max(100, "Weight cannot exceed 100"),
  target: z.number().positive("Target must be greater than 0"),
  current: z.number().min(0, "Current cannot be negative"),
  unit: z.string().trim().min(1, "Unit is required").max(20),
  status: statusSchema,
  employeeId: z.string().min(1, "Employee is required"),
  cycleId: z.string().min(1, "Review cycle is required"),
  /** Set by the AI KPI Generator's "Apply selected" flow. */
  aiGenerated: z.boolean().optional().default(false),
});

export const kpiUpdateSchema = kpiInputSchema.partial();

export type EmployeeInput = z.infer<typeof employeeInputSchema>;
export type KpiInput = z.infer<typeof kpiInputSchema>;

export function zodIssues(error: z.ZodError) {
  return error.flatten();
}
