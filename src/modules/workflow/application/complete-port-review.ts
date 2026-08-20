import type { BookingRepository } from "@/modules/bookings/application/ports/booking.repository";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";

export type CompletePortReviewDeps = {
  bookings: BookingRepository;
};

export type CompletePortReviewInput = {
  bookingId: EntityId;
  portReviewSummary: string;
  finalReviewDecision: "APPROVED" | "REJECTED" | "REQUIRES_UPDATE";
};

export async function completePortReview(deps: CompletePortReviewDeps, input: CompletePortReviewInput) {
  const booking = await deps.bookings.findById(input.bookingId);
  if (!booking) {
    throw AppError.notFound(`Booking ${input.bookingId} not found`);
  }

  let newStatus = booking.bookingStatus;
  let nextStep = "";

  if (input.finalReviewDecision === "APPROVED") {
    newStatus = "WAITING_VESSEL_RESPONSE";
    nextStep = "WAITING_VESSEL_RESPONSE";
  } else if (input.finalReviewDecision === "REJECTED") {
    newStatus = "REJECTED_BY_PORT";
    nextStep = "WORKFLOW_CLOSED";
  } else if (input.finalReviewDecision === "REQUIRES_UPDATE") {
    newStatus = "PENDING_PORT_REVIEW";
    nextStep = "WAITING_CUSTOMER_UPDATE";
  }

  const updatedNotes = booking.notes
    ? `${booking.notes}\n[Port Review Summary]: ${input.portReviewSummary}`
    : `[Port Review Summary]: ${input.portReviewSummary}`;

  await deps.bookings.update(input.bookingId, {
    notes: updatedNotes,
  });

  const finalBooking = await deps.bookings.updateStatus(input.bookingId, newStatus as any);

  if (input.finalReviewDecision === "APPROVED") {
    try {
      const { database } = await import("@/infrastructure/database/postgres");
      await database.query(
        `INSERT INTO vessel_match (vessel_id, booking_id, match_status, created_at)
         SELECT v.vessel_id, b.booking_id, 'PENDING', CURRENT_TIMESTAMP
         FROM vessel v, booking b
         WHERE b.booking_id = $1
           AND v.vessel_status = 'ACTIVE'
           AND v.vessel_capacity >= b.cargo_capacity
           AND NOT EXISTS (
             SELECT 1 FROM vessel_match vm WHERE vm.booking_id = b.booking_id AND vm.vessel_id = v.vessel_id
           )`,
        [input.bookingId],
      );
    } catch (err) {
      console.warn("[completePortReview] Auto-match vessel query notice:", err);
    }
  }

  return {
    bookingId: finalBooking.bookingId,
    bookingStatus: finalBooking.bookingStatus,
    nextStep,
  };
}
