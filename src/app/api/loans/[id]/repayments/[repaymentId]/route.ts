import { ApiError, notFound, withUser } from "@/lib/api";
import { findOwnLoan, saveLoan } from "@/lib/data/loans";

type Params = { id: string; repaymentId: string };

export const DELETE = withUser<Params>(async ({ user, params }) => {
  const loan = await findOwnLoan(params.id, user.id);
  if (loan.writeOff) {
    throw new ApiError(409, "Undo the write-off before changing repayments.");
  }
  const repayment = loan.repayments.id(params.repaymentId);
  if (!repayment) throw notFound("Repayment");

  repayment.deleteOne();
  await saveLoan(loan);
  return new Response(null, { status: 204 });
});
