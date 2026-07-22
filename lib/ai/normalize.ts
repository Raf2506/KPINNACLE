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
