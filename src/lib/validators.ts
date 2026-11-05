import { z } from "zod";

import {
  DOCUMENT_TYPE_VALUES,
  MODULE_KEYS,
  normalizeVehicleExpenseType,
  THEME_VALUES,
  TRANSACTION_TYPES,
  VEHICLE_CATEGORY,
  VEHICLE_TYPE_VALUES,
} from "./constants";
import { isValidISODate } from "./dates";
import { resolveFuelAmounts } from "./mileage";

// Shared by the browser forms and the API routes, so the rules cannot drift.
// Forms submit numbers as text, while the API accepts text or JSON numbers.

function numberField(requiredMessage: string) {
  return z
    .union([z.number(), z.string()], { error: requiredMessage })
    .refine((value) => String(value).trim() !== "", requiredMessage)
    .transform(Number)
    .pipe(z.number({ error: "Enter a valid number." }));
}

/** A number the user may leave empty, which then comes through as undefined. */
const optionalNumberField = z
  .union([z.number(), z.string()], { error: "Enter a valid number." })
  .optional()
  .transform((value) =>
    value === undefined || String(value).trim() === ""
      ? undefined
      : Number(value),
  )
  .pipe(z.number({ error: "Enter a valid number." }).optional());

const dateField = z
  .string({ error: "Pick a date." })
  .refine(isValidISODate, "Pick a valid date.");

const objectIdField = z
  .string({ error: "Select an item." })
  .regex(/^[a-f\d]{24}$/i, "Select an item.");

function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .optional()
    .transform((value) => value || undefined);
}

const amountField = numberField("Enter an amount.")
  .refine((n) => n > 0, "Amount must be greater than zero.")
  .refine((n) => n <= 1_000_000_000, "That amount is too large.")
  .transform((n) => Math.round(n * 100) / 100);

export const categoryDeleteSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  name: z.string().trim().min(1).max(40),
});

export const vehicleExpenseTypeDeleteSchema = z.object({
  name: z.string().trim().min(1).max(40),
});

export const transactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  date: dateField,
  category: z
    .string({ error: "Choose a category." })
    .trim()
    .min(1, "Choose a category.")
    .max(40, "Keep the category under 40 characters.")
    .refine(
      (value) => value.toLowerCase() !== VEHICLE_CATEGORY.toLowerCase(),
      "Add vehicle expenses from the Vehicles page, so they link to a vehicle.",
    ),
  amount: amountField,
  note: optionalText(200),
  recurring: z.boolean().optional(),
});

export const bikeSchema = z.object({
  name: z
    .string({ error: "Enter a vehicle name." })
    .trim()
    .min(1, "Enter a vehicle name.")
    .max(60, "Keep the name under 60 characters."),
  vehicleType: z
    .enum(VEHICLE_TYPE_VALUES, { error: "Choose a vehicle type." })
    .default("bike"),
  brand: optionalText(60),
  model: optionalText(60),
  registrationNumber: optionalText(40),
  purchaseDate: z
    .union([z.literal(""), dateField])
    .optional()
    .transform((value) => value || undefined),
});

export const vehicleExpenseSchema = z.object({
  bikeId: objectIdField,
  date: dateField,
  expenseType: z
    .string({ error: "Choose an expense type." })
    .trim()
    .min(1, "Choose an expense type.")
    .max(40, "Keep the expense type under 40 characters.")
    .transform(normalizeVehicleExpenseType)
    .refine((value) => value !== "fuel", "Add fuel with the Add Fuel button."),
  amount: amountField,
  note: optionalText(200),
});

export const fuelEntrySchema = z
  .object({
    bikeId: objectIdField,
    date: dateField,
    odometer: numberField("Enter the odometer reading.")
      .refine((n) => n >= 0, "Odometer cannot be negative.")
      .refine((n) => n <= 10_000_000, "That reading is too large."),
    totalCost: optionalNumberField
      .refine((n) => n === undefined || n >= 0, "Cost cannot be negative.")
      .refine(
        (n) => n === undefined || n <= 10_000_000,
        "That cost is too large.",
      ),
    pricePerLiter: optionalNumberField
      .refine((n) => n === undefined || n > 0, "Price must be above zero.")
      .refine(
        (n) => n === undefined || n <= 100_000,
        "That price is too large.",
      ),
    fuelQuantity: optionalNumberField
      .refine(
        (n) => n === undefined || n > 0,
        "Fuel quantity must be greater than zero.",
      )
      .refine((n) => n === undefined || n <= 1000, "That quantity is too large."),
    fullTank: z.boolean().optional(),
    note: optionalText(200),
  })
  .transform((data, context) => {
    const amounts = resolveFuelAmounts(data);
    if (!amounts) {
      context.addIssue({
        code: "custom",
        path: ["totalCost"],
        message: "Enter any two of amount, price per liter and liters.",
      });
      return z.NEVER;
    }
    return { ...data, ...amounts };
  });

export const settingsSchema = z.object({
  theme: z.enum(THEME_VALUES).optional(),
  modules: z
    .object(
      Object.fromEntries(
        MODULE_KEYS.map((key) => [key, z.boolean().optional()]),
      ) as Record<(typeof MODULE_KEYS)[number], z.ZodOptional<z.ZodBoolean>>,
    )
    .optional(),
});

export const documentMetaSchema = z.object({
  name: optionalText(100),
  documentType: z.enum(DOCUMENT_TYPE_VALUES, {
    error: "Choose a document type.",
  }),
  bikeId: z
    .union([z.literal(""), objectIdField])
    .optional()
    .transform((value) => value || undefined),
});

export const logInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

const newPassword = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Keep the password under 128 characters.");

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(60),
  email: z.email("Enter a valid email address."),
  password: newPassword,
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(60, "Keep the name under 60 characters."),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword,
});
