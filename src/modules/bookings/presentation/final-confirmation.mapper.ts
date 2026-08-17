import type { FinalConfirmationResult } from "@/modules/bookings/application/ports/final-confirmation.repository";

export function toFinalConfirmationResponse(result: FinalConfirmationResult) {
  return {
    confirmation: {
      confirmation_id: result.confirmationId,
      booking_id: result.bookingId,
      match_id: result.matchId,
      vessel_id: result.vesselId,
      port_id: result.portId,
      actor_user_id: result.confirmationActorId,
      note: result.confirmationNote,
      confirmed_at: result.confirmedAt,
    },
    service: {
      creation_status: result.serviceCreationStatus,
      shipment_id: result.shipmentId,
      shipment_status: result.shipmentStatus,
      created_at: result.serviceCreatedAt,
    },
    booking: {
      workflow_state: result.bookingWorkflowState,
      workflow_changed_at: result.workflowChangedAt,
    },
  };
}
