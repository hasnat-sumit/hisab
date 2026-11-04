import { failOnDuplicate, parseBody, withUser } from "@/lib/api";
import { assertValidFuelEntry } from "@/lib/data/fuel-validation";
import { toDate } from "@/lib/dates";
import { FuelEntry } from "@/lib/models/fuel-entry";
import { fuelEntrySchema } from "@/lib/validators";

export const POST = withUser(async ({ request, user }) => {
  const data = await parseBody(request, fuelEntrySchema);
  await assertValidFuelEntry(user.id, data);

  const entry = await failOnDuplicate(
    () =>
      FuelEntry.create({ ...data, date: toDate(data.date), userId: user.id }),
    "This fuel entry has already been saved.",
    "odometer",
  );
  return Response.json({ id: entry.id }, { status: 201 });
});
