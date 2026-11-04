import { ApiError, failOnDuplicate, isObjectId, notFound, parseBody, withUser } from "@/lib/api";
import { toDate } from "@/lib/dates";
import { Bike } from "@/lib/models/bike";
import { BikeDocument } from "@/lib/models/bike-document";
import { Transaction } from "@/lib/models/transaction";
import { bikeSchema } from "@/lib/validators";

type Params = { id: string };

export const PATCH = withUser<Params>(async ({ request, user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Vehicle");
  const data = await parseBody(request, bikeSchema);

  const bike = await Bike.findOne({ _id: params.id, userId: user.id });
  if (!bike) throw notFound("Vehicle");

  // Fields left empty in the form come through as undefined and get cleared.
  bike.set({
    name: data.name,
    vehicleType: data.vehicleType,
    brand: data.brand,
    model: data.model,
    registrationNumber: data.registrationNumber,
    purchaseDate: data.purchaseDate ? toDate(data.purchaseDate) : undefined,
  });
  await failOnDuplicate(
    () => bike.save(),
    "You already have a vehicle with this name.",
    "name",
  );
  return Response.json({ id: bike.id });
});

export const DELETE = withUser<Params>(async ({ user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Vehicle");
  const exists = await Bike.exists({ _id: params.id, userId: user.id });
  if (!exists) throw notFound("Vehicle");

  // Its expenses are part of the user's financial history, so a vehicle with
  // records can only be archived. Nothing financial is ever deleted with it.
  const records = await Transaction.countDocuments({
    userId: user.id,
    bikeId: params.id,
  });
  if (records > 0) {
    throw new ApiError(
      409,
      `This vehicle has ${records} expense ${records === 1 ? "record" : "records"}. Archive it instead, so your history stays.`,
    );
  }

  await Bike.deleteOne({ _id: params.id, userId: user.id });
  // Documents such as a driving licence stay useful, and just lose the link.
  await BikeDocument.updateMany(
    { userId: user.id, bikeId: params.id },
    { $unset: { bikeId: "" } },
  );
  return new Response(null, { status: 204 });
});
