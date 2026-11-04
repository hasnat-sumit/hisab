import { isObjectId, notFound, parseBody, withUser } from "@/lib/api";
import { toDate } from "@/lib/dates";
import { Transaction } from "@/lib/models/transaction";
import { transactionSchema } from "@/lib/validators";

type Params = { id: string };

export const PATCH = withUser<Params>(async ({ request, user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Transaction");
  const data = await parseBody(request, transactionSchema);

  const transaction = await Transaction.findOne({
    _id: params.id,
    userId: user.id,
  });
  if (!transaction) throw notFound("Transaction");

  transaction.type = data.type;
  transaction.date = toDate(data.date);
  transaction.category = data.category;
  transaction.amount = data.amount;
  transaction.note = data.note;
  await transaction.save();
  return Response.json({ id: transaction.id });
});

export const DELETE = withUser<Params>(async ({ user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Transaction");
  const deleted = await Transaction.findOneAndDelete({
    _id: params.id,
    userId: user.id,
  });
  if (!deleted) throw notFound("Transaction");
  return new Response(null, { status: 204 });
});
