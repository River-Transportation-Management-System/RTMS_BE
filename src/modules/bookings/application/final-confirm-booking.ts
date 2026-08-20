import type { BookingRepository } from "@/modules/bookings/application/ports/booking.repository";
import type {
  FinalConfirmationRepository,
  FinalConfirmationResult,
} from "@/modules/bookings/application/ports/final-confirmation.repository";
import type { VesselSelectionRepository } from "@/modules/bookings/application/ports/vessel-selection.repository";
import type { FinalConfirmationInput } from "@/modules/bookings/presentation/final-confirmation.schemas";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";
import type { RequestActor } from "@/shared/http/request-actor";

export type FinalConfirmBookingDeps = {
  bookings: BookingRepository;
  vesselSelections: VesselSelectionRepository;
  finalConfirmations: FinalConfirmationRepository;
};

export async function finalConfirmBooking(
  deps: FinalConfirmBookingDeps,
  bookingId: EntityId,
  input: FinalConfirmationInput,
  actor: RequestActor,
): Promise<FinalConfirmationResult> {
  if (!actor.userId) {
    throw AppError.unauthorized("x-user-id is required for final confirmation");
  }

  if (actor.roleCode !== "PORT_MANAGER" && actor.roleCode !== "ADMIN") {
    throw AppError.forbidden("Only port managers or administrators can finalize a booking");
  }

  const booking = await deps.bookings.findById(bookingId);
  if (!booking) {
    throw AppError.notFound(`Booking ${bookingId} not found`);
  }

  if (await deps.finalConfirmations.existsForBooking(bookingId)) {
    throw AppError.conflict("Booking has already received final confirmation", {
      booking_id: bookingId,
    });
  }

  if (booking.bookingStatus !== "MATCHED" && booking.bookingStatus !== "WAITING_FINAL_CONFIRMATION") {
    throw AppError.unprocessable("Only MATCHED or WAITING_FINAL_CONFIRMATION bookings can receive final confirmation", {
      booking_id: bookingId,
      booking_status: booking.bookingStatus,
    });
  }

  const selection = await deps.vesselSelections.findSelectedVesselByBookingId(bookingId);
  if (!selection || selection.selectionStatus !== "FINALIZED") {
    throw AppError.unprocessable("A finalized vessel selection is required before final confirmation", {
      booking_id: bookingId,
    });
  }

  const portContext = await deps.finalConfirmations.findApprovedPortContext(bookingId, input.port_id);
  if (!portContext) {
    throw AppError.unprocessable("port_id must have an APPROVED review for this booking", {
      booking_id: bookingId,
      port_id: input.port_id,
    });
  }

  if (actor.roleCode === "PORT_MANAGER" && portContext.portUserId !== actor.userId) {
    throw AppError.forbidden("Port managers can only confirm for their own port");
  }

  try {
    return await deps.finalConfirmations.create({
      bookingId,
      matchId: selection.matchId,
      vesselId: selection.vesselId,
      reviewId: portContext.reviewId,
      portId: input.port_id,
      confirmationActorId: actor.userId,
      confirmationNote: input.confirmation_note?.trim() ? input.confirmation_note.trim() : null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FINAL_CONFIRMATION_ALREADY_EXISTS") {
      throw AppError.conflict("Booking has already received final confirmation", {
        booking_id: bookingId,
      });
    }
    throw error;
  }
}
