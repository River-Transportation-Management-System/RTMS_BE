import type { BookingRepository } from "@/modules/bookings/application/ports/booking.repository";
import type { BookingReviewRepository } from "@/modules/booking-reviews/application/ports/booking-review.repository";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";
import { assertCanAccessBooking, type RequestActor } from "@/shared/http/request-actor";

export type ListPortReviewsDeps = {
  bookings: BookingRepository;
  reviews: BookingReviewRepository;
};

export async function listPortReviews(
  deps: ListPortReviewsDeps,
  bookingId: EntityId,
  actor: RequestActor,
) {
  const booking = await deps.bookings.findById(bookingId);
  if (!booking) {
    throw AppError.notFound(`Booking ${bookingId} not found`);
  }

  assertCanAccessBooking(actor, booking.userId);

  return deps.reviews.listByBookingId(bookingId);
}
