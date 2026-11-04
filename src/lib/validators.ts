import { z } from "zod";

import { DOCUMENT_TYPE_VALUES, TRANSACTION_TYPES } from "./constants";
import { isValidISODate } from "./dates";

// Shared by the browser forms and the API routes, so the rules cannot drift.
// Forms submit numbers as text, while the API accepts text or JSON numbers.

function numberField(requiredMessage: string) {
  return z
    .union([z.number(), z.string()], { error: requiredMessage })
    .refine((value) => String(value).trim() !== "", requiredMessage)
    .transform(Number)
    .pipe(z.number({ error: "Enter a valid number." }));
}

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

export const transactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  date: dateField,
  category: z
    .string({ error: "Choose a category." })
    .trim()
    .min(1, "Choose a category.")
    .max(40, "Keep the category under 40 characters."),
  amount: numberField("Enter an amount.")
    .refine((n) => n > 0, "Amount must be greater than zero.")
    .refine((n) => n <= 1_000_000_000, "That amount is too large.")
    .transform((n) => Math.round(n * 100) / 100),
  note: optionalText(200),
});

export const bikeSchema = z.object({
  name: z
    .string({ error: "Enter a bike name." })
    .trim()
    .min(1, "Enter a bike name.")
    .max(60, "Keep the name under 60 characters."),
  brand: optionalText(60),
  model: optionalText(60),
  registrationNumber: optionalText(40),
  purchaseDate: z
    .union([z.literal(""), dateField])
    .optional()
    .transform((value) => value || undefined),
});

export const fuelEntrySchema = z.object({
  bikeId: objectIdField,
  date: dateField,
  odometer: numberField("Enter the odometer reading.")
    .refine((n) => n >= 0, "Odometer cannot be negative.")
    .refine((n) => n <= 10_000_000, "That reading is too large."),
  fuelQuantity: numberField("Enter the fuel quantity.")
    .refine((n) => n > 0, "Fuel quantity must be greater than zero.")
    .refine((n) => n <= 1000, "That quantity is too large."),
  totalCost: numberField("Enter the total cost.")
    .refine((n) => n >= 0, "Cost cannot be negative.")
    .refine((n) => n <= 10_000_000, "That cost is too large."),
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

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword,
});
