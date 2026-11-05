import { failOnDuplicate, parseBody, withUser } from "@/lib/api";
import { VEHICLE_CATEGORY } from "@/lib/constants";
import { assertValidFuelEntry } from "@/lib/data/fuel-validation";
import { toDate } from "@/lib/dates";
import { Transaction } from "@/lib/models/transaction";
import { fuelEntrySchema } from "@/lib/validators";

export const POST = withUser(async ({ request, user }) => {
  const data = await parseBody(request, fuelEntrySchema);
  await assertValidFuelEntry(user.id, data);

  const entry = await failOnDuplicate(
    () =>
      Transaction.create({
        userId: user.id,
        type: "expense",
        date: toDate(data.date),
        category: VEHICLE_CATEGORY,
        amount: data.totalCost,
        note: data.note,
        bikeId: data.bikeId,
        vehicleExpenseType: "fuel",
        fuel: {
          odometer: data.odometer,
          liters: data.fuelQuantity,
          pricePerLiter: data.pricePerLiter,
          fullTank: data.fullTank,
        },
      }),
    "This fuel entry has already been saved.",
    "odometer",
  );
  return Response.json({ id: entry.id }, { status: 201 });
});
