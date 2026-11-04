"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string };

/** A dropdown from a list of options, used by every form and filter. */
export function SimpleSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  invalid,
  label,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  invalid?: boolean;
  /** Accessible name, for selects that have no visible label. */
  label?: string;
  className?: string;
}) {
  return (
    <Select
      value={value || null}
      onValueChange={(next) => onChange(next ?? "")}
      items={options}
    >
      <SelectTrigger
        id={id}
        aria-label={label}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-11! w-full bg-card max-md:text-base md:h-10!",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        alignItemWithTrigger={false}
        className="max-h-[min(18rem,var(--available-height))]"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="py-3 max-md:text-base md:py-2"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
