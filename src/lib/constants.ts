export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Rent",
  "Bills",
  "Family",
  "Health",
  "Education",
  "Entertainment",
  "Other",
];

export const INCOME_CATEGORIES = [
  "Salary",
  "Business",
  "Freelance",
  "Investment",
  "Loan received",
  "Other",
];

export const TRANSACTION_TYPES = ["expense", "income"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "bank", label: "Bank transfer" },
  { value: "other", label: "Other" },
] as const;

export const PAYMENT_METHOD_VALUES = [
  "cash",
  "card",
  "bkash",
  "nagad",
  "bank",
  "other",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHOD_VALUES)[number];

export const VEHICLE_TYPES = [
  { value: "bike", label: "Bike" },
  { value: "car", label: "Car" },
] as const;

export const VEHICLE_TYPE_VALUES = ["bike", "car"] as const;
export type VehicleType = (typeof VEHICLE_TYPE_VALUES)[number];

export const VEHICLE_EXPENSE_TYPES = [
  { value: "fuel", label: "Fuel" },
  { value: "servicing", label: "Servicing" },
  { value: "parts", label: "Parts" },
  { value: "repairs", label: "Repairs" },
  { value: "safety", label: "Safety equipment" },
  { value: "accessories", label: "Accessories" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
] as const;

export const VEHICLE_EXPENSE_TYPE_VALUES = [
  "fuel",
  "servicing",
  "parts",
  "repairs",
  "safety",
  "accessories",
  "insurance",
  "other",
] as const;
export type VehicleExpenseType = (typeof VEHICLE_EXPENSE_TYPE_VALUES)[number];

/** Fuel has its own form, so the general vehicle expense form leaves it out. */
export const NON_FUEL_EXPENSE_TYPE_VALUES = [
  "servicing",
  "parts",
  "repairs",
  "safety",
  "accessories",
  "insurance",
  "other",
] as const;

/** The category every vehicle expense has in the main expense list. */
export const VEHICLE_CATEGORY = "Vehicle";

export const THEME_VALUES = ["system", "light", "dark"] as const;
export type ThemePreference = (typeof THEME_VALUES)[number];

export const MODULE_KEYS = ["finance", "vehicles", "analytics"] as const;
export type ModuleKey = (typeof MODULE_KEYS)[number];
export type ModuleSettings = Record<ModuleKey, boolean>;

export const DEFAULT_MODULES: ModuleSettings = {
  finance: true,
  vehicles: true,
  analytics: true,
};

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

export function vehicleExpenseLabel(type: VehicleExpenseType): string {
  return VEHICLE_EXPENSE_TYPES.find((t) => t.value === type)?.label ?? "Other";
}

export function paymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? "Other";
}
