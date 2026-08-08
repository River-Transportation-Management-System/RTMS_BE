import { AppError } from "@/shared/errors/app-error";

const MIN_VESSEL_CAPACITY = 0.01;
// The runtime schema uses DECIMAL(10,2), which is stricter than the dictionary migration.
const MAX_VESSEL_CAPACITY = 99_999_999.99;

export function normalizeVesselCapacity(capacity: number | string): string {
  const value = typeof capacity === "number" ? capacity : Number(capacity);

  if (!Number.isFinite(value)) {
    throw AppError.unprocessable("vessel_capacity must be a valid number");
  }
  if (value < MIN_VESSEL_CAPACITY) {
    throw AppError.unprocessable(`vessel_capacity must be at least ${MIN_VESSEL_CAPACITY}`);
  }
  if (value > MAX_VESSEL_CAPACITY) {
    throw AppError.unprocessable(`vessel_capacity must be at most ${MAX_VESSEL_CAPACITY}`);
  }

  return value.toFixed(2);
}
