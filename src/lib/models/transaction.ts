import { Schema, type Types } from "mongoose";

import {
  TRANSACTION_TYPES,
  type TransactionType,
  type VehicleExpenseType,
} from "../constants";
import { defineModel } from "./define-model";

export type FuelDetails = {
  odometer: number;
  liters: number;
  pricePerLiter?: number;
  /** True only when the tank was filled up. Unset on entries from before this existed. */
  fullTank?: boolean;
};

// The one record of every money movement. A vehicle expense is a transaction
// with a bikeId, and a fuel fill-up also has fuel details, so it can never be
// counted twice or fall out of step with the main expense totals.
export type TransactionDoc = {
  userId: string;
  type: TransactionType;
  date: Date;
  category: string;
  amount: number;
  note?: string;
  recurring?: boolean;
  bikeId?: Types.ObjectId;
  vehicleExpenseType?: VehicleExpenseType;
  fuel?: FuelDetails;
  /** Set on records copied from the old fuel entries, so a copy is made once. */
  legacyFuelEntryId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const transactionSchema = new Schema<TransactionDoc>(
  {
    userId: { type: String, required: true },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true, trim: true, maxlength: 40 },
    // Zero is only reachable through a fuel entry with a recorded cost of 0.
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true, maxlength: 200 },
    recurring: { type: Boolean },
    bikeId: { type: Schema.Types.ObjectId, ref: "Bike" },
    vehicleExpenseType: { type: String, trim: true, maxlength: 40 },
    fuel: {
      type: new Schema<FuelDetails>(
        {
          odometer: { type: Number, required: true, min: 0 },
          liters: { type: Number, required: true, min: 0.001 },
          pricePerLiter: { type: Number, min: 0 },
          fullTank: { type: Boolean },
        },
        { _id: false },
      ),
    },
    legacyFuelEntryId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, date: -1, createdAt: -1 });
transactionSchema.index({ userId: 1, type: 1, category: 1, date: -1 });
transactionSchema.index({ userId: 1, bikeId: 1, date: -1 });
// Also stops the same fill-up being saved twice.
transactionSchema.index(
  { userId: 1, bikeId: 1, date: 1, "fuel.odometer": 1 },
  { unique: true, partialFilterExpression: { vehicleExpenseType: "fuel" } },
);
transactionSchema.index(
  { legacyFuelEntryId: 1 },
  {
    unique: true,
    partialFilterExpression: { legacyFuelEntryId: { $exists: true } },
  },
);

export const Transaction = defineModel("Transaction", transactionSchema);
