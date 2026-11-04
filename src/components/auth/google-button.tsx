"use client";

import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.28-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.85 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.67-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.67 2.84C6.72 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function errorMessage(code: string | null): string | null {
  if (!code) return null;
  // Better Auth writes this code with spaces or underscores.
  if (code.replaceAll("_", " ").includes("not linked")) {
    return "An account with this email already exists. Log in with your password, then connect Google from your Profile.";
  }
  return "Google sign-in did not finish. Please try again.";
}

/** Works for both logging in and signing up: Google makes the account if new. */
export function GoogleButton() {
  const [pending, setPending] = useState(false);
  const message = errorMessage(useSearchParams().get("error"));

  async function signIn() {
    setPending(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/home",
      errorCallbackURL: "/login",
    });
    if (error) {
      toast.error(error.message ?? "Could not start Google sign-in.");
      setPending(false);
    }
  }

  return (
    <div className="grid gap-3">
      {message && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
      <Button variant="outline" disabled={pending} onClick={signIn}>
        {pending ? (
          <Loader2 className="animate-spin" aria-hidden />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
