import type { BookingRepository } from "@/modules/bookings/application/ports/booking.repository";
import type {
  SelectedVesselDetails,
  VesselSelectionRepository,
} from "@/modules/bookings/application/ports/vessel-selection.repository";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";

export type GetSelectedVesselForBookingDeps = {
  bookings: BookingRepository;
  vesselSelections: VesselSelectionRepository;
};

export async function getSelectedVesselForBooking(
  deps: GetSelectedVesselForBookingDeps,
  bookingId: EntityId,
): Promise<SelectedVesselDetails> {
  const booking = await deps.bookings.findById(bookingId);
  if (!booking) {
    throw AppError.notFound(`Booking ${bookingId} not found`);
  }

  const selectedVessel = await deps.vesselSelections.findSelectedVesselByBookingId(bookingId);
  if (!selectedVessel) {
    throw AppError.notFound(`No vessel has been selected for booking ${bookingId}`);
  }

  return selectedVessel;
}
