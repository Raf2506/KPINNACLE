import { z } from "zod";

/**
 * Defensive-parsing building blocks for AI output schemas: coerce strings to
 * numbers, fall back on anything unparseable, then clamp to range. Zod's
 * `.catch()` covers "default missing arrays/strings"; plain `z.object()`
 * already strips unknown keys, so no extra code is needed for either of
 * those two rules.
 */
export function clampedNumber(min: number, max: number, fallback = min) {
  return z
    .preprocess((value) => {
      if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
      }
      return value;
    }, z.number().catch(fallback))
    .transform((value) => Math.min(max, Math.max(min, value)));
}

export function safeString(fallback = "") {
  return z.string().catch(fallback);
}

export function safeArray<T extends z.ZodTypeAny>(item: T) {
  return z.array(item).catch([]);
}

/** Rescales weights so they sum to exactly 100, in case the model drifts. */
export function renormalizeWeights<T extends { weight: number }>(items: T[]): T[] {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) {
    const even = items.length > 0 ? 100 / items.length : 0;
    return items.map((item) => ({ ...item, weight: even }));
  }
  return items.map((item) => ({ ...item, weight: (item.weight / total) * 100 }));
}
