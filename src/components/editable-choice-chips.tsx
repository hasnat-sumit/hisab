"use client";

import { useState } from "react";

import { ChoiceChips, type ChipOption } from "@/components/choice-chips";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Input } from "@/components/ui/input";

const NEW_OPTION = "__new__";

/** Tappable choices the user can add to by typing, and delete from. */
export function EditableChoiceChips({
  id,
  label,
  noun,
  nounPlural,
  options,
  value,
  onChange,
  onPicked,
  invalid,
  deleteUrl,
  deleteDescription,
}: {
  id: string;
  label: string;
  /** What one choice is called, e.g. "category". */
  noun: string;
  nounPlural: string;
  options: readonly ChipOption[];
  value: string;
  onChange: (value: string) => void;
  /** Called after a choice from the list, to move on to the next field. */
  onPicked?: () => void;
  invalid?: boolean;
  deleteUrl: (value: string) => string;
  /** Tells the user what happens to the records using this choice. */
  deleteDescription: (value: string) => string;
}) {
  const [typing, setTyping] = useState(false);
  // Hides a deleted choice straight away, before the page has refreshed.
  const [deleted, setDeleted] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  if (typing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          id={id}
          autoFocus
          maxLength={40}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`New ${noun} name`}
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

  const chips = options
    .filter((option) => !deleted.includes(option.value))
    .map((option) => ({
      ...option,
      trailing: deleting && (
        <ConfirmDelete
          url={deleteUrl(option.value)}
          itemLabel={`Delete ${option.label} ${noun}`}
          title={`Delete the ${option.label} ${noun}?`}
          description={deleteDescription(option.value)}
          successMessage={`${option.label} deleted`}
          onDeleted={() => {
            setDeleted((values) => [...values, option.value]);
            if (value === option.value) onChange("");
          }}
        />
      ),
    }));

  return (
    <div className="grid gap-2">
      <ChoiceChips
        id={id}
        label={label}
        value={value}
        invalid={invalid}
        options={[...chips, { value: NEW_OPTION, label: "+ New" }]}
        onChange={(next) => {
          if (next === NEW_OPTION) {
            onChange("");
            setTyping(true);
            return;
          }
          onChange(next);
          onPicked?.();
        }}
      />
      {chips.length > 0 && (
        <button
          type="button"
          onClick={() => setDeleting((on) => !on)}
          className="min-h-10 justify-self-start text-xs text-muted-foreground underline underline-offset-3 hover:text-foreground md:min-h-0"
        >
          {deleting ? "Done deleting" : `Delete ${nounPlural}`}
        </button>
      )}
    </div>
  );
}
