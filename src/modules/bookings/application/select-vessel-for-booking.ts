import type { BookingRepository } from "@/modules/bookings/application/ports/booking.repository";
import type { VesselSelectionRepository } from "@/modules/bookings/application/ports/vessel-selection.repository";
import type { SelectVesselForBookingInput } from "@/modules/bookings/presentation/booking.schemas";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";

export type SelectVesselForBookingDeps = {
  bookings: BookingRepository;
  vesselSelections: VesselSelectionRepository;
};

export async function selectVesselForBooking(
  deps: SelectVesselForBookingDeps,
  bookingId: EntityId,
  input: SelectVesselForBookingInput,
) {
  const booking = await deps.bookings.findById(bookingId);
  if (!booking) {
    throw AppError.notFound(`Booking ${bookingId} not found`);
  }

  const match = await deps.vesselSelections.findMatchForBooking(
    bookingId,
    input.selected_vessel_id,
  );
  if (!match) {
    throw AppError.unprocessable(
      "selected_vessel_id does not have a vessel match for this booking",
      {
        booking_id: bookingId,
        selected_vessel_id: input.selected_vessel_id,
      },
    );
  }

  try {
    await deps.vesselSelections.saveSelection({
      ...match,
      selectionNote: input.selection_note?.trim() ? input.selection_note.trim() : null,
    });
    await deps.bookings.updateStatus(bookingId, "WAITING_FINAL_CONFIRMATION");
  } catch (error) {
    if (error instanceof Error && error.message === "VESSEL_SELECTION_ALREADY_CONFIRMED") {
      throw AppError.conflict("Cannot change vessel selection after final confirmation", {
        booking_id: bookingId,
      });
    }
    throw error;
  }

  return match;
}
