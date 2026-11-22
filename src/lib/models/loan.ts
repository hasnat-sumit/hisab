import { Schema, type Types } from "mongoose";

import { LOAN_DIRECTIONS, type LoanDirection } from "../constants";
import { defineModel } from "./define-model";

export type RepaymentDoc = {
  _id: Types.ObjectId;
  amount: number;
  date: Date;
  note?: string;
};

export type WriteOffDoc = {
  date: Date;
  amount: number;
  /** The expense that records the lost money, so every total includes it. */
  transactionId: Types.ObjectId;
};

// Money lent to someone, or borrowed from them. It is never income or an
// expense: it only moves money between "in hand" and "lent out" or "owed".
export type LoanDoc = {
  userId: string;
  direction: LoanDirection;
  person: string;
  amount: number;
  date: Date;
  note?: string;
  repayments: Types.DocumentArray<RepaymentDoc & Types.Subdocument>;
  /** Only for money lent: the unpaid part, given up on. */
  writeOff?: WriteOffDoc;
  createdAt: Date;
  updatedAt: Date;
};

const repaymentSchema = new Schema<RepaymentDoc>({
  amount: { type: Number, required: true, min: 0.01 },
  date: { type: Date, required: true },
  note: { type: String, trim: true, maxlength: 200 },
});

const loanSchema = new Schema<LoanDoc>(
  {
    userId: { type: String, required: true },
    direction: { type: String, enum: LOAN_DIRECTIONS, required: true },
    person: { type: String, required: true, trim: true, maxlength: 60 },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true },
    note: { type: String, trim: true, maxlength: 200 },
    repayments: { type: [repaymentSchema], default: [] },
    writeOff: {
      type: new Schema<WriteOffDoc>(
        {
          date: { type: Date, required: true },
          amount: { type: Number, required: true, min: 0 },
          transactionId: { type: Schema.Types.ObjectId, required: true },
        },
        { _id: false },
      ),
    },
  },
  // Two repayments saved at once cannot both pass the "not more than owed" check.
  { timestamps: true, optimisticConcurrency: true },
);

loanSchema.index({ userId: 1, direction: 1, date: -1 });

export const Loan = defineModel("Loan", loanSchema);
