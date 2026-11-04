import { isObjectId, notFound, withUser } from "@/lib/api";
import { Bike } from "@/lib/models/bike";

type Params = { id: string };

export const POST = withUser<Params>(async ({ user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Bike");
  const exists = await Bike.exists({ _id: params.id, userId: user.id });
  if (!exists) throw notFound("Bike");

  // Clear first: the unique index allows only one default at a time.
  await Bike.updateMany(
    { userId: user.id, isDefault: true },
    { isDefault: false },
  );
  await Bike.updateOne({ _id: params.id, userId: user.id }, { isDefault: true });
  return Response.json({ id: params.id });
});
