import type { WorkflowRepository } from "./ports/workflow.repository";
import type { BookingRepository } from "@/modules/bookings/application/ports/booking.repository";
import type { BookingReviewRepository } from "@/modules/booking-reviews/application/ports/booking-review.repository";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";

export type SelectCustomerDeps = {
  workflow: WorkflowRepository;
  bookings: BookingRepository;
  bookingReviews: BookingReviewRepository;
};

export type SelectCustomerInput = {
  bookingId: EntityId;
  selectedVesselId: EntityId;
};

export async function selectCustomer(deps: SelectCustomerDeps, input: SelectCustomerInput) {
  const booking = await deps.bookings.findById(input.bookingId);
  if (!booking) {
    throw AppError.notFound(`Booking ${input.bookingId} not found`);
  }

  await deps.workflow.updateVesselMatchSelected(input.bookingId, input.selectedVesselId);

  const updatedBooking = await deps.bookings.updateStatus(input.bookingId, "MATCHED");

  const reviews = await deps.bookingReviews.listByBookingId(input.bookingId);
  let shipmentId = null;
  if (reviews.length > 0) {
    const reviewId = reviews[0].reviewId;
    shipmentId = await deps.workflow.createShipment(input.selectedVesselId, reviewId);
  }

  return {
    bookingId: updatedBooking.bookingId,
    bookingStatus: updatedBooking.bookingStatus,
    selectedVesselId: input.selectedVesselId,
    shipmentId,
  };
}
