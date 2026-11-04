import "server-only";

import { ApiError, notFound } from "../api";
import { toISODate } from "../dates";
import { odometerError } from "../mileage";
import { Bike } from "../models/bike";
import { Transaction } from "../models/transaction";

/** Confirms the vehicle belongs to the user and can take new records. */
export async function assertOwnedVehicle(
  userId: string,
  bikeId: string,
  options: { allowArchived?: boolean } = {},
): Promise<void> {
  const bike = await Bike.findOne({ _id: bikeId, userId })
    .select({ archivedAt: 1 })
    .lean();
  if (!bike) throw notFound("Vehicle");
  if (bike.archivedAt && !options.allowArchived) {
    throw new ApiError(
      409,
      "This vehicle is archived. Restore it to add new records.",
    );
  }
}

/** Confirms the vehicle belongs to the user and the odometer reading fits. */
export async function assertValidFuelEntry(
  userId: string,
  entry: { bikeId: string; date: string; odometer: number },
  excludeEntryId?: string,
): Promise<void> {
  await assertOwnedVehicle(userId, entry.bikeId, {
    allowArchived: Boolean(excludeEntryId),
  });

  const others = await Transaction.find({
    userId,
    bikeId: entry.bikeId,
    vehicleExpenseType: "fuel",
    ...(excludeEntryId ? { _id: { $ne: excludeEntryId } } : {}),
  })
    .select({ date: 1, "fuel.odometer": 1 })
    .lean();

  const message = odometerError(
    others.map((other) => ({
      date: toISODate(other.date),
      odometer: other.fuel?.odometer ?? 0,
    })),
    entry,
  );
  if (message) {
    throw new ApiError(422, message, { odometer: message });
  }
}
