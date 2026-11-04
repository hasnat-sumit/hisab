import "server-only";

import { connectDB } from "../db";
import { toISODate } from "../dates";
import { Bike, type BikeDoc } from "../models/bike";
import { FuelEntry, type FuelEntryDoc } from "../models/fuel-entry";
import type { BikeDTO, FuelEntryDTO } from "../types";

type WithId<T> = T & { _id: { toString(): string } };

export async function getBikes(userId: string): Promise<BikeDTO[]> {
  await connectDB();
  const docs = await Bike.find({ userId })
    .sort({ isDefault: -1, createdAt: 1 })
    .lean<WithId<BikeDoc>[]>();
  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    brand: doc.brand,
    model: doc.model,
    registrationNumber: doc.registrationNumber,
    purchaseDate: doc.purchaseDate ? toISODate(doc.purchaseDate) : undefined,
    isDefault: doc.isDefault,
  }));
}

export async function getFuelEntries(
  userId: string,
  bikeId: string,
): Promise<FuelEntryDTO[]> {
  await connectDB();
  const docs = await FuelEntry.find({ userId, bikeId }).lean<
    WithId<FuelEntryDoc>[]
  >();
  return docs.map((doc) => ({
    id: doc._id.toString(),
    bikeId: doc.bikeId.toString(),
    date: toISODate(doc.date),
    odometer: doc.odometer,
    fuelQuantity: doc.fuelQuantity,
    totalCost: doc.totalCost,
  }));
}
