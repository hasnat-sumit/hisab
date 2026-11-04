import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { RedirectIfSignedIn } from "@/components/auth/redirect-if-signed-in";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <>
      <Suspense>
        <RedirectIfSignedIn />
      </Suspense>
      <AuthCard
        title="Create your account"
        description="Start tracking your money and your bike."
        footerText="Already have an account?"
        footerLinkHref="/login"
        footerLinkLabel="Log in"
      >
        <SignUpForm />
      </AuthCard>
    </>
  );
}
