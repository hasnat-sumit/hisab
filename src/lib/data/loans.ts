import "server-only";

import mongoose, { type HydratedDocument } from "mongoose";
import { cache } from "react";

import { ApiError, isObjectId, notFound } from "../api";
import { connectDB } from "../db";
import { toISODate } from "../dates";
import { loanProgress, type LoanProgress } from "../loans";
import { Loan, type LoanDoc } from "../models/loan";
import type { LoanDTO } from "../types";

export type LeanLoan = Omit<LoanDoc, "repayments"> & {
  _id: { toString(): string };
  repayments: { _id: { toString(): string }; amount: number; date: Date; note?: string }[];
};

export function toLoanDTO(doc: LeanLoan): LoanDTO {
  return {
    id: doc._id.toString(),
    direction: doc.direction,
    person: doc.person,
    amount: doc.amount,
    date: toISODate(doc.date),
    note: doc.note,
    repayments: [...doc.repayments]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((repayment) => ({
        id: repayment._id.toString(),
        amount: repayment.amount,
        date: toISODate(repayment.date),
        note: repayment.note,
      })),
    writeOff: doc.writeOff
      ? { date: toISODate(doc.writeOff.date), amount: doc.writeOff.amount }
      : undefined,
  };
}

type LoanDocument = HydratedDocument<LoanDoc>;

/** One of the user's loans, for an API route to change. */
export async function findOwnLoan(id: string, userId: string): Promise<LoanDocument> {
  if (!isObjectId(id)) throw notFound("Loan");
  const loan = await Loan.findOne({ _id: id, userId });
  if (!loan) throw notFound("Loan");
  return loan;
}

export function progressOf(loan: LoanDocument): LoanProgress {
  return loanProgress(toLoanDTO(loan.toObject() as unknown as LeanLoan));
}

/** Saves, refusing if another request changed the loan since it was read. */
export async function saveLoan(loan: LoanDocument): Promise<void> {
  try {
    await loan.save();
  } catch (error) {
    if (error instanceof mongoose.Error.VersionError) {
      throw new ApiError(
        409,
        "This loan was just changed somewhere else. Reload and try again.",
      );
    }
    throw error;
  }
}

/** A field error, shown under that field of the form. */
export function fieldError(field: string, message: string): ApiError {
  return new ApiError(422, message, { [field]: message });
}

/** Every loan, lent and borrowed, newest first, read once per request. */
export const getLoans = cache(async (userId: string): Promise<LoanDTO[]> => {
  await connectDB();
  const docs = await Loan.find({ userId })
    .sort({ date: -1, createdAt: -1 })
    .lean<LeanLoan[]>();
  return docs.map(toLoanDTO);
});
