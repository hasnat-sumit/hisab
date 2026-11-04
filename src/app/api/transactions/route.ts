import { parseBody, withUser } from "@/lib/api";
import { toDate } from "@/lib/dates";
import { Transaction } from "@/lib/models/transaction";
import { transactionSchema } from "@/lib/validators";

export const POST = withUser(async ({ request, user }) => {
  const data = await parseBody(request, transactionSchema);
  const transaction = await Transaction.create({
    ...data,
    date: toDate(data.date),
    userId: user.id,
  });
  return Response.json({ id: transaction.id }, { status: 201 });
});
