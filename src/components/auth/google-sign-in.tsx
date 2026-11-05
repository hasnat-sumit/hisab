import { connection } from "next/server";
import { Suspense } from "react";

import { GoogleButton } from "@/components/auth/google-button";
import { googleSignInEnabled } from "@/lib/auth";

async function GoogleSection({ label }: { label: string }) {
  // Read when the page is requested, as the keys may be added after a build.
  await connection();
  return <GoogleButton label={label} enabled={googleSignInEnabled()} />;
}

/** The Google option. Until its keys are set, it explains that it is not ready. */
export function GoogleSignIn({ label }: { label: string }) {
  return (
    <Suspense>
      <GoogleSection label={label} />
    </Suspense>
  );
}
