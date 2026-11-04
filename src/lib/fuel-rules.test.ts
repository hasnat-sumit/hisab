import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  fuelStats,
  monthlyFuelStats,
  resolveFuelAmounts,
  withMileage,
  type FuelReading,
} from "./mileage";
import { fuelEntrySchema } from "./validators";

function reading(
  id: string,
  date: string,
  odometer: number,
  fuelQuantity = 5,
  totalCost = 600,
): FuelReading {
  return { id, date, odometer, fuelQuantity, totalCost };
}

const full = (id: string, date: string, odometer: number, liters: number) => ({
  ...reading(id, date, odometer, liters),
  fullTank: true,
});

describe("reliable and estimated mileage", () => {
  test("entries without a known full tank are estimates", () => {
    const rows = withMileage([
      reading("a", "2026-01-01", 1000),
      reading("b", "2026-01-10", 1200, 4),
    ]);
    assert.equal(rows[0].mileageQuality, null);
    assert.equal(rows[1].mileageQuality, "estimated");
  });

  test("two full tanks in a row are reliable", () => {
    const rows = withMileage([
      full("a", "2026-01-01", 1000, 10),
      full("b", "2026-01-10", 1300, 6),
    ]);
    assert.equal(rows[1].mileage, 50);
    assert.equal(rows[1].mileageQuality, "reliable");
  });

  test("partial fills between full tanks count towards the reliable figure", () => {
    const rows = withMileage([
      full("a", "2026-01-01", 1000, 10),
      reading("b", "2026-01-05", 1100, 2),
      full("c", "2026-01-10", 1400, 6),
    ]);
    assert.equal(rows[1].mileageQuality, "estimated");
    assert.equal(rows[1].mileage, 50);
    // 400 km on the 2 + 6 liters added after the first full tank.
    assert.equal(rows[2].mileage, 50);
    assert.equal(rows[2].mileageQuality, "reliable");
  });

  test("the average prefers reliable measurements and says so", () => {
    const stats = fuelStats([
      reading("a", "2026-01-01", 1000),
      reading("b", "2026-01-05", 1100, 10),
      full("c", "2026-01-10", 1200, 5),
      full("d", "2026-01-15", 1500, 10),
    ]);
    assert.equal(stats.averageMileage, 30);
    assert.equal(stats.mileageQuality, "reliable");
  });

  test("the average is labelled an estimate without two full tanks", () => {
    const stats = fuelStats([
      reading("a", "2026-01-01", 1000),
      reading("b", "2026-01-05", 1200, 4),
    ]);
    assert.equal(stats.averageMileage, 50);
    assert.equal(stats.mileageQuality, "estimated");
  });

  test("not enough data gives no mileage at all", () => {
    const stats = fuelStats([reading("a", "2026-01-01", 1000)]);
    assert.equal(stats.averageMileage, null);
    assert.equal(stats.mileageQuality, null);
  });

  test("a reading that has not moved gives no mileage", () => {
    const rows = withMileage([
      reading("a", "2026-01-01", 1000),
      reading("b", "2026-01-02", 1000),
    ]);
    assert.equal(rows[1].mileage, null);
    assert.equal(rows[1].mileageQuality, null);
  });

  test("deleting a middle entry recalculates what follows it", () => {
    const all = [
      reading("a", "2026-01-01", 1000),
      reading("b", "2026-01-05", 1100, 2),
      reading("c", "2026-01-10", 1300, 4),
    ];
    const rows = withMileage(all.filter((r) => r.id !== "b"));
    assert.equal(rows[1].distance, 300);
    assert.equal(rows[1].mileage, 75);
  });
});

describe("monthlyFuelStats", () => {
  test("adds up each month, newest first, with the average price", () => {
    const months = monthlyFuelStats([
      reading("a", "2026-01-01", 1000, 5, 600),
      reading("b", "2026-02-01", 1200, 4, 500),
      reading("c", "2026-02-20", 1400, 4, 500),
    ]);
    assert.deepEqual(months.map((m) => m.month), ["2026-02", "2026-01"]);
    assert.equal(months[0].totalCost, 1000);
    assert.equal(months[0].liters, 8);
    assert.equal(months[0].averagePrice, 125);
    assert.equal(months[0].mileage, 50);
    assert.equal(months[0].mileageQuality, "estimated");
    assert.equal(months[1].mileage, null);
  });
});

describe("resolveFuelAmounts", () => {
  test("amount and price give liters", () => {
    assert.deepEqual(resolveFuelAmounts({ totalCost: 500, pricePerLiter: 120 }), {
      totalCost: 500,
      pricePerLiter: 120,
      fuelQuantity: 4.167,
    });
  });

  test("liters and price give the amount", () => {
    assert.deepEqual(resolveFuelAmounts({ fuelQuantity: 5, pricePerLiter: 120 }), {
      totalCost: 600,
      pricePerLiter: 120,
      fuelQuantity: 5,
    });
  });

  test("amount and liters give the price", () => {
    assert.equal(
      resolveFuelAmounts({ totalCost: 500, fuelQuantity: 4 })?.pricePerLiter,
      125,
    );
  });

  test("with all three, the amount and liters win", () => {
    assert.deepEqual(
      resolveFuelAmounts({ totalCost: 500, pricePerLiter: 999, fuelQuantity: 4 }),
      { totalCost: 500, pricePerLiter: 125, fuelQuantity: 4 },
    );
  });

  test("a typed price survives being worked out and checked again", () => {
    const first = resolveFuelAmounts({ totalCost: 500, pricePerLiter: 120 });
    assert.equal(first?.fuelQuantity, 4.167);
    // The form sends its result to the server, which checks it the same way.
    assert.deepEqual(resolveFuelAmounts(first ?? {}), first);
  });

  test("editing the amount of a saved entry updates its price", () => {
    assert.equal(
      resolveFuelAmounts({ totalCost: 600, pricePerLiter: 120, fuelQuantity: 4.167 })
        ?.pricePerLiter,
      143.99,
    );
  });

  test("fewer than two values, or nothing to divide by, is refused", () => {
    assert.equal(resolveFuelAmounts({ totalCost: 500 }), null);
    assert.equal(resolveFuelAmounts({ pricePerLiter: 120 }), null);
    assert.equal(resolveFuelAmounts({ totalCost: 0, pricePerLiter: 120 }), null);
    assert.equal(resolveFuelAmounts({}), null);
  });

  test("free fuel with known liters is allowed, and has no price", () => {
    assert.deepEqual(resolveFuelAmounts({ totalCost: 0, fuelQuantity: 5 }), {
      totalCost: 0,
      fuelQuantity: 5,
      pricePerLiter: undefined,
    });
  });
});

describe("fuel validation", () => {
  const base = { bikeId: "a".repeat(24), date: "2026-11-03", odometer: "1000" };

  test("fills in the missing value", () => {
    const parsed = fuelEntrySchema.parse({
      ...base,
      totalCost: "500",
      pricePerLiter: "120",
    });
    assert.equal(parsed.fuelQuantity, 4.167);
  });

  test("points at the amount when too little is entered", () => {
    const missing = fuelEntrySchema.safeParse({ ...base, totalCost: "500" });
    assert.equal(missing.success, false);
    assert.equal(missing.error?.issues[0].path[0], "totalCost");
  });
});
