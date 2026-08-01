import type {
  BookingReviewEntity,
  BookingReviewSummary,
} from "@/modules/booking-reviews/domain/booking-review.entity";

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function toBookingReviewResponse(review: BookingReviewEntity) {
  return {
    review_id: review.reviewId,
    booking_id: review.bookingId,
    port_id: review.portId,
    review_status: review.reviewStatus,
    review_date: toIso(review.reviewDate),
    review_note: review.reviewNote,
  };
}

export function toBookingReviewSummaryResponse(review: BookingReviewSummary) {
  return {
    review_id: review.reviewId,
    port_id: review.portId,
    review_status: review.reviewStatus,
    review_date: toIso(review.reviewDate),
    review_note: review.reviewNote,
    review_summary: review.summary,
  };
}
