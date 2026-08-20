import type { BookingRepository } from "@/modules/bookings/application/ports/booking.repository";
import type { BookingReviewRepository } from "@/modules/booking-reviews/application/ports/booking-review.repository";
import type { CreatePortReviewInput } from "@/modules/booking-reviews/presentation/booking-review.schemas";
import type { PortRepository } from "@/modules/ports/application/ports/port.repository";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";

export type CreatePortReviewDeps = {
  bookings: BookingRepository;
  reviews: BookingReviewRepository;
  ports: PortRepository;
};

export async function createPortReview(
  deps: CreatePortReviewDeps,
  bookingId: EntityId,
  input: CreatePortReviewInput,
) {
  const booking = await deps.bookings.findById(bookingId);
  if (!booking) {
    throw AppError.notFound(`Booking ${bookingId} not found`);
  }

  if (booking.bookingStatus === "CANCELLED") {
    throw AppError.unprocessable("Cannot review a cancelled booking");
  }

  const portExists = await deps.ports.exists(input.port_id);
  if (!portExists) {
    throw AppError.unprocessable("port_id does not exist", { port_id: input.port_id });
  }

  if (booking.routeId != null) {
    const onRoute = await deps.ports.isOnRoute(input.port_id, booking.routeId);
    if (!onRoute) {
      throw AppError.unprocessable("port_id is not part of the booking route", {
        port_id: input.port_id,
        route_id: booking.routeId,
      });
    }
  }

  return await deps.reviews.create({
    bookingId,
    portId: input.port_id,
    reviewStatus: input.review_status,
    reviewDate: new Date(),
    reviewNote: input.review_note?.trim() ? input.review_note.trim() : null,
  });
}
