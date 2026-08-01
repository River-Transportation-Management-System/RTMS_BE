import type { BookingRepository } from "@/modules/bookings/application/ports/booking.repository";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";
import { assertCanAccessBooking, type RequestActor } from "@/shared/http/request-actor";

export type GetBookingDeps = {
  bookings: BookingRepository;
};

export async function getBooking(
  deps: GetBookingDeps,
  bookingId: EntityId,
  actor: RequestActor,
) {
  const booking = await deps.bookings.findDetailById(bookingId);
  if (!booking) {
    throw AppError.notFound(`Booking ${bookingId} not found`);
  }

  assertCanAccessBooking(actor, booking.userId);
  return booking;
}
