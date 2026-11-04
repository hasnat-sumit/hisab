import "server-only";

import type { TransactionType } from "../constants";
import { connectDB } from "../db";
import { monthRange, toISODate } from "../dates";
import { buildSummary, type MonthSummary } from "../finance";
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
  };
}

export async function getMonthSummary(
  userId: string,
  month: string,
): Promise<MonthSummary> {
  await connectDB();
  const { start, end } = monthRange(month);
  const totals = await Transaction.aggregate<{
    _id: TransactionType;
    total: number;
  }>([
    { $match: { userId, date: { $gte: start, $lt: end } } },
    { $group: { _id: "$type", total: { $sum: "$amount" } } },
  ]);
  const totalFor = (type: TransactionType) =>
    totals.find((t) => t._id === type)?.total ?? 0;
  return buildSummary(totalFor("income"), totalFor("expense"));
}

export async function getRecentTransactions(
  userId: string,
  limit = 5,
): Promise<TransactionDTO[]> {
  await connectDB();
  const docs = await Transaction.find({ userId })
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .lean<LeanTransaction[]>();
  return docs.map(toDTO);
}

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

/** Categories the user has already used, including custom ones. */
export async function getUsedCategories(
  userId: string,
  type: TransactionType,
): Promise<string[]> {
  await connectDB();
  return Transaction.distinct("category", { userId, type });
}
