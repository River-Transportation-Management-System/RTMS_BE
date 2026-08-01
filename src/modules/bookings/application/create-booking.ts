import type { BookingRepository } from "@/modules/bookings/application/ports/booking.repository";
import { INITIAL_BOOKING_STATUS } from "@/modules/bookings/domain/booking.entity";
import type { CreateBookingInput } from "@/modules/bookings/presentation/booking.schemas";
import type { RouteRepository } from "@/modules/routes/application/ports/route.repository";
import { assertValidCargoCapacity, assertValidCargoType } from "@/modules/rules";
import { AppError } from "@/shared/errors/app-error";

export type CreateBookingDeps = {
  bookings: BookingRepository;
  routes: RouteRepository;
};

export async function createBooking(deps: CreateBookingDeps, input: CreateBookingInput) {
  const routeExists = await deps.routes.existsActive(input.route_id);
  if (!routeExists) {
    throw AppError.unprocessable("route_id does not exist or has been deleted", {
      route_id: input.route_id,
    });
  }

  const cargoType = assertValidCargoType(input.cargo_type);
  const cargoCapacity = assertValidCargoCapacity(input.cargo_capacity);

  try {
    return await deps.bookings.create({
      bookingDate: new Date(),
      receiveDate: input.receive_date,
      expectedDate: input.expected_date,
      expiredDate: input.expired_date ?? null,
      bookingStatus: INITIAL_BOOKING_STATUS,
      cargoType,
      cargoCapacity,
      notes: input.notes?.trim() ? input.notes.trim() : null,
      userId: input.user_id,
      routeId: input.route_id,
    });
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw AppError.unprocessable("user_id or route_id reference is invalid", {
        user_id: input.user_id,
        route_id: input.route_id,
      });
    }
    throw error;
  }
}

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23503"
  );
}
