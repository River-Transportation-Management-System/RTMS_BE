import type { BookingVesselRequestRepository } from "@/modules/bookings/application/ports/booking-vessel-request.repository";
import type { EntityId } from "@/shared/domain/common";

export type GetBookingVesselRequestsDeps = {
  vesselRequests: BookingVesselRequestRepository;
};

export async function getBookingVesselRequests(
  deps: GetBookingVesselRequestsDeps,
  bookingId: EntityId,
) {
  return deps.vesselRequests.listByBookingId(bookingId);
}