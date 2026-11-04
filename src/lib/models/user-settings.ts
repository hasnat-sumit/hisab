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
    fuelCopiedAt: { type: Date },
  },
  { timestamps: true },
);

export const UserSettings = defineModel("UserSettings", userSettingsSchema);
