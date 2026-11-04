import { failOnDuplicate, parseBody, withUser } from "@/lib/api";
import { toDate } from "@/lib/dates";
import { Bike } from "@/lib/models/bike";
import { bikeSchema } from "@/lib/validators";

export const POST = withUser(async ({ request, user }) => {
  const data = await parseBody(request, bikeSchema);
  const hasDefault = await Bike.exists({ userId: user.id, isDefault: true });

  const bike = await failOnDuplicate(
    () =>
      Bike.create({
        ...data,
        purchaseDate: data.purchaseDate ? toDate(data.purchaseDate) : undefined,
        userId: user.id,
        isDefault: !hasDefault,
      }),
    "You already have a bike with this name.",
    "name",
  );
  return Response.json({ id: bike.id }, { status: 201 });
});
