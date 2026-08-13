import type { SelectedVesselDetails } from "@/modules/bookings/application/ports/vessel-selection.repository";

export function toSelectedVesselResponse(selection: SelectedVesselDetails) {
  return {
    booking_id: selection.bookingId,
    match_id: selection.matchId,
    vessel: {
      vessel_id: selection.vesselId,
      vessel_status: selection.vesselStatus,
      vessel_capacity: selection.vesselCapacity,
      vessel_cargo_type: selection.vesselCargoType,
    },
    owner: {
      vessel_owner_name: selection.vesselOwnerName,
      user_id: selection.ownerUserId,
      user_name: selection.ownerUserName,
      user_email: selection.ownerUserEmail,
      user_phone: selection.ownerUserPhone,
    },
    selection: {
      note: selection.selectionNote,
      selected_at: selection.selectedAt,
      status: selection.selectionStatus,
      finalized_at: selection.finalizedAt,
    },
  };
}
