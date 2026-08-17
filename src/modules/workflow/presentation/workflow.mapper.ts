import type { WorkflowSnapshot } from "../application/ports/workflow.repository";

export function toWorkflowSnapshotResponse(snapshot: WorkflowSnapshot, currentStep: string) {
  return {
    booking_id: snapshot.booking.bookingId,
    booking_status: snapshot.booking.bookingStatus,
    booking_date: snapshot.booking.bookingDate,
    receive_date: snapshot.booking.receiveDate,
    expected_date: snapshot.booking.expectedDate,
    expired_date: snapshot.booking.expiredDate,
    cargo_type: snapshot.booking.cargoType,
    cargo_capacity: snapshot.booking.cargoCapacity,
    route_id: snapshot.booking.routeId,
    current_step: currentStep,
    state_machine_data: {
      total_port_reviews: snapshot.reviews.length,
      approved_port_reviews: snapshot.reviews.filter(r => r.reviewStatus === "APPROVED").length,
      total_vessel_matches: snapshot.matches.length,
      accepted_vessel_matches: snapshot.matches.filter(m => m.matchStatus === "ACCEPTED").length,
    },
    reviews: snapshot.reviews.map(r => ({
      review_id: r.reviewId,
      port_id: r.portId,
      review_status: r.reviewStatus,
      review_date: r.reviewDate,
      review_note: r.reviewNote,
    })),
    matches: snapshot.matches.map(m => ({
      match_id: m.matchId,
      vessel_id: m.vesselId,
      match_status: m.matchStatus,
      created_at: m.createdAt,
      response_at: m.responseAt,
    })),
    shipments: snapshot.shipments.map(s => ({
      shipment_id: s.shipmentId,
      shipment_status: s.shipmentStatus,
      shipment_date: s.shipmentDate,
      vessel_id: s.vesselId,
      review_id: s.reviewId,
    })),
  };
}

export function toRespondVesselResponse(data: any) {
  return {
    success: true,
    request_id: data.requestId,
    vessel_id: data.vesselId,
    booking_id: data.bookingId,
    match_status: data.matchStatus,
    booking_status: data.bookingStatus,
    message: `Vessel response recorded: ${data.matchStatus}`,
  };
}

export function toSelectCustomerResponse(data: any) {
  return {
    success: true,
    booking_id: data.bookingId,
    booking_status: data.bookingStatus,
    selected_vessel_id: data.selectedVesselId,
    shipment_id: data.shipmentId,
    message: `Customer selection recorded. Booking status updated to MATCHED and shipment created.`,
  };
}

export function toCompletePortReviewResponse(data: any, decision: string) {
  return {
    success: true,
    booking_id: data.bookingId,
    booking_status: data.bookingStatus,
    next_step: data.nextStep,
    message: `Port review process completed with decision: ${decision}`,
  };
}
