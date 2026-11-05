import { ApiError, parseData, withUser } from "@/lib/api";
import { isBuiltInVehicleExpenseType } from "@/lib/constants";
import { Transaction } from "@/lib/models/transaction";
import { UserSettings } from "@/lib/models/user-settings";
import { vehicleExpenseTypeDeleteSchema } from "@/lib/validators";

// Deleting a type never deletes money records. They move to "other", so every
// total stays the same. "other" has nowhere to move them, so its records stay
// put and it only leaves the list.
export const DELETE = withUser(async ({ request, user }) => {
  const { searchParams } = new URL(request.url);
  const { name } = parseData(
    { name: searchParams.get("name") },
    vehicleExpenseTypeDeleteSchema,
  );
  if (name === "fuel") {
    throw new ApiError(409, "Fuel has its own records and cannot be deleted.");
  }

  if (name !== "other") {
    await Transaction.updateMany(
      { userId: user.id, bikeId: { $exists: true }, vehicleExpenseType: name },
      { $set: { vehicleExpenseType: "other" } },
    );
  }
  // A custom type exists only through its records, so it is gone by now.
  if (isBuiltInVehicleExpenseType(name)) {
    await UserSettings.updateOne(
      { userId: user.id },
      { $addToSet: { hiddenVehicleExpenseTypes: name } },
      { upsert: true },
    );
  }
  return new Response(null, { status: 204 });
});
