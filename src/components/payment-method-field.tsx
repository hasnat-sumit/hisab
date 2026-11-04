"use client";

import { SimpleSelect } from "@/components/simple-select";
import { PAYMENT_METHODS } from "@/lib/constants";

const NOT_SET = "not-set";
const OPTIONS = [{ value: NOT_SET, label: "Not specified" }, ...PAYMENT_METHODS];

export function PaymentMethodField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <SimpleSelect
      id={id}
      value={value || NOT_SET}
      onChange={(next) => onChange(next === NOT_SET ? "" : next)}
      options={OPTIONS}
    />
  );
}
