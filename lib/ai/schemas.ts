import { z } from "zod";
import { CATEGORIES } from "@/lib/metrics";
import { clampedNumber, safeArray, safeString } from "@/lib/ai/normalize";

export const riskSeveritySchema = z.enum(["low", "medium", "high"]).catch("medium");
export type RiskSeverity = z.infer<typeof riskSeveritySchema>;

export const riskItemSchema = z.object({
  kpiId: safeString(),
  employeeName: safeString(),
  severity: riskSeveritySchema,
  reason: safeString(),
  recommendedAction: safeString(),
});

export const riskDetectionSchema = z.object({
  riskScore: clampedNumber(0, 100, 0),
  summary: safeString(),
  risks: safeArray(riskItemSchema),
});
export type RiskDetectionResult = z.infer<typeof riskDetectionSchema>;

export const kpiSuggestionSchema = z.object({
  title: safeString(),
  description: safeString(),
  category: z.enum(CATEGORIES).catch("SALES"),
  weight: clampedNumber(0, 100, 0),
  target: clampedNumber(0.01, 100_000_000, 1),
  unit: safeString("%"),
  rationale: safeString(),
});
export type KpiSuggestion = z.infer<typeof kpiSuggestionSchema>;

export const kpiGeneratorResultSchema = z.object({
  suggestions: safeArray(kpiSuggestionSchema),
});
export type KpiGeneratorResult = z.infer<typeof kpiGeneratorResultSchema>;
