// en-IN gives the lakh/crore grouping used in Bangladesh (1,25,000).
const numberFormat = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

export function formatTaka(amount: number): string {
  const formatted = `৳${numberFormat.format(Math.abs(amount))}`;
  return amount < 0 ? `-${formatted}` : formatted;
}

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
