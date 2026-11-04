import { failOnDuplicate, isObjectId, notFound, parseBody, withUser } from "@/lib/api";
import { assertValidFuelEntry } from "@/lib/data/fuel-validation";
import { toDate } from "@/lib/dates";
import { FuelEntry } from "@/lib/models/fuel-entry";
import { fuelEntrySchema } from "@/lib/validators";
import { Types } from "mongoose";

type Params = { id: string };

export const PATCH = withUser<Params>(async ({ request, user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Fuel entry");
  const data = await parseBody(request, fuelEntrySchema);

  const entry = await FuelEntry.findOne({ _id: params.id, userId: user.id });
  if (!entry) throw notFound("Fuel entry");
  await assertValidFuelEntry(user.id, data, params.id);

  entry.bikeId = new Types.ObjectId(data.bikeId);
  entry.date = toDate(data.date);
  entry.odometer = data.odometer;
  entry.fuelQuantity = data.fuelQuantity;
  entry.totalCost = data.totalCost;
  await failOnDuplicate(
    () => entry.save(),
    "This fuel entry has already been saved.",
    "odometer",
  );
  return Response.json({ id: entry.id });
});

export const DELETE = withUser<Params>(async ({ user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Fuel entry");
  const deleted = await FuelEntry.findOneAndDelete({
    _id: params.id,
    userId: user.id,
  });
  if (!deleted) throw notFound("Fuel entry");
  return new Response(null, { status: 204 });
});
