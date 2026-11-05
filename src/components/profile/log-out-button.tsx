"use client";

import { Loader2, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function LogOutButton() {
  const [pending, setPending] = useState(false);

  async function logOut() {
    setPending(true);
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error.message ?? "Could not log out.");
      setPending(false);
      return;
    }
    // A full page load, so no personal data stays in the browser's memory.
    window.location.replace("/login");
  }

  return (
    <Button
      disabled={pending}
      onClick={logOut}
      className="bg-destructive text-primary-foreground hover:bg-destructive/85"
    >
      {pending ? (
        <Loader2 className="animate-spin" aria-hidden />
      ) : (
        <LogOut aria-hidden />
      )}
      Log out
    </Button>
  );
}
