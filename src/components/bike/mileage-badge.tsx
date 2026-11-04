import type { MileageQuality } from "@/lib/mileage";

/** Says how far a mileage figure can be trusted, in words rather than color. */
export function MileageBadge({ quality }: { quality: MileageQuality | null }) {
  if (!quality) return null;
  return (
    <span className="block text-xs text-muted-foreground">
      {quality === "reliable" ? "Reliable" : "Estimated"}
    </span>
  );
}
