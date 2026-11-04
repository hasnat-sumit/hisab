import mongoose, { Schema, type Model } from "mongoose";

import { TRANSACTION_TYPES, type TransactionType } from "../constants";

export type TransactionDoc = {
  userId: string;
  type: TransactionType;
  date: Date;
  category: string;
  amount: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
};

const transactionSchema = new Schema<TransactionDoc>(
  {
    userId: { type: String, required: true },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true, trim: true, maxlength: 40 },
    amount: { type: Number, required: true, min: 0.01 },
    note: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, date: -1, createdAt: -1 });
transactionSchema.index({ userId: 1, type: 1, category: 1, date: -1 });

export const Transaction: Model<TransactionDoc> =
  mongoose.models.Transaction ??
  mongoose.model<TransactionDoc>("Transaction", transactionSchema);
