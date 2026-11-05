import { Types } from "mongoose";

import { isObjectId, notFound, parseBody, withUser } from "@/lib/api";
import { assertOwnedVehicle } from "@/lib/data/fuel-validation";
import { restoreVehicleExpenseType } from "@/lib/data/settings";
import { toDate } from "@/lib/dates";
import { Transaction } from "@/lib/models/transaction";
import { vehicleExpenseSchema } from "@/lib/validators";

type Params = { id: string };

// Fuel has its own route, because it also has to keep its readings consistent.
const nonFuelExpense = (id: string, userId: string) => ({
  _id: id,
  userId,
  bikeId: { $exists: true },
  vehicleExpenseType: { $ne: "fuel" as const },
});

export const PATCH = withUser<Params>(async ({ request, user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Expense");
  const data = await parseBody(request, vehicleExpenseSchema);

  const expense = await Transaction.findOne(nonFuelExpense(params.id, user.id));
  if (!expense) throw notFound("Expense");
  await assertOwnedVehicle(user.id, data.bikeId, { allowArchived: true });

  // Editing a record still in a deleted "other" must not bring "other" back.
  const typeChanged = expense.vehicleExpenseType !== data.expenseType;

  expense.bikeId = new Types.ObjectId(data.bikeId);
  expense.date = toDate(data.date);
  expense.amount = data.amount;
  expense.note = data.note;
  expense.vehicleExpenseType = data.expenseType;
  await expense.save();
  if (typeChanged) await restoreVehicleExpenseType(user.id, data.expenseType);
  return Response.json({ id: expense.id });
});

export const DELETE = withUser<Params>(async ({ user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Expense");
  const deleted = await Transaction.findOneAndDelete(
    nonFuelExpense(params.id, user.id),
  );
  if (!deleted) throw notFound("Expense");
  return new Response(null, { status: 204 });
});
