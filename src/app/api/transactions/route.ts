import { parseBody, withUser } from "@/lib/api";
import { restoreCategory } from "@/lib/data/settings";
import { toDate } from "@/lib/dates";
import { Transaction } from "@/lib/models/transaction";
import { transactionSchema } from "@/lib/validators";

export const POST = withUser(async ({ request, user }) => {
  const data = await parseBody(request, transactionSchema);
  const transaction = await Transaction.create({
    ...data,
    // A repeat flag only makes sense on money going out.
    ...(data.type === "income" ? { recurring: undefined } : {}),
    date: toDate(data.date),
    userId: user.id,
  });
  await restoreCategory(user.id, data.type, data.category);
  return Response.json({ id: transaction.id }, { status: 201 });
});
