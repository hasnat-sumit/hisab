"use client";

import { EditableChoiceChips } from "@/components/editable-choice-chips";
import { VEHICLE_CATEGORY, type TransactionType } from "@/lib/constants";

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
  const noun = type === "income" ? "income" : "expenses";

  // Vehicle expenses are added from the Vehicles page, linked to a vehicle.
  // A record being edited keeps showing its category, even a deleted one.
  const options = [
    ...categories,
    ...(value && !categories.includes(value) ? [value] : []),
  ]
    .filter((category) => category !== VEHICLE_CATEGORY)
    .map((category) => ({ value: category, label: category }));

  return (
    <EditableChoiceChips
      id={id}
      label="Category"
      noun="category"
      nounPlural="categories"
      options={options}
      value={value}
      onChange={onChange}
      onPicked={onPicked}
      invalid={invalid}
      deleteUrl={(category) =>
        `/api/categories?type=${type}&name=${encodeURIComponent(category)}`
      }
      deleteDescription={(category) =>
        category === "Other"
          ? `It leaves the list. Any ${noun} already in Other stay there, so your totals stay the same.`
          : `Any ${noun} in it move to Other, so your totals stay the same.`
      }
    />
  );
}
