/**
 * Business-rule checks (cargo type/capacity compatibility, route validity).
 * Stateless validation helpers used by bookings and booking-reviews.
 */

export {
  assertValidCargoCapacity,
  assertValidCargoType,
  MAX_CARGO_CAPACITY,
  MIN_CARGO_CAPACITY,
  normalizeCargoType,
} from "./domain/cargo-rules";

export {
  assertBookingIsCancellable,
  assertBookingIsEditable,
  EDITABLE_BOOKING_STATUSES,
} from "./domain/booking-lifecycle";
