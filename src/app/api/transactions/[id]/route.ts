import { ApiError, isObjectId, notFound, parseBody, withUser } from "@/lib/api";
import { restoreCategory } from "@/lib/data/settings";
import { toDate } from "@/lib/dates";
import { Transaction } from "@/lib/models/transaction";
import { transactionSchema } from "@/lib/validators";

type Params = { id: string };

// Its amount and the loan must stay in step, so only the loan can change it.
const WRITE_OFF_MESSAGE = "This is a written-off loan. Undo the write-off from the Loans page.";

export const PATCH = withUser<Params>(async ({ request, user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Transaction");
  const data = await parseBody(request, transactionSchema);

  const transaction = await Transaction.findOne({
    _id: params.id,
    userId: user.id,
  });
  if (!transaction) throw notFound("Transaction");
  if (transaction.bikeId) {
    // Vehicle records keep extra rules, which their own routes apply.
    throw new ApiError(409, "Edit this expense from its vehicle.");
  }
  if (transaction.loanId) throw new ApiError(409, WRITE_OFF_MESSAGE);

  // Editing a record still in a deleted "Other" must not bring "Other" back.
  const categoryChanged =
    transaction.type !== data.type || transaction.category !== data.category;

  transaction.type = data.type;
  transaction.date = toDate(data.date);
  transaction.category = data.category;
  transaction.amount = data.amount;
  transaction.note = data.note;
  transaction.recurring = data.type === "expense" ? data.recurring : undefined;
  await transaction.save();
  if (categoryChanged) {
    await restoreCategory(user.id, data.type, data.category);
  }
  return Response.json({ id: transaction.id });
});

export const DELETE = withUser<Params>(async ({ user, params }) => {
  if (!isObjectId(params.id)) throw notFound("Transaction");
  const deleted = await Transaction.findOneAndDelete({
    _id: params.id,
    userId: user.id,
    loanId: { $exists: false },
  });
  if (!deleted) {
    const linked = await Transaction.exists({ _id: params.id, userId: user.id });
    throw linked ? new ApiError(409, WRITE_OFF_MESSAGE) : notFound("Transaction");
  }
  return new Response(null, { status: 204 });
});
