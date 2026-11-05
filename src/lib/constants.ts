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

/** A built-in type's value from the list above, or a name the user typed. */
export type VehicleExpenseType = string;
export type VehicleExpenseTypeOption = { value: string; label: string };

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

function defaultCategories(type: TransactionType): string[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

/** Whether the user made this category, rather than it being built in. */
export function isCustomCategory(
  type: TransactionType,
  category: string,
): boolean {
  return (
    category !== VEHICLE_CATEGORY &&
    !defaultCategories(type).includes(category)
  );
}

export function categoryOptions(
  type: TransactionType,
  usedCategories: string[] = [],
  /** Built-in categories the user has deleted. */
  hidden: string[] = [],
): string[] {
  const defaults = defaultCategories(type);
  const custom = usedCategories.filter((c) => !defaults.includes(c)).sort();
  // Keep "Other" as the last choice, after any custom categories.
  return [
    ...defaults.filter((c) => c !== "Other" && !hidden.includes(c)),
    ...custom,
    ...(hidden.includes("Other") ? [] : ["Other"]),
  ];
}

export function vehicleExpenseLabel(type: VehicleExpenseType): string {
  return VEHICLE_EXPENSE_TYPES.find((t) => t.value === type)?.label ?? type;
}

/** Typing the name of a built-in type chooses that type, not a lookalike. */
export function normalizeVehicleExpenseType(name: string): VehicleExpenseType {
  const lower = name.toLowerCase();
  const builtIn = VEHICLE_EXPENSE_TYPES.find(
    (t) => t.value === lower || t.label.toLowerCase() === lower,
  );
  return builtIn?.value ?? name;
}

export function isBuiltInVehicleExpenseType(type: VehicleExpenseType): boolean {
  return VEHICLE_EXPENSE_TYPES.some((t) => t.value === type);
}

/** The form's choices. Fuel has its own form, so it is left out. */
export function vehicleExpenseTypeOptions(
  usedTypes: string[] = [],
  /** Built-in types the user has deleted. */
  hidden: string[] = [],
): VehicleExpenseTypeOption[] {
  const builtIn = VEHICLE_EXPENSE_TYPES.filter(
    (t) => t.value !== "fuel" && t.value !== "other" && !hidden.includes(t.value),
  );
  const custom = usedTypes
    .filter((type) => !isBuiltInVehicleExpenseType(type))
    .sort()
    .map((type) => ({ value: type, label: type }));
  // Keep "Other" as the last choice, after any custom types.
  return [
    ...builtIn,
    ...custom,
    ...(hidden.includes("other") ? [] : [{ value: "other", label: "Other" }]),
  ];
}