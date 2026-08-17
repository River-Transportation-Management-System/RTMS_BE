export function toMatchingResponse(data: {
  bookingId: any;
  cargoType: any;
  cargoCapacity: any;
  routeId: any;
  matches: any[];
}) {
  return {
    booking_id: data.bookingId,
    cargo_type: data.cargoType,
    cargo_capacity: data.cargoCapacity == null ? null : String(data.cargoCapacity),
    route_id: data.routeId,
    matches: data.matches.map(m => ({
      match_id: m.matchId,
      vessel_id: m.vesselId,
      match_status: m.matchStatus,
      created_at: m.createdAt,
      response_at: m.responseAt,
      vessel_owner_name: m.vesselOwnerName,
      vessel_capacity: m.vesselCapacity,
      vessel_cargo_type: m.vesselCargoType,
      vessel_status: m.vesselStatus,
    })),
  };
}
