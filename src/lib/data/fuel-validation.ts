import "server-only";

import { ApiError, notFound } from "../api";
import { toISODate } from "../dates";
import { odometerError } from "../mileage";
import { Bike } from "../models/bike";
import { FuelEntry } from "../models/fuel-entry";

/** Confirms the bike belongs to the user and the odometer reading fits. */
export async function assertValidFuelEntry(
  userId: string,
  entry: { bikeId: string; date: string; odometer: number },
  excludeEntryId?: string,
): Promise<void> {
  const bike = await Bike.exists({ _id: entry.bikeId, userId });
  if (!bike) throw notFound("Bike");

  const others = await FuelEntry.find({
    userId,
    bikeId: entry.bikeId,
    ...(excludeEntryId ? { _id: { $ne: excludeEntryId } } : {}),
  })
    .select({ date: 1, odometer: 1 })
    .lean();

  const message = odometerError(
    others.map((other) => ({
      date: toISODate(other.date),
      odometer: other.odometer,
    })),
    entry,
  );
  if (message) {
    throw new ApiError(422, message, { odometer: message });
  }
}
