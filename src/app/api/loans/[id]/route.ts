import { ApiError, parseBody, withUser } from "@/lib/api";
import { fieldError, findOwnLoan, progressOf, saveLoan } from "@/lib/data/loans";
import { formatDate, toDate, toISODate } from "@/lib/dates";
import { formatTaka } from "@/lib/format";
import { Loan } from "@/lib/models/loan";
import { Transaction } from "@/lib/models/transaction";
import { loanUpdateSchema } from "@/lib/validators";

type Params = { id: string };

export const PATCH = withUser<Params>(async ({ request, user, params }) => {
  const data = await parseBody(request, loanUpdateSchema);
  const loan = await findOwnLoan(params.id, user.id);
  if (loan.writeOff) {
    throw new ApiError(409, "Undo the write-off before editing this loan.");
  }

  const { repaid } = progressOf(loan);
  if (data.amount < repaid) {
    throw fieldError(
      "amount",
      `${formatTaka(repaid)} has already been repaid, so the amount cannot be less.`,
    );
  }
  const firstRepayment = loan.repayments
    .map((repayment) => toISODate(repayment.date))
    .sort()[0];
  if (firstRepayment && data.date > firstRepayment) {
    throw fieldError(
      "date",
      `The first repayment was on ${formatDate(firstRepayment)}, so pick that day or earlier.`,
    );
  }

  loan.person = data.person;
  loan.amount = data.amount;
  loan.date = toDate(data.date);
  loan.note = data.note;
  await saveLoan(loan);
  return Response.json({ id: loan.id });
});

export const DELETE = withUser<Params>(async ({ user, params }) => {
  const loan = await findOwnLoan(params.id, user.id);
  // A written-off loan also has an expense, which goes with it.
  if (loan.writeOff) {
    await Transaction.deleteOne({
      _id: loan.writeOff.transactionId,
      userId: user.id,
    });
  }
  await Loan.deleteOne({ _id: loan._id, userId: user.id });
  return new Response(null, { status: 204 });
});
