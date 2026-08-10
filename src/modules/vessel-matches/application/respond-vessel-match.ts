import type { VesselMatchResponseRepository } from "@/modules/vessel-matches/application/ports/vessel-match-response.repository";
import type { VesselMatchResponseInput } from "@/modules/vessel-matches/presentation/vessel-match-response.schemas";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";
import type { RequestActor } from "@/shared/http/request-actor";

export type VesselMatchResponseOutcome = {
  responseStatus: "ACCEPT" | "REJECT";
  reason: string | null;
  persisted: false;
  sideEffectTriggered: boolean;
};

export type VesselMatchResponseResult = {
  matchId: EntityId;
  vesselId: EntityId;
  bookingId: EntityId;
  responseOutcome: VesselMatchResponseOutcome;
};

export type RespondVesselMatchDeps = {
  vesselMatches: VesselMatchResponseRepository;
  onRespond?: (payload: VesselMatchResponseResult) => Promise<void> | void;
};

export async function respondVesselMatch(
  deps: RespondVesselMatchDeps,
  matchId: EntityId,
  input: VesselMatchResponseInput,
  actor: RequestActor,
): Promise<VesselMatchResponseResult> {
  if (actor.roleCode !== "VESSEL_OWNER") {
    throw AppError.forbidden("Only vessel owners can respond to vessel matches");
  }

  if (!actor.userId) {
    throw AppError.unauthorized("x-user-id is required for vessel owner response");
  }

  const match = await deps.vesselMatches.findByMatchId(matchId);
  if (!match) {
    throw AppError.notFound(`Vessel match ${matchId} not found`);
  }

  if (!match.vesselUserId || match.vesselUserId !== actor.userId) {
    throw AppError.forbidden("Only the vessel owner can respond to this match");
  }

  const outcome: VesselMatchResponseOutcome = {
    responseStatus: input.response_status,
    reason: input.reason?.trim() ? input.reason.trim() : null,
    persisted: false,
    sideEffectTriggered: false,
  };

  const result: VesselMatchResponseResult = {
    matchId: match.matchId,
    vesselId: match.vesselId,
    bookingId: match.bookingId,
    responseOutcome: outcome,
  };

  if (deps.onRespond) {
    await deps.onRespond(result);
    result.responseOutcome.sideEffectTriggered = true;
  }

  return result;
}
