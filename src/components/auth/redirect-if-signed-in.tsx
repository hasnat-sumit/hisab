import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/session";

/** Sends visitors who already have a valid session to the app. */
export async function RedirectIfSignedIn() {
  const user = await getSessionUser().catch(() => null);
  if (user) redirect("/home");
  return null;
}
