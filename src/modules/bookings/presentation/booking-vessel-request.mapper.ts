import type { BookingVesselRequestRecord } from "@/modules/bookings/application/ports/booking-vessel-request.repository";

export function toBookingVesselRequestResponse(item: BookingVesselRequestRecord) {
  return {
    match_id: item.matchId,
    vessel_id: item.vesselId,
    match_status: item.matchStatus,
    vessel_summary: {
      vessel_owner_name: item.vesselOwnerName,
      vessel_status: item.vesselStatus,
      vessel_capacity: item.vesselCapacity,
      vessel_cargo_type: item.vesselCargoType,
      user_id: item.vesselUserId,
    },
  };
}