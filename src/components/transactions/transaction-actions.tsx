"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { FuelDialog } from "@/components/bike/fuel-dialog";
import { VehicleExpenseDialog } from "@/components/bike/vehicle-expense-dialog";
import { ConfirmDelete } from "@/components/confirm-delete";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { Button } from "@/components/ui/button";
import {
  vehicleExpenseLabel,
  type VehicleExpenseTypeOption,
} from "@/lib/constants";
import { formatTaka } from "@/lib/format";
import type { BikeDTO, FuelEntryDTO, TransactionDTO } from "@/lib/types";

/** Edits in the form that fits the record, whichever list it is shown in. */
function EditDialog({
  transaction,
  categories,
  expenseTypes,
  bikes,
  open,
  onOpenChange,
}: {
  transaction: TransactionDTO;
  categories: string[];
  expenseTypes: VehicleExpenseTypeOption[];
  bikes: BikeDTO[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { bikeId, fuel, vehicleExpenseType } = transaction;
  if (bikeId && fuel) {
    const entry: FuelEntryDTO = {
      id: transaction.id,
      bikeId,
      date: transaction.date,
      odometer: fuel.odometer,
      fuelQuantity: fuel.liters,
      totalCost: transaction.amount,
      pricePerLiter: fuel.pricePerLiter,
      fullTank: fuel.fullTank,
      note: transaction.note,
    };
    return (
      <FuelDialog
        open={open}
        onOpenChange={onOpenChange}
        bikes={bikes}
        bikeId={bikeId}
        entry={entry}
      />
    );
  }
  if (bikeId && vehicleExpenseType) {
    return (
      <VehicleExpenseDialog
        open={open}
        onOpenChange={onOpenChange}
        bikes={bikes}
        bikeId={bikeId}
        expenseTypes={expenseTypes}
        expense={{
          id: transaction.id,
          bikeId,
          date: transaction.date,
          expenseType: vehicleExpenseType,
          amount: transaction.amount,
          note: transaction.note,
        }}
      />
    );
  }
  return (
    <TransactionDialog
      open={open}
      onOpenChange={onOpenChange}
      type={transaction.type}
      transaction={transaction}
      categories={categories}
    />
  );
}

export function TransactionActions({
  transaction,
  categories,
  expenseTypes,
  bikes,
}: {
  transaction: TransactionDTO;
  categories: string[];
  expenseTypes: VehicleExpenseTypeOption[];
  bikes: BikeDTO[];
}) {
  const [editing, setEditing] = useState(false);
  const noun = transaction.type === "income" ? "income" : "expense";
  const name = transaction.vehicleExpenseType
    ? vehicleExpenseLabel(transaction.vehicleExpenseType)
    : transaction.category;
  return (
    <div className="flex shrink-0 max-md:-mr-2">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Edit ${name} ${noun}`}
        className="text-muted-foreground"
        onClick={() => setEditing(true)}
      >
        <Pencil aria-hidden />
      </Button>
      <EditDialog
        transaction={transaction}
        categories={categories}
        expenseTypes={expenseTypes}
        bikes={bikes}
        open={editing}
        onOpenChange={setEditing}
      />
      <ConfirmDelete
        url={`/api/transactions/${transaction.id}`}
        itemLabel={`Delete ${name} ${noun}`}
        title={`Delete this ${noun}?`}
        description={`${name}, ${formatTaka(transaction.amount)}. This cannot be undone.`}
        successMessage={`${noun === "income" ? "Income" : "Expense"} deleted`}
      />
    </div>
  );
}
