import { z } from "zod";

import { isObjectId, notFound, parseBody, withUser } from "@/lib/api";
import { Bike } from "@/lib/models/bike";

type Params = { id: string };

const archiveSchema = z.object({ archived: z.boolean() });

export const POST = withUser<Params>(async ({ request, user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Vehicle");
  const { archived } = await parseBody(request, archiveSchema);

  const updated = await Bike.findOneAndUpdate(
    { _id: params.id, userId: user.id },
    archived ? { $set: { archivedAt: new Date() } } : { $unset: { archivedAt: "" } },
  );
  if (!updated) throw notFound("Vehicle");
  return Response.json({ id: params.id });
});
