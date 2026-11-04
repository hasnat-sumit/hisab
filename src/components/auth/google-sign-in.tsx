import { connection } from "next/server";
import { Suspense } from "react";

import { GoogleButton } from "@/components/auth/google-button";
import { googleSignInEnabled } from "@/lib/auth";

async function GoogleSection() {
  // Read when the page is requested, as the keys may be added after a build.
  await connection();
  return googleSignInEnabled() ? <GoogleButton /> : null;
}

/** The Google option, shown only once its keys have been set up. */
export function GoogleSignIn() {
  return (
    <Suspense>
      <GoogleSection />
    </Suspense>
  );
}
