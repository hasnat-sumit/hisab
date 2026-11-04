import assert from "node:assert/strict";
import { test } from "node:test";

import mongoose, { Schema } from "mongoose";

test("a model left over from before a code reload is replaced", async () => {
  // What a running dev server holds after the schema changes in the code.
  mongoose.model("Transaction", new Schema({ userId: String }));

  const { Transaction } = await import("./models/transaction");

  assert.ok(Transaction.schema.path("bikeId"), "uses the current schema");
  assert.equal(mongoose.models.Transaction, Transaction);
});
