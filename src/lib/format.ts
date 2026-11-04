// en-IN gives the lakh/crore grouping used in Bangladesh (1,25,000).
const numberFormat = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

export function formatTaka(amount: number): string {
  const formatted = `৳${numberFormat.format(Math.abs(amount))}`;
  return amount < 0 ? `-${formatted}` : formatted;
}

/** Short amounts for chart axes, using lakh and crore: 1.5L, 2Cr. */
export function formatCompactTaka(amount: number): string {
  const size = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const short = (value: number) => String(Number(value.toFixed(1)));
  if (size >= 10_000_000) return `${sign}${short(size / 10_000_000)}Cr`;
  if (size >= 100_000) return `${sign}${short(size / 100_000)}L`;
  if (size >= 1000) return `${sign}${short(size / 1000)}K`;
  return `${sign}${size}`;
}

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
