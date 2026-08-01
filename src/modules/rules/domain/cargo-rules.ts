import { AppError } from "@/shared/errors/app-error";

/** Soft upper bound aligned with DECIMAL(14,2) business capacity. */
export const MAX_CARGO_CAPACITY = 99_999_999_999_999.99;
export const MIN_CARGO_CAPACITY = 0.01;

const ALLOWED_CARGO_TYPES = new Set([
  "GENERAL",
  "BULK",
  "CONTAINER",
  "LIQUID",
  "DANGEROUS",
  "REFRIGERATED",
  "OTHER",
]);

export function normalizeCargoType(cargoType: string): string {
  return cargoType.trim().toUpperCase();
}

export function assertValidCargoType(cargoType: string): string {
  const normalized = normalizeCargoType(cargoType);

  if (!normalized) {
    throw AppError.unprocessable("cargo_type is required");
  }

  if (normalized.length > 80) {
    throw AppError.unprocessable("cargo_type must be at most 80 characters");
  }

  // Allow known catalog values and custom types that are non-empty.
  if (ALLOWED_CARGO_TYPES.has(normalized) || normalized.length >= 2) {
    return normalized;
  }

  throw AppError.unprocessable("cargo_type is invalid");
}

export function assertValidCargoCapacity(capacity: number | string): string {
  const value = typeof capacity === "number" ? capacity : Number(capacity);

  if (!Number.isFinite(value)) {
    throw AppError.unprocessable("cargo_capacity must be a valid number");
  }

  if (value < MIN_CARGO_CAPACITY) {
    throw AppError.unprocessable(`cargo_capacity must be at least ${MIN_CARGO_CAPACITY}`);
  }

  if (value > MAX_CARGO_CAPACITY) {
    throw AppError.unprocessable(`cargo_capacity must be at most ${MAX_CARGO_CAPACITY}`);
  }

  return value.toFixed(2);
}
