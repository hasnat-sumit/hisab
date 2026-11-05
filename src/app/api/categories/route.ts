import { ApiError, parseData, withUser } from "@/lib/api";
import { isCustomCategory, VEHICLE_CATEGORY } from "@/lib/constants";
import { Transaction } from "@/lib/models/transaction";
import { UserSettings } from "@/lib/models/user-settings";
import { categoryDeleteSchema } from "@/lib/validators";

// Deleting a category never deletes money records. They move to "Other", so
// every total stays the same. "Other" has nowhere to move them, so its records
// stay put and it only leaves the lists.
export const DELETE = withUser(async ({ request, user }) => {
  const { searchParams } = new URL(request.url);
  const { type, name } = parseData(
    { type: searchParams.get("type"), name: searchParams.get("name") },
    categoryDeleteSchema,
  );
  if (name === VEHICLE_CATEGORY) {
    throw new ApiError(409, "The Vehicle category belongs to your vehicles.");
  }

  if (name !== "Other") {
    await Transaction.updateMany(
      { userId: user.id, type, category: name },
      { $set: { category: "Other" } },
    );
  }
  // A custom category exists only through its records, so it is gone by now.
  if (!isCustomCategory(type, name)) {
    await UserSettings.updateOne(
      { userId: user.id },
      { $addToSet: { [`hiddenCategories.${type}`]: name } },
      { upsert: true },
    );
  }
  return new Response(null, { status: 204 });
});
