import { parseBody, withUser } from "@/lib/api";
import { toDate } from "@/lib/dates";
import { Loan } from "@/lib/models/loan";
import { loanSchema } from "@/lib/validators";

export const POST = withUser(async ({ request, user }) => {
  const data = await parseBody(request, loanSchema);
  const loan = await Loan.create({
    userId: user.id,
    direction: data.direction,
    person: data.person,
    amount: data.amount,
    date: toDate(data.date),
    note: data.note,
  });
  return Response.json({ id: loan.id }, { status: 201 });
});
