import type { WorkflowRepository } from "./ports/workflow.repository";
import type { BookingRepository } from "@/modules/bookings/application/ports/booking.repository";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";

export type RespondVesselDeps = {
  workflow: WorkflowRepository;
  bookings: BookingRepository;
};

export type RespondVesselInput = {
  requestId: EntityId;
  vesselResponseStatus: "ACCEPTED" | "REJECTED";
  responseTimestamp: Date;
};

export async function respondVessel(deps: RespondVesselDeps, input: RespondVesselInput) {
  const updatedMatch = await deps.workflow.updateVesselMatchResponse(
    input.requestId,
    input.vesselResponseStatus,
    input.responseTimestamp,
  );

  if (!updatedMatch) {
    throw AppError.notFound(`Vessel request match ${input.requestId} not found`);
  }

  const booking = await deps.bookings.findById(updatedMatch.booking_id);

  return {
    requestId: updatedMatch.match_id,
    vesselId: updatedMatch.vessel_id,
    bookingId: updatedMatch.booking_id,
    matchStatus: updatedMatch.match_status,
    bookingStatus: booking ? booking.bookingStatus : null,
  };
}
