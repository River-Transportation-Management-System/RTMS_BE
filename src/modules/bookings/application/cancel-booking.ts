import type { BookingRepository } from "@/modules/bookings/application/ports/booking.repository";
import { assertBookingIsCancellable } from "@/modules/rules";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";
import { assertCanAccessBooking, type RequestActor } from "@/shared/http/request-actor";

export type CancelBookingDeps = {
  bookings: BookingRepository;
};

export async function cancelBooking(
  deps: CancelBookingDeps,
  bookingId: EntityId,
  actor: RequestActor,
) {
  const current = await deps.bookings.findById(bookingId);
  if (!current) {
    throw AppError.notFound(`Booking ${bookingId} not found`);
  }

  assertCanAccessBooking(actor, current.userId);
  assertBookingIsCancellable(current.bookingStatus);

  const cancelled = await deps.bookings.updateStatus(bookingId, "CANCELLED");

  return {
    bookingId: cancelled.bookingId,
    bookingStatus: cancelled.bookingStatus,
    message: "Booking cancelled successfully",
  };
}
