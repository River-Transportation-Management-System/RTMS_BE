import type { BookingRepository } from "@/modules/bookings/application/ports/booking.repository";
import type { UpdateBookingInput } from "@/modules/bookings/presentation/booking.schemas";
import type { RouteRepository } from "@/modules/routes/application/ports/route.repository";
import {
  assertBookingIsEditable,
  assertValidCargoCapacity,
  assertValidCargoType,
} from "@/modules/rules";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";
import { assertCanAccessBooking, type RequestActor } from "@/shared/http/request-actor";

export type UpdateBookingDeps = {
  bookings: BookingRepository;
  routes: RouteRepository;
};

export async function updateBooking(
  deps: UpdateBookingDeps,
  bookingId: EntityId,
  input: UpdateBookingInput,
  actor: RequestActor,
) {
  const current = await deps.bookings.findById(bookingId);
  if (!current) {
    throw AppError.notFound(`Booking ${bookingId} not found`);
  }

  assertCanAccessBooking(actor, current.userId);
  assertBookingIsEditable(current.bookingStatus);

  if (input.route_id != null) {
    const routeExists = await deps.routes.existsActive(input.route_id);
    if (!routeExists) {
      throw AppError.unprocessable("route_id does not exist or has been deleted", {
        route_id: input.route_id,
      });
    }
  }

  const receiveDate = input.receive_date ?? current.receiveDate;
  const expectedDate = input.expected_date ?? current.expectedDate;

  if (receiveDate && expectedDate && expectedDate < receiveDate) {
    throw AppError.unprocessable("expected_date must be on or after receive_date");
  }

  const expiredDate =
    input.expired_date !== undefined ? input.expired_date : current.expiredDate;

  if (receiveDate && expiredDate && expiredDate < receiveDate) {
    throw AppError.unprocessable("expired_date must be on or after receive_date");
  }

  return deps.bookings.update(bookingId, {
    receiveDate: input.receive_date,
    expectedDate: input.expected_date,
    expiredDate: input.expired_date,
    cargoType: input.cargo_type ? assertValidCargoType(input.cargo_type) : undefined,
    cargoCapacity:
      input.cargo_capacity !== undefined
        ? assertValidCargoCapacity(input.cargo_capacity)
        : undefined,
    notes:
      input.notes === undefined
        ? undefined
        : input.notes?.trim()
          ? input.notes.trim()
          : null,
    routeId: input.route_id,
  });
}
