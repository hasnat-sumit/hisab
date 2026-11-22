import { ApiError, parseBody, withUser } from "@/lib/api";
import { fieldError, findOwnLoan, progressOf, saveLoan } from "@/lib/data/loans";
import { formatDate, toDate, toISODate } from "@/lib/dates";
import { formatTaka } from "@/lib/format";
import { repaymentSchema } from "@/lib/validators";

type Params = { id: string };

export const POST = withUser<Params>(async ({ request, user, params }) => {
  const data = await parseBody(request, repaymentSchema);
  const loan = await findOwnLoan(params.id, user.id);
  if (loan.writeOff) {
    throw new ApiError(409, "Undo the write-off before adding a repayment.");
  }

  const { outstanding } = progressOf(loan);
  if (outstanding === 0) {
    throw new ApiError(409, "This loan has already been fully repaid.");
  }
  if (data.amount > outstanding) {
    throw fieldError("amount", `Only ${formatTaka(outstanding)} is left to repay.`);
  }
  const loanDate = toISODate(loan.date);
  if (data.date < loanDate) {
    throw fieldError(
      "date",
      `The loan was on ${formatDate(loanDate)}, so pick that day or later.`,
    );
  }

  loan.repayments.push({
    amount: data.amount,
    date: toDate(data.date),
    note: data.note,
  });
  await saveLoan(loan);
  return Response.json({ id: loan.id }, { status: 201 });
});
