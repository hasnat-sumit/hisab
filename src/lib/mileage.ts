export type FuelReading = {
  id: string;
  date: string;
  odometer: number;
  fuelQuantity: number;
  totalCost: number;
};

export type FuelReadingWithMileage<T extends FuelReading = FuelReading> = T & {
  /** Kilometres since the previous entry. Null for the first entry. */
  distance: number | null;
  /** Null for the first entry, and when the bike has not moved. */
  mileage: number | null;
};

export type FuelStats = {
  latestOdometer: number | null;
  totalDistance: number;
  totalFuelCost: number;
  averageMileage: number | null;
  costPerKm: number | null;
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
  return sortReadings(readings).map((reading, index, sorted) => {
    if (index === 0) return { ...reading, distance: null, mileage: null };
    const distance = reading.odometer - sorted[index - 1].odometer;
    return {
      ...reading,
      distance,
      mileage: distance > 0 ? distance / reading.fuelQuantity : null,
    };
  });
}

export function fuelStats(readings: FuelReading[]): FuelStats {
  const sorted = sortReadings(readings);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalFuelCost = sorted.reduce((sum, r) => sum + r.totalCost, 0);

  if (!first || !last) {
    return {
      latestOdometer: null,
      totalDistance: 0,
      totalFuelCost: 0,
      averageMileage: null,
      costPerKm: null,
    };
  }

  // The first fill is left out of the averages: no distance was measured
  // against it, so counting it would make mileage look worse than it is.
  const measured = sorted.slice(1);
  const measuredFuel = measured.reduce((sum, r) => sum + r.fuelQuantity, 0);
  const measuredCost = measured.reduce((sum, r) => sum + r.totalCost, 0);
  const totalDistance = last.odometer - first.odometer;

  return {
    latestOdometer: last.odometer,
    totalDistance,
    totalFuelCost,
    averageMileage: totalDistance > 0 ? totalDistance / measuredFuel : null,
    costPerKm:
      totalDistance > 0 && measuredCost > 0
        ? measuredCost / totalDistance
        : null,
  };
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
