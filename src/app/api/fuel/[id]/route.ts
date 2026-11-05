import { Types } from "mongoose";

import { failOnDuplicate, isObjectId, notFound, parseBody, withUser } from "@/lib/api";
import { assertValidFuelEntry } from "@/lib/data/fuel-validation";
import { toDate } from "@/lib/dates";
import { Transaction } from "@/lib/models/transaction";
import { fuelEntrySchema } from "@/lib/validators";

type Params = { id: string };

export const PATCH = withUser<Params>(async ({ request, user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Fuel entry");
  const data = await parseBody(request, fuelEntrySchema);

  const entry = await Transaction.findOne({
    _id: params.id,
    userId: user.id,
    vehicleExpenseType: "fuel",
  });
  if (!entry) throw notFound("Fuel entry");
  await assertValidFuelEntry(user.id, data, params.id);

  entry.bikeId = new Types.ObjectId(data.bikeId);
  entry.date = toDate(data.date);
  entry.amount = data.totalCost;
  entry.note = data.note;
  entry.fuel = {
    odometer: data.odometer,
    liters: data.fuelQuantity,
    pricePerLiter: data.pricePerLiter,
    fullTank: data.fullTank,
  };
  await failOnDuplicate(
    () => entry.save(),
    "This fuel entry has already been saved.",
    "odometer",
  );
  return Response.json({ id: entry.id });
});

export const DELETE = withUser<Params>(async ({ user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Fuel entry");
  const deleted = await Transaction.findOneAndDelete({
    _id: params.id,
    userId: user.id,
    vehicleExpenseType: "fuel",
  });
  if (!deleted) throw notFound("Fuel entry");
  return new Response(null, { status: 204 });
});
