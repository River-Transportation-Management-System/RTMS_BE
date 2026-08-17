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
    newStatus = "APPROVED";
    nextStep = "MATCHING_VESSELS";
  } else if (input.finalReviewDecision === "REJECTED") {
    newStatus = "CANCELLED";
    nextStep = "WORKFLOW_CLOSED";
  } else if (input.finalReviewDecision === "REQUIRES_UPDATE") {
    newStatus = "PENDING";
    nextStep = "WAITING_CUSTOMER_UPDATE";
  }

  const updatedNotes = booking.notes
    ? `${booking.notes}\n[Port Review Summary]: ${input.portReviewSummary}`
    : `[Port Review Summary]: ${input.portReviewSummary}`;

  await deps.bookings.update(input.bookingId, {
    notes: updatedNotes,
  });

  const finalBooking = await deps.bookings.updateStatus(input.bookingId, newStatus as any);

  return {
    bookingId: finalBooking.bookingId,
    bookingStatus: finalBooking.bookingStatus,
    nextStep,
  };
}
