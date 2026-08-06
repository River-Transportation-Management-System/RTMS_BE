import type { EntityId, Nullable, Timestamp } from "@/shared/domain/common";

export type BookingStatus =
  | "PENDING"
  | "PENDING_PORT_REVIEW"
  | "APPROVED"
  | "MATCHED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED"
  | string;

export const INITIAL_BOOKING_STATUS: BookingStatus = "PENDING";

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
