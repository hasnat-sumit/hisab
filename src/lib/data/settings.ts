import "server-only";

import { cache } from "react";

import { DEFAULT_MODULES, type TransactionType } from "../constants";
import { connectDB } from "../db";
import { UserSettings } from "../models/user-settings";
import type { SettingsDTO } from "../types";

/** The user's preferences, read once per request. */
export const getSettings = cache(
  async (userId: string): Promise<SettingsDTO> => {
    await connectDB();
    const doc = await UserSettings.findOne({ userId })
      .select({
        theme: 1,
        modules: 1,
        hiddenCategories: 1,
        hiddenVehicleExpenseTypes: 1,
      })
      .lean();
    return {
      theme: doc?.theme ?? "system",
      modules: { ...DEFAULT_MODULES, ...doc?.modules },
      hiddenCategories: {
        expense: doc?.hiddenCategories?.expense ?? [],
        income: doc?.hiddenCategories?.income ?? [],
      },
      hiddenVehicleExpenseTypes: doc?.hiddenVehicleExpenseTypes ?? [],
    };
  },
);

/** Saving to a deleted built-in category adds it back to the lists. */
export async function restoreCategory(
  userId: string,
  type: TransactionType,
  category: string,
): Promise<void> {
  await UserSettings.updateOne(
    { userId },
    { $pull: { [`hiddenCategories.${type}`]: category } },
  );
}

/** Saving to a deleted built-in vehicle expense type adds it back too. */
export async function restoreVehicleExpenseType(
  userId: string,
  expenseType: string,
): Promise<void> {
  await UserSettings.updateOne(
    { userId },
    { $pull: { hiddenVehicleExpenseTypes: expenseType } },
  );
}
