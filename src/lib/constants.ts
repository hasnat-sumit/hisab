export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Family",
  "Health",
  "Education",
  "Entertainment",
  "Bike",
  "Other",
];

export const INCOME_CATEGORIES = [
  "Salary",
  "Business",
  "Freelance",
  "Investment",
  "Other",
];

export const TRANSACTION_TYPES = ["expense", "income"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const DOCUMENT_TYPES = [
  { value: "driving-licence", label: "Driving licence" },
  { value: "bike-rc", label: "Registration certificate (RC)" },
  { value: "insurance", label: "Insurance" },
  { value: "tax-token", label: "Tax token" },
  { value: "other", label: "Other" },
] as const;

export const DOCUMENT_TYPE_VALUES = [
  "driving-licence",
  "bike-rc",
  "insurance",
  "tax-token",
  "other",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPE_VALUES)[number];

// Vercel rejects request bodies above 4.5 MB, so uploads stay under that.
export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;
export const DOCUMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png";
export const DOCUMENT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

export function categoryOptions(
  type: TransactionType,
  usedCategories: string[] = [],
): string[] {
  const defaults = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const custom = usedCategories.filter((c) => !defaults.includes(c)).sort();
  // Keep "Other" as the last choice, after any custom categories.
  return [...defaults.filter((c) => c !== "Other"), ...custom, "Other"];
}
