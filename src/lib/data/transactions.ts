import "server-only";

import { cache } from "react";

import type { TransactionType } from "../constants";
import { connectDB } from "../db";
import { monthRange, toISODate } from "../dates";
import type { FinanceRow } from "../finance";
import { Transaction, type TransactionDoc } from "../models/transaction";
import type { TransactionDTO } from "../types";

type LeanTransaction = TransactionDoc & { _id: { toString(): string } };

function toDTO(doc: LeanTransaction): TransactionDTO {
  return {
    id: doc._id.toString(),
    type: doc.type,
    date: toISODate(doc.date),
    category: doc.category,
    amount: doc.amount,
    note: doc.note,
    paymentMethod: doc.paymentMethod,
    recurring: doc.recurring,
    bikeId: doc.bikeId?.toString(),
    vehicleExpenseType: doc.vehicleExpenseType,
    fuel: doc.fuel
      ? {
          odometer: doc.fuel.odometer,
          liters: doc.fuel.liters,
          pricePerLiter: doc.fuel.pricePerLiter,
          fullTank: doc.fuel.fullTank,
        }
      : undefined,
  };
}

/**
 * Totals by month, type and category, from which every summary, category list
 * and chart is worked out. One query, however much a page shows, and read once
 * per request.
 */
export const getFinanceRows = cache(
  async (userId: string): Promise<FinanceRow[]> => {
    await connectDB();
    const rows = await Transaction.aggregate<{
      _id: { month: string; type: TransactionType; category: string };
      total: number;
    }>([
      { $match: { userId } },
      {
        $group: {
          _id: {
            month: {
              $dateToString: { date: "$date", format: "%Y-%m", timezone: "UTC" },
            },
            type: "$type",
            category: "$category",
          },
          total: { $sum: "$amount" },
        },
      },
    ]);
    return rows.map(({ _id, total }) => ({
      month: _id.month,
      type: _id.type,
      category: _id.category,
      total,
    }));
  },
);

export async function listTransactions(
  userId: string,
  filters: { type: TransactionType; month: string; category?: string },
): Promise<TransactionDTO[]> {
  await connectDB();
  const { start, end } = monthRange(filters.month);
  const docs = await Transaction.find({
    userId,
    type: filters.type,
    date: { $gte: start, $lt: end },
    ...(filters.category ? { category: filters.category } : {}),
  })
    .sort({ date: -1, createdAt: -1 })
    .lean<LeanTransaction[]>();
  return docs.map(toDTO);
}
