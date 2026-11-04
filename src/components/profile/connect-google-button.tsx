"use client";

import { useState } from "react";
import { toast } from "sonner";

import { GoogleIcon } from "@/components/auth/google-button";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

/** Adds Google to an account the user has already proved is theirs. */
export function ConnectGoogleButton() {
  const [pending, setPending] = useState(false);

  async function connect() {
    setPending(true);
    const { error } = await authClient.linkSocial({
      provider: "google",
      callbackURL: "/profile",
    });
    if (error) {
      toast.error(error.message ?? "Could not connect Google.");
      setPending(false);
    }
  }

  return (
    <Button variant="outline" disabled={pending} onClick={connect}>
      <GoogleIcon />
      Connect Google
    </Button>
  );
}
