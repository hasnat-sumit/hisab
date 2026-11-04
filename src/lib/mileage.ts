export type FuelReading = {
  id: string;
  date: string;
  odometer: number;
  fuelQuantity: number;
  totalCost: number;
  pricePerLiter?: number;
  fullTank?: boolean;
};

/**
 * Reliable: measured between two full tanks, so all the fuel used is known.
 * Estimated: assumes each fill-up replaced what was burned since the last one.
 */
export type MileageQuality = "reliable" | "estimated";

export type FuelReadingWithMileage<T extends FuelReading = FuelReading> = T & {
  /** Kilometres since the previous entry. Null for the first entry. */
  distance: number | null;
  /** Null for the first entry, and when the bike has not moved. */
  mileage: number | null;
  mileageQuality: MileageQuality | null;
  /** The distance and fuel behind `mileage`, which may span several entries. */
  measured: { distance: number; liters: number } | null;
};

export type FuelStats = {
  latestOdometer: number | null;
  totalDistance: number;
  totalFuelCost: number;
  averageMileage: number | null;
  mileageQuality: MileageQuality | null;
  costPerKm: number | null;
};

export type MonthlyFuelStats = {
  month: string;
  totalCost: number;
  liters: number;
  averagePrice: number | null;
  mileage: number | null;
  mileageQuality: MileageQuality | null;
  entries: number;
};

export function sortReadings<T extends FuelReading>(readings: T[]): T[] {
  return [...readings].sort(
    (a, b) => a.date.localeCompare(b.date) || a.odometer - b.odometer,
  );
}

/** Returns the readings oldest-first, each with its distance and mileage. */
export function withMileage<T extends FuelReading>(
  readings: T[],
): FuelReadingWithMileage<T>[] {
  const sorted = sortReadings(readings);
  let lastFullTank: number | null = null;

  return sorted.map((reading, index) => {
    const previousFull = lastFullTank;
    if (reading.fullTank) lastFullTank = index;
    if (index === 0) {
      return {
        ...reading,
        distance: null,
        mileage: null,
        mileageQuality: null,
        measured: null,
      };
    }

    const distance = reading.odometer - sorted[index - 1].odometer;

    if (reading.fullTank && previousFull !== null) {
      const span = reading.odometer - sorted[previousFull].odometer;
      const liters = sorted
        .slice(previousFull + 1, index + 1)
        .reduce((sum, r) => sum + r.fuelQuantity, 0);
      if (span > 0) {
        return {
          ...reading,
          distance,
          mileage: span / liters,
          mileageQuality: "reliable" as const,
          measured: { distance: span, liters },
        };
      }
    }

    if (distance <= 0) {
      return {
        ...reading,
        distance,
        mileage: null,
        mileageQuality: null,
        measured: null,
      };
    }
    return {
      ...reading,
      distance,
      mileage: distance / reading.fuelQuantity,
      mileageQuality: "estimated" as const,
      measured: { distance, liters: reading.fuelQuantity },
    };
  });
}

/** Mileage over a set of entries, preferring reliable measurements. */
function combinedMileage(
  rows: Pick<FuelReadingWithMileage, "measured" | "mileageQuality">[],
): Pick<FuelStats, "mileageQuality"> & { mileage: number | null } {
  const reliable = rows.filter((row) => row.mileageQuality === "reliable");
  const chosen = reliable.length > 0 ? reliable : rows;
  let distance = 0;
  let liters = 0;
  for (const { measured } of chosen) {
    if (!measured) continue;
    distance += measured.distance;
    liters += measured.liters;
  }
  if (distance <= 0 || liters <= 0) {
    return { mileage: null, mileageQuality: null };
  }
  return {
    mileage: distance / liters,
    mileageQuality: reliable.length > 0 ? "reliable" : "estimated",
  };
}

