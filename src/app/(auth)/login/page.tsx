import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { LogInForm } from "@/components/auth/log-in-form";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";

export const metadata: Metadata = { title: "Log in" };

export default function LogInPage() {
  return (
    <>
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      <AuthCard
        title="Welcome back"
        description="Log in to see your finances and vehicles."
        footerText="New to Hisab?"
        footerLinkHref="/signup"
        footerLinkLabel="Create an account"
      >
        <LogInForm />
        <GoogleSignIn label="Log in with Google" />
      </AuthCard>
    </>
  );
}
