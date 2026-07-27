import type { EntityId, Nullable, Timestamp } from "@/shared/domain/common";

export type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "MATCHED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED"
  | string;

export interface BookingEntity {
  bookingId: EntityId;
  bookingDate: Nullable<Timestamp>;
  receiveDate: Nullable<Timestamp>;
  expectedDate: Nullable<Timestamp>;
  expiredDate: Nullable<Timestamp>;
  bookingStatus: Nullable<BookingStatus>;
  cargoType: Nullable<string>;
  cargoCapacity: Nullable<string>;
  userId: Nullable<EntityId>;
  routeId: Nullable<EntityId>;
}
