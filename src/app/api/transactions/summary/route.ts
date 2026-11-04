import { ApiError, withUser } from "@/lib/api";
import { getFinanceRows } from "@/lib/data/transactions";
import { isValidMonth } from "@/lib/dates";
import { categoryBreakdown } from "@/lib/finance";

/** The month's category totals, for the live preview in the entry forms. */
export const GET = withUser(async ({ request, user }) => {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? "";
  const type = searchParams.get("type") === "income" ? "income" : "expense";
  if (!isValidMonth(month)) throw new ApiError(422, "Choose a valid month.");

  const rows = await getFinanceRows(user.id);
  return Response.json(categoryBreakdown(rows, month, type));
});
