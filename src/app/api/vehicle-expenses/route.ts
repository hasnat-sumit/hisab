import { parseBody, withUser } from "@/lib/api";
import { VEHICLE_CATEGORY } from "@/lib/constants";
import { assertOwnedVehicle } from "@/lib/data/fuel-validation";
import { restoreVehicleExpenseType } from "@/lib/data/settings";
import { toDate } from "@/lib/dates";
import { Transaction } from "@/lib/models/transaction";
import { vehicleExpenseSchema } from "@/lib/validators";

export const POST = withUser(async ({ request, user }) => {
  const data = await parseBody(request, vehicleExpenseSchema);
  await assertOwnedVehicle(user.id, data.bikeId);

  const expense = await Transaction.create({
    userId: user.id,
    type: "expense",
    date: toDate(data.date),
    category: VEHICLE_CATEGORY,
    amount: data.amount,
    note: data.note,
    bikeId: data.bikeId,
    vehicleExpenseType: data.expenseType,
  });
  await restoreVehicleExpenseType(user.id, data.expenseType);
  return Response.json({ id: expense.id }, { status: 201 });
});
