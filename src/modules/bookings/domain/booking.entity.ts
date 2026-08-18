import type { EntityId, Nullable, Timestamp } from "@/shared/domain/common";

export const BOOKING_STATUSES = [
  "PENDING_PORT_REVIEW",
  "WAITING_VESSEL_RESPONSE",
  "VESSEL_CANDIDATES_READY",
  "WAITING_CUSTOMER_SELECTION",
  "WAITING_FINAL_CONFIRMATION",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED_BY_PORT",
  "INVALID_ROUTE",
  "NO_VESSEL_AVAILABLE",
  "NO_VESSEL_ACCEPTED",
  "EXPIRED",
  "CANCELLED",
  "FAILED",
  "PENDING",
  "APPROVED",
  "MATCHED",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number] | string;

export const INITIAL_BOOKING_STATUS: BookingStatus = "PENDING_PORT_REVIEW";

export interface BookingEntity {
  bookingId: EntityId;
  bookingDate: Nullable<Timestamp>;
  receiveDate: Nullable<Timestamp>;
  expectedDate: Nullable<Timestamp>;
  expiredDate: Nullable<Timestamp>;
  bookingStatus: Nullable<BookingStatus>;
  cargoType: Nullable<string>;
  cargoCapacity: Nullable<string>;
  notes: Nullable<string>;
  userId: Nullable<EntityId>;
  routeId: Nullable<EntityId>;
}

export type BookingReviewsSummary = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

export type BookingMatchesSummary = {
  total: number;
};

export type BookingDetail = BookingEntity & {
  reviewsSummary: BookingReviewsSummary;
  matchesSummary: BookingMatchesSummary;
};
