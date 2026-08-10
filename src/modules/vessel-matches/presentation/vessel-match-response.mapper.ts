import type { VesselMatchResponseResult } from "@/modules/vessel-matches/application/respond-vessel-match";

export function toVesselMatchResponse(result: VesselMatchResponseResult) {
  return {
    match_id: result.matchId,
    vessel_id: result.vesselId,
    booking_id: result.bookingId,
    response_outcome: {
      response_status: result.responseOutcome.responseStatus,
      reason: result.responseOutcome.reason,
      persisted: result.responseOutcome.persisted,
      side_effect_triggered: result.responseOutcome.sideEffectTriggered,
    },
  };
}
