import type { VehicleExpenseType } from "./constants";
import { roundMoney } from "./finance";
import type { FuelEntryDTO, VehicleExpenseDTO } from "./types";

export type VehicleTotals = {
  total: number;
  byType: Partial<Record<VehicleExpenseType, number>>;
};

/** `period` is a month ("2026-11"), a year ("2026") or empty for all time. */
export function vehicleTotals(
  records: VehicleExpenseDTO[],
  period = "",
  bikeId?: string,
): VehicleTotals {
  const byType: VehicleTotals["byType"] = {};
  let total = 0;
  for (const record of records) {
    if (!record.date.startsWith(period)) continue;
    if (bikeId && record.bikeId !== bikeId) continue;
    byType[record.expenseType] = roundMoney(
      (byType[record.expenseType] ?? 0) + record.amount,
    );
    total += record.amount;
  }
  return { total: roundMoney(total), byType };
}

export function fuelEntriesFor(
  records: VehicleExpenseDTO[],
  bikeId: string,
): FuelEntryDTO[] {
  const entries: FuelEntryDTO[] = [];
  for (const record of records) {
    if (record.bikeId !== bikeId || !record.fuel) continue;
    entries.push({
      id: record.id,
      bikeId: record.bikeId,
      date: record.date,
      odometer: record.fuel.odometer,
      fuelQuantity: record.fuel.liters,
      totalCost: record.amount,
      pricePerLiter: record.fuel.pricePerLiter,
      fullTank: record.fuel.fullTank,
      note: record.note,
    });
  }
  return entries;
}
