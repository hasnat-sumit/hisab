"use client";

import { CircleAlert } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function AppError({ retry }: { retry: () => void }) {
  return (
    <EmptyState
      icon={CircleAlert}
      title="Something went wrong"
      description="We could not load this page. Check your connection and try again."
    >
      <Button variant="outline" onClick={() => retry()}>
        Try again
      </Button>
    </EmptyState>
  );
}
