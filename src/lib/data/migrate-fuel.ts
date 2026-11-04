import "server-only";

import type { Types } from "mongoose";

import { VEHICLE_CATEGORY } from "../constants";
import { connectDB } from "../db";
import { FuelEntry, type FuelEntryDoc } from "../models/fuel-entry";
import { Transaction } from "../models/transaction";
import { UserSettings } from "../models/user-settings";

type LeanFuelEntry = FuelEntryDoc & { _id: Types.ObjectId };

const finished = new Set<string>();

function isDuplicateOnly(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const { writeErrors } = error as { writeErrors?: { code?: number }[] };
  return (
    Array.isArray(writeErrors) &&
    writeErrors.length > 0 &&
    writeErrors.every((e) => e.code === 11000)
  );
}

/**
 * Copies a user's old fuel entries into transactions, once, the first time the
 * app sees them. It only ever adds records: the old entries stay where they
 * are, and a unique index stops two requests at once from copying one twice.
 * It is marked as done only after confirming that every entry has its copy.
 */
export async function migrateFuelIfNeeded(userId: string): Promise<void> {
  if (finished.has(userId)) return;
  await connectDB();

  const settings = await UserSettings.findOne({ userId })
    .select({ fuelCopiedAt: 1 })
    .lean();
  if (settings?.fuelCopiedAt) {
    finished.add(userId);
    return;
  }

  const legacy = await FuelEntry.find({ userId }).lean<LeanFuelEntry[]>();
  if (legacy.length > 0) {
    // The copy relies on this unique index, so make sure it exists first. It
    // matches the schema's index, and does nothing if that is already built.
    await Transaction.collection.createIndex(
      { legacyFuelEntryId: 1 },
      {
        unique: true,
        partialFilterExpression: { legacyFuelEntryId: { $exists: true } },
      },
    );
    try {
      // Straight to the collection, so exactly these fields are written.
      await Transaction.collection.bulkWrite(
        legacy.map((entry) => ({
          updateOne: {
            filter: { userId, legacyFuelEntryId: entry._id },
            update: {
              $setOnInsert: {
                userId,
                type: "expense",
                date: entry.date,
                category: VEHICLE_CATEGORY,
                amount: entry.totalCost,
                bikeId: entry.bikeId,
                vehicleExpenseType: "fuel",
                fuel: {
                  odometer: entry.odometer,
                  liters: entry.fuelQuantity,
                  ...(entry.totalCost > 0
                    ? {
                        pricePerLiter:
                          Math.round(
                            (entry.totalCost / entry.fuelQuantity) * 100,
                          ) / 100,
                      }
                    : {}),
                },
                legacyFuelEntryId: entry._id,
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt,
              },
            },
            upsert: true,
          },
        })),
        { ordered: false },
      );
    } catch (error) {
      // Another request copied the same entries first. Anything else is real.
      if (!isDuplicateOnly(error)) throw error;
    }

    const copied = await Transaction.collection.countDocuments({
      userId,
      legacyFuelEntryId: { $in: legacy.map((entry) => entry._id) },
    });
    if (copied !== legacy.length) {
      throw new Error(
        `Copied ${copied} of ${legacy.length} fuel entries. Will try again.`,
      );
    }
  }

  await UserSettings.updateOne(
    { userId },
    { $set: { fuelCopiedAt: new Date() } },
    { upsert: true },
  );
  finished.add(userId);
}
