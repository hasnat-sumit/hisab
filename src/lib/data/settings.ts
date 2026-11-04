import "server-only";

import { cache } from "react";

import { DEFAULT_MODULES } from "../constants";
import { connectDB } from "../db";
import { UserSettings } from "../models/user-settings";
import type { SettingsDTO } from "../types";

/** The user's preferences, read once per request. */
export const getSettings = cache(
  async (userId: string): Promise<SettingsDTO> => {
    await connectDB();
    const doc = await UserSettings.findOne({ userId })
      .select({ theme: 1, modules: 1 })
      .lean();
    return {
      theme: doc?.theme ?? "system",
      modules: { ...DEFAULT_MODULES, ...doc?.modules },
    };
  },
);
