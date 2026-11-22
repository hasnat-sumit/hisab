import { ApiError, parseBody, withUser } from "@/lib/api";
import { fieldError, findOwnLoan, progressOf, saveLoan } from "@/lib/data/loans";
import { formatDate, toDate, toISODate } from "@/lib/dates";
import { LOAN_WRITE_OFF_CATEGORY } from "@/lib/constants";
import { Transaction } from "@/lib/models/transaction";
import { writeOffSchema } from "@/lib/validators";

type Params = { id: string };

// Giving up on money lent: the unpaid part becomes an expense on that day, so
// it counts in every expense total and chart. Until then it was "lent out".
export const POST = withUser<Params>(async ({ request, user, params }) => {
  const { date } = await parseBody(request, writeOffSchema);
  const loan = await findOwnLoan(params.id, user.id);
  if (loan.direction !== "lent") {
    throw new ApiError(409, "Only money you lent can be written off.");
  }
  if (loan.writeOff) throw new ApiError(409, "This loan is already written off.");

  const { outstanding } = progressOf(loan);
  if (outstanding === 0) {
    throw new ApiError(409, "This loan has been fully repaid, so there is nothing to write off.");
  }
  const loanDate = toISODate(loan.date);
  if (date < loanDate) {
    throw fieldError("date", `The loan was on ${formatDate(loanDate)}, so pick that day or later.`);
  }

  const expense = await Transaction.create({
    userId: user.id,
    type: "expense",
    date: toDate(date),
    category: LOAN_WRITE_OFF_CATEGORY,
    amount: outstanding,
    note: `Loan to ${loan.person}`,
    loanId: loan._id,
  });
  loan.writeOff = { date: toDate(date), amount: outstanding, transactionId: expense._id };
  try {
    await saveLoan(loan);
  } catch (error) {
    // Don't leave an expense that no loan points to.
    await Transaction.deleteOne({ _id: expense._id }).catch(console.error);
    throw error;
  }
  return Response.json({ id: loan.id });
});

export const DELETE = withUser<Params>(async ({ user, params }) => {
  const loan = await findOwnLoan(params.id, user.id);
  if (!loan.writeOff) throw new ApiError(409, "This loan is not written off.");

  await Transaction.deleteOne({ _id: loan.writeOff.transactionId, userId: user.id });
  loan.writeOff = undefined;
  await saveLoan(loan);
  return new Response(null, { status: 204 });
});
