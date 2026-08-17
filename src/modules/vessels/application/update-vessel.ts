import type { VesselRepository } from "@/modules/vessels/application/ports/vessel.repository";
import { assertCanUpdateVessel } from "@/modules/vessels/application/vessel-access";
import { normalizeVesselCapacity } from "@/modules/vessels/application/vessel-values";
import type { UpdateVesselInput } from "@/modules/vessels/presentation/vessel.schemas";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";
import type { RequestActor } from "@/shared/http/request-actor";

export async function updateVessel(
  deps: { vessels: VesselRepository },
  vesselId: EntityId,
  input: UpdateVesselInput,
  actor: RequestActor,
) {
  const current = await deps.vessels.findById(vesselId);
  if (!current) {
    throw AppError.notFound(`Vessel ${vesselId} not found`);
  }

  assertCanUpdateVessel(actor, current);

  return deps.vessels.update(vesselId, {
    vesselOwnerName: input.vessel_owner_name,
    vesselCapacity:
      input.vessel_capacity === undefined
        ? undefined
        : normalizeVesselCapacity(input.vessel_capacity),
    vesselCargoType: input.vessel_cargo_type,
    vesselStatus: input.vessel_status,
  });
}
