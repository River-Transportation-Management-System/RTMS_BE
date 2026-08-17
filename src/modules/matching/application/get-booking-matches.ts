import type { MatchingRepository } from "./ports/matching.repository";
import type { BookingRepository } from "@/modules/bookings/application/ports/booking.repository";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";

export type GetBookingMatchesDeps = {
  bookings: BookingRepository;
  matching: MatchingRepository;
};

export async function getBookingMatches(deps: GetBookingMatchesDeps, bookingId: EntityId) {
  const booking = await deps.bookings.findById(bookingId);
  if (!booking) {
    throw AppError.notFound(`Booking ${bookingId} not found`);
  }

  const matches = await deps.matching.findMatchesByBookingId(bookingId);

  return {
    bookingId: booking.bookingId,
    cargoType: booking.cargoType,
    cargoCapacity: booking.cargoCapacity,
    routeId: booking.routeId,
    matches,
  };
}
