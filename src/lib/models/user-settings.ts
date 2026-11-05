import { Schema } from "mongoose";

import {
  THEME_VALUES,
  type ModuleSettings,
  type ThemePreference,
} from "../constants";
import { defineModel } from "./define-model";

export type UserSettingsDoc = {
  userId: string;
  theme?: ThemePreference;
  modules?: Partial<ModuleSettings>;
  /** Built-in categories the user has deleted, which the lists leave out. */
  hiddenCategories?: { expense?: string[]; income?: string[] };
  /** Built-in vehicle expense types the user has deleted. */
  hiddenVehicleExpenseTypes?: string[];
  /** Set only after every old fuel entry is confirmed to have been copied. */
  fuelCopiedAt?: Date;
};

const userSettingsSchema = new Schema<UserSettingsDoc>(
  {
    userId: { type: String, required: true, unique: true },
    theme: { type: String, enum: THEME_VALUES },
    modules: {
      finance: { type: Boolean },
      vehicles: { type: Boolean },
      analytics: { type: Boolean },
    },
    hiddenCategories: {
      expense: { type: [String], default: undefined },
      income: { type: [String], default: undefined },
    },
    hiddenVehicleExpenseTypes: { type: [String], default: undefined },
    fuelCopiedAt: { type: Date },
  },
  { timestamps: true },
);

export const UserSettings = defineModel("UserSettings", userSettingsSchema);
