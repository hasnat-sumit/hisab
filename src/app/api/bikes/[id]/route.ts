import { failOnDuplicate, isObjectId, notFound, parseBody, withUser } from "@/lib/api";
import { toDate } from "@/lib/dates";
import { Bike } from "@/lib/models/bike";
import { BikeDocument } from "@/lib/models/bike-document";
import { FuelEntry } from "@/lib/models/fuel-entry";
import { bikeSchema } from "@/lib/validators";

type Params = { id: string };

export const PATCH = withUser<Params>(async ({ request, user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Bike");
  const data = await parseBody(request, bikeSchema);

  const bike = await Bike.findOne({ _id: params.id, userId: user.id });
  if (!bike) throw notFound("Bike");

  // Fields left empty in the form come through as undefined and get cleared.
  bike.set({
    name: data.name,
    brand: data.brand,
    model: data.model,
    registrationNumber: data.registrationNumber,
    purchaseDate: data.purchaseDate ? toDate(data.purchaseDate) : undefined,
  });
  await failOnDuplicate(
    () => bike.save(),
    "You already have a bike with this name.",
    "name",
  );
  return Response.json({ id: bike.id });
});

export const DELETE = withUser<Params>(async ({ user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Bike");
  const bike = await Bike.findOneAndDelete({ _id: params.id, userId: user.id });
  if (!bike) throw notFound("Bike");

  // Fuel entries mean nothing without their bike. Documents such as a driving
  // licence are still useful, so they stay and just lose the link.
  await FuelEntry.deleteMany({ userId: user.id, bikeId: bike._id });
  await BikeDocument.updateMany(
    { userId: user.id, bikeId: bike._id },
    { $unset: { bikeId: "" } },
  );

  if (bike.isDefault) {
    await Bike.findOneAndUpdate(
      { userId: user.id },
      { isDefault: true },
      { sort: { createdAt: 1 } },
    );
  }
  return new Response(null, { status: 204 });
});
