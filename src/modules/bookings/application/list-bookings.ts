import type {
  BookingRepository,
  ListBookingsFilter,
} from "@/modules/bookings/application/ports/booking.repository";
import type { ListBookingsQuery } from "@/modules/bookings/presentation/booking.schemas";
import type { RequestActor } from "@/shared/http/request-actor";
import { normalizePagination } from "@/shared/http/pagination";
import { AppError } from "@/shared/errors/app-error";

export type ListBookingsDeps = {
  bookings: BookingRepository;
};

function applyRoleFilter(
  actor: RequestActor,
  query: ListBookingsQuery,
): ListBookingsFilter {
  const filter: ListBookingsFilter = {
    bookingStatus: query.booking_status,
    userId: query.user_id,
    routeId: query.route_id,
    receiveDateFrom: query.receive_date_from,
    receiveDateTo: query.receive_date_to,
    expectedDateFrom: query.expected_date_from,
    expectedDateTo: query.expected_date_to,
    bookingDateFrom: query.booking_date_from,
    bookingDateTo: query.booking_date_to,
  };

  if (actor.roleCode === "CUSTOMER") {
    if (!actor.userId) {
      throw AppError.unauthorized("x-user-id is required for CUSTOMER role");
    }

    if (filter.userId != null && filter.userId !== actor.userId) {
      throw AppError.forbidden("Customers can only list their own bookings");
    }

    filter.userId = actor.userId;
  }

  return filter;
}

export async function listBookings(
  deps: ListBookingsDeps,
  query: ListBookingsQuery,
  actor: RequestActor,
) {
  const pagination = normalizePagination(query.page, query.limit);
  const filter = applyRoleFilter(actor, query);

  return deps.bookings.list(filter, pagination);
}
