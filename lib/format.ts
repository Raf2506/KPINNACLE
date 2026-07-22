export function formatUnitValue(value: number, unit: string): string {
  if (unit === "RM") {
    return `RM ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  if (unit === "%") {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}
