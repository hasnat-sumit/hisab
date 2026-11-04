import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getAuth } from "./auth";
import { migrateFuelIfNeeded } from "./data/migrate-fuel";
import type { SessionUser } from "./types";

/** The signed-in user for this request, read once however often it is called. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  // Read the request first: it keeps this out of prerendering at build time,
  // when the auth environment variables may not be available.
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) return null;
  const { id, name, email } = session.user;
  return { id, name, email };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await migrateFuelIfNeeded(user.id);
  return user;
}
