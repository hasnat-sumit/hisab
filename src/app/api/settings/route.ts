import { ApiError, parseBody, withUser } from "@/lib/api";
import { DEFAULT_MODULES } from "@/lib/constants";
import { UserSettings } from "@/lib/models/user-settings";
import { settingsSchema } from "@/lib/validators";

export const PATCH = withUser(async ({ request, user }) => {
  const { theme, modules } = await parseBody(request, settingsSchema);
  const existing = await UserSettings.findOne({ userId: user.id })
    .select({ modules: 1 })
    .lean();
  const next = { ...DEFAULT_MODULES, ...existing?.modules, ...modules };
  if (!next.finance && !next.vehicles) {
    throw new ApiError(422, "Keep at least Finance or Vehicles turned on.");
  }

  // Only hides parts of the app. Turning a module off never touches its data.
  await UserSettings.updateOne(
    { userId: user.id },
    { $set: { modules: next, ...(theme ? { theme } : {}) } },
    { upsert: true },
  );
  return Response.json({ modules: next, theme });
});
