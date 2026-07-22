import { z } from "zod";
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