export function fuelStats(readings: FuelReading[]): FuelStats {
  const rows = withMileage(readings);
  const first = rows[0];
  const last = rows[rows.length - 1];
  const totalFuelCost = rows.reduce((sum, r) => sum + r.totalCost, 0);

  if (!first || !last) {
    return {
      latestOdometer: null,
      totalDistance: 0,
      totalFuelCost: 0,
      averageMileage: null,
      mileageQuality: null,
      costPerKm: null,
    };
  }

  // The first fill is left out of the averages: no distance was measured
  // against it, so counting it would make mileage look worse than it is.
  const measuredCost = rows.slice(1).reduce((sum, r) => sum + r.totalCost, 0);
  const totalDistance = last.odometer - first.odometer;
  const { mileage, mileageQuality } = combinedMileage(rows);

  return {
    latestOdometer: last.odometer,
    totalDistance,
    totalFuelCost,
    averageMileage: mileage,
    mileageQuality,
    costPerKm:
      totalDistance > 0 && measuredCost > 0
        ? measuredCost / totalDistance
        : null,
  };
}

/** One summary per month that has fill-ups, newest first. */
export function monthlyFuelStats(readings: FuelReading[]): MonthlyFuelStats[] {
  const months = new Map<string, FuelReadingWithMileage[]>();
  for (const row of withMileage(readings)) {
    const month = row.date.slice(0, 7);
    months.set(month, [...(months.get(month) ?? []), row]);
  }
  return [...months.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, rows]) => {
      const totalCost = rows.reduce((sum, r) => sum + r.totalCost, 0);
      const liters = rows.reduce((sum, r) => sum + r.fuelQuantity, 0);
      return {
        month,
        totalCost,
        liters,
        averagePrice: totalCost > 0 && liters > 0 ? totalCost / liters : null,
        ...combinedMileage(rows),
        entries: rows.length,
      };
    });
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Any two of amount, price and liters give the third. When all three are
 * present, the amount paid and the liters are what the pump showed, so they
 * are kept and the price is worked out from them. Returns null when there is
 * not enough to work with.
 */
export function resolveFuelAmounts(input: {
  totalCost?: number;
  pricePerLiter?: number;
  fuelQuantity?: number;
}): { totalCost: number; pricePerLiter?: number; fuelQuantity: number } | null {
  const { totalCost, pricePerLiter, fuelQuantity } = input;
  if (totalCost !== undefined && fuelQuantity !== undefined) {
    if (fuelQuantity <= 0) return null;
    // A price that already fits is kept exactly. Liters are rounded to 3
    // decimals, so recalculating ৳500 at ৳120/L would give ৳119.99/L.
    const fits =
      pricePerLiter !== undefined &&
      Math.abs(pricePerLiter * fuelQuantity - totalCost) <=
        pricePerLiter * 0.001 + 0.01;
    return {
      totalCost,
      fuelQuantity,
      pricePerLiter: fits
        ? pricePerLiter
        : totalCost > 0
          ? roundTo(totalCost / fuelQuantity, 2)
          : undefined,
    };
  }
  if (!pricePerLiter || pricePerLiter <= 0) return null;
  if (totalCost !== undefined) {
    if (totalCost <= 0) return null;
    return {
      totalCost,
      pricePerLiter,
      fuelQuantity: roundTo(totalCost / pricePerLiter, 3),
    };
  }
  if (fuelQuantity !== undefined && fuelQuantity > 0) {
    return {
      totalCost: roundTo(fuelQuantity * pricePerLiter, 2),
      pricePerLiter,
      fuelQuantity,
    };
  }
  return null;
}

/**
 * Checks a new or edited reading against the bike's other readings. Earlier
 * days must not have a higher odometer, and later days must not have a lower
 * one. Returns an error message, or null when the reading is fine.
 */
export function odometerError(
  others: Pick<FuelReading, "date" | "odometer">[],
  candidate: Pick<FuelReading, "date" | "odometer">,
): string | null {
  const earlier = others.filter((r) => r.date < candidate.date);
  const later = others.filter((r) => r.date > candidate.date);
  const minimum = Math.max(...earlier.map((r) => r.odometer), 0);
  const maximum = Math.min(...later.map((r) => r.odometer), Infinity);

  if (candidate.odometer < minimum) {
    return `Must be at least ${minimum} km, the reading from an earlier date.`;
  }
  if (candidate.odometer > maximum) {
    return `Must be at most ${maximum} km, the reading from a later date.`;
  }
  return null;
}
