import "server-only";

import { cache } from "react";

import { connectDB } from "../db";
import { toISODate } from "../dates";
import { Bike, type BikeDoc } from "../models/bike";
import { Transaction, type TransactionDoc } from "../models/transaction";
import type { BikeDTO, VehicleExpenseDTO } from "../types";

type WithId<T> = T & { _id: { toString(): string } };

/** All the user's vehicles, including archived ones, read once per request. */
export const getBikes = cache(async (userId: string): Promise<BikeDTO[]> => {
  await connectDB();
  const docs = await Bike.find({ userId })
    .sort({ createdAt: 1 })
    .lean<WithId<BikeDoc>[]>();
  return docs.map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    vehicleType: doc.vehicleType ?? "bike",
    brand: doc.brand,
    model: doc.model,
    registrationNumber: doc.registrationNumber,
    purchaseDate: doc.purchaseDate ? toISODate(doc.purchaseDate) : undefined,
    archived: Boolean(doc.archivedAt),
  }));
});

/** Every vehicle expense, newest first, in one query for all vehicles. */
export const getVehicleExpenses = cache(
  async (userId: string): Promise<VehicleExpenseDTO[]> => {
    await connectDB();
    const docs = await Transaction.find({ userId, bikeId: { $exists: true } })
      .select({
        bikeId: 1,
        date: 1,
        amount: 1,
        note: 1,
        paymentMethod: 1,
        vehicleExpenseType: 1,
        fuel: 1,
      })
      .sort({ date: -1, createdAt: -1 })
      .lean<WithId<TransactionDoc>[]>();
    return docs.map((doc) => ({
      id: doc._id.toString(),
      bikeId: doc.bikeId?.toString() ?? "",
      date: toISODate(doc.date),
      expenseType: doc.vehicleExpenseType ?? "other",
      amount: doc.amount,
      note: doc.note,
      paymentMethod: doc.paymentMethod,
      fuel: doc.fuel
        ? {
            odometer: doc.fuel.odometer,
            liters: doc.fuel.liters,
            pricePerLiter: doc.fuel.pricePerLiter,
            fullTank: doc.fuel.fullTank,
          }
        : undefined,
    }));
  },
);
