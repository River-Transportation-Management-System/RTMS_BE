import type { EntityId, Nullable, Timestamp } from "@/shared/domain/common";

export type BookingReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "REQUIRES_UPDATE" | string;

export interface BookingReviewEntity {
  reviewId: EntityId;
  bookingId: Nullable<EntityId>;
  portId: Nullable<EntityId>;
  reviewStatus: Nullable<BookingReviewStatus>;
  reviewDate: Nullable<Timestamp>;
}
