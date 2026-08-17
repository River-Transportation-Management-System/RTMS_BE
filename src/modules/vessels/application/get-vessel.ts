import type { VesselRepository } from "@/modules/vessels/application/ports/vessel.repository";
import { assertCanAccessVessel } from "@/modules/vessels/application/vessel-access";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";
import type { RequestActor } from "@/shared/http/request-actor";

export async function getVessel(
  deps: { vessels: VesselRepository },
  vesselId: EntityId,
  actor: RequestActor,
) {
  const vessel = await deps.vessels.findById(vesselId);
  if (!vessel) {
    throw AppError.notFound(`Vessel ${vesselId} not found`);
  }

  assertCanAccessVessel(actor, vessel);
  return vessel;
}
