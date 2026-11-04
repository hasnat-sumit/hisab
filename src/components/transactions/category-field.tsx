"use client";

import { useState } from "react";

import { SimpleSelect } from "@/components/simple-select";
import { Input } from "@/components/ui/input";
import { categoryOptions, type TransactionType } from "@/lib/constants";

const NEW_CATEGORY = "__new__";

/** Category dropdown whose last option lets the user type their own. */
export function CategoryField({
  id,
  type,
  usedCategories,
  value,
  onChange,
  onPicked,
  invalid,
}: {
  id: string;
  type: TransactionType;
  usedCategories: string[];
  value: string;
  onChange: (value: string) => void;
  /** Called after a choice from the list, to move on to the next field. */
  onPicked: () => void;
  invalid?: boolean;
}) {
  const [typing, setTyping] = useState(false);

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

  const options = categoryOptions(type, [
    ...usedCategories,
    ...(value ? [value] : []),
  ]).map((category) => ({ value: category, label: category }));

  return (
    <SimpleSelect
      id={id}
      value={value}
      invalid={invalid}
      placeholder="Choose a category"
      options={[...options, { value: NEW_CATEGORY, label: "+ New category" }]}
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
  );
}
