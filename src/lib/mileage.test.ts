import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { fuelStats, odometerError, withMileage, type FuelReading } from "./mileage";

function reading(
  id: string,
  date: string,
  odometer: number,
  fuelQuantity = 5,
  totalCost = 600,
): FuelReading {
  return { id, date, odometer, fuelQuantity, totalCost };
}

describe("withMileage", () => {
  test("first entry has no mileage", () => {
    const [first] = withMileage([reading("a", "2026-01-01", 1000)]);
    assert.equal(first.distance, null);
    assert.equal(first.mileage, null);
  });

  test("mileage is distance divided by this entry's fuel", () => {
    const rows = withMileage([
      reading("a", "2026-01-01", 1000),
      reading("b", "2026-01-10", 1200, 4),
    ]);
    assert.equal(rows[1].distance, 200);
    assert.equal(rows[1].mileage, 50);
  });

  test("sorts by date even when entries were added out of order", () => {
    const rows = withMileage([
      reading("b", "2026-01-10", 1200, 4),
      reading("a", "2026-01-01", 1000),
    ]);
    assert.deepEqual(rows.map((r) => r.id), ["a", "b"]);
    assert.equal(rows[1].mileage, 50);
  });

  test("no movement gives no mileage instead of zero", () => {
    const rows = withMileage([
      reading("a", "2026-01-01", 1000),
      reading("b", "2026-01-02", 1000),
    ]);
    assert.equal(rows[1].distance, 0);
    assert.equal(rows[1].mileage, null);
  });
});

describe("fuelStats", () => {
  test("no entries", () => {
    assert.deepEqual(fuelStats([]), {
      latestOdometer: null,
      totalDistance: 0,
      totalFuelCost: 0,
      averageMileage: null,
      costPerKm: null,
    });
  });

  test("a single entry has no averages but counts its cost", () => {
    const stats = fuelStats([reading("a", "2026-01-01", 1000, 5, 600)]);
    assert.equal(stats.latestOdometer, 1000);
    assert.equal(stats.totalDistance, 0);
    assert.equal(stats.totalFuelCost, 600);
    assert.equal(stats.averageMileage, null);
    assert.equal(stats.costPerKm, null);
  });

  test("averages leave out the first fill", () => {
    const stats = fuelStats([
      reading("a", "2026-01-01", 1000, 10, 1000),
      reading("b", "2026-01-10", 1200, 4, 500),
      reading("c", "2026-01-20", 1500, 6, 700),
    ]);
    assert.equal(stats.latestOdometer, 1500);
    assert.equal(stats.totalDistance, 500);
    assert.equal(stats.totalFuelCost, 2200);
    assert.equal(stats.averageMileage, 50);
    assert.equal(stats.costPerKm, 1200 / 500);
  });

  test("free fuel has no cost per km", () => {
    const stats = fuelStats([
      reading("a", "2026-01-01", 1000, 5, 0),
      reading("b", "2026-01-02", 1100, 5, 0),
    ]);
    assert.equal(stats.costPerKm, null);
  });
});

describe("odometerError", () => {
  const others = [
    { date: "2026-01-01", odometer: 1000 },
    { date: "2026-02-01", odometer: 2000 },
  ];

  test("first entry may be any non-negative reading", () => {
    assert.equal(odometerError([], { date: "2026-01-01", odometer: 0 }), null);
  });

  test("accepts a reading after the latest", () => {
    assert.equal(odometerError(others, { date: "2026-03-01", odometer: 2500 }), null);
  });

  test("rejects a reading lower than an earlier date", () => {
    assert.match(
      odometerError(others, { date: "2026-03-01", odometer: 1999 }) ?? "",
      /at least 2000/,
    );
  });

  test("accepts a back-dated reading between its neighbours", () => {
    assert.equal(odometerError(others, { date: "2026-01-15", odometer: 1500 }), null);
  });

  test("rejects a back-dated reading above a later date", () => {
    assert.match(
      odometerError(others, { date: "2026-01-15", odometer: 2100 }) ?? "",
      /at most 2000/,
    );
  });

  test("allows an equal reading", () => {
    assert.equal(odometerError(others, { date: "2026-03-01", odometer: 2000 }), null);
  });
});
