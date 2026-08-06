import type {
  BookingReviewEntity,
  BookingReviewStatus,
  BookingReviewSummary,
} from "@/modules/booking-reviews/domain/booking-review.entity";
import type { EntityId, Nullable, Timestamp } from "@/shared/domain/common";

export type CreateBookingReviewRecord = {
  bookingId: EntityId;
  portId: EntityId;
  reviewStatus: BookingReviewStatus;
  reviewDate: Timestamp;
  reviewNote: Nullable<string>;
};

export interface BookingReviewRepository {
  create(input: CreateBookingReviewRecord): Promise<BookingReviewEntity>;
  listByBookingId(bookingId: EntityId): Promise<BookingReviewSummary[]>;
  existsForBookingPort(bookingId: EntityId, portId: EntityId): Promise<boolean>;
}
