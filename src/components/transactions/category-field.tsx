"use client";

import { useState } from "react";

import { ChoiceChips } from "@/components/choice-chips";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Input } from "@/components/ui/input";
import { VEHICLE_CATEGORY, type TransactionType } from "@/lib/constants";

const NEW_CATEGORY = "__new__";

/** Every category as a tappable choice, plus one to type a new one. */
export function CategoryField({
  id,
  type,
  categories,
  value,
  onChange,
  onPicked,
  invalid,
}: {
  id: string;
  type: TransactionType;
  categories: string[];
  value: string;
  onChange: (value: string) => void;
  /** Called after a choice from the list, to move on to the next field. */
  onPicked: () => void;
  invalid?: boolean;
}) {
  const [typing, setTyping] = useState(false);
  // Hides a deleted category straight away, before the page has refreshed.
  const [deleted, setDeleted] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const noun = type === "income" ? "income" : "expenses";

  if (typing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          id={id}
          autoFocus
          maxLength={40}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="New category name"
          aria-invalid={invalid || undefined}
        />
        <button
          type="button"
          className="min-h-10 shrink-0 text-xs text-muted-foreground underline underline-offset-3 md:min-h-0"
          onClick={() => {
            onChange("");
            setTyping(false);
          }}
        >
          Use list
        </button>
      </div>
    );
  }

  // Vehicle expenses are added from the Vehicles page, linked to a vehicle.
  // A record being edited keeps showing its category, even a deleted one.
  const options = [
    ...categories,
    ...(value && !categories.includes(value) ? [value] : []),
  ]
    .filter(
      (category) =>
        category !== VEHICLE_CATEGORY && !deleted.includes(category),
    )
    .map((category) => ({
      value: category,
      label: category,
      trailing: deleting && (
        <ConfirmDelete
          url={`/api/categories?type=${type}&name=${encodeURIComponent(category)}`}
          itemLabel={`Delete ${category} category`}
          title={`Delete the ${category} category?`}
          description={
            category === "Other"
              ? `It leaves the list. Any ${noun} already in Other stay there, so your totals stay the same.`
              : `Any ${noun} in it move to Other, so your totals stay the same.`
          }
          successMessage={`${category} deleted`}
          onDeleted={() => {
            setDeleted((names) => [...names, category]);
            if (value === category) onChange("");
          }}
        />
      ),
    }));

  return (
    <div className="grid gap-2">
      <ChoiceChips
        id={id}
        label="Category"
        value={value}
        invalid={invalid}
        options={[...options, { value: NEW_CATEGORY, label: "+ New" }]}
        onChange={(next) => {
          if (next === NEW_CATEGORY) {
            onChange("");
            setTyping(true);
            return;
          }
          onChange(next);
          onPicked();
        }}
      />
      {options.length > 0 && (
        <button
          type="button"
          onClick={() => setDeleting((on) => !on)}
          className="min-h-10 justify-self-start text-xs text-muted-foreground underline underline-offset-3 hover:text-foreground md:min-h-0"
        >
          {deleting ? "Done deleting" : "Delete categories"}
        </button>
      )}
    </div>
  );
}
