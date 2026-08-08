import type { VesselRepository } from "@/modules/vessels/application/ports/vessel.repository";
import { requireAdmin } from "@/modules/vessels/application/vessel-access";
import { normalizeVesselCapacity } from "@/modules/vessels/application/vessel-values";
import type { CreateVesselInput } from "@/modules/vessels/presentation/vessel.schemas";
import { AppError } from "@/shared/errors/app-error";
import type { RequestActor } from "@/shared/http/request-actor";

export async function createVessel(
  deps: { vessels: VesselRepository },
  input: CreateVesselInput,
  actor: RequestActor,
) {
  requireAdmin(actor);

  try {
    return await deps.vessels.create({
      vesselOwnerName: input.vessel_owner_name,
      vesselCapacity: normalizeVesselCapacity(input.vessel_capacity),
      vesselCargoType: input.vessel_cargo_type,
      vesselStatus: input.vessel_status,
      userId: input.user_id,
    });
  } catch (error) {
    if (hasPgCode(error, "23503")) {
      throw AppError.unprocessable("user_id does not exist", { user_id: input.user_id });
    }
    if (hasPgCode(error, "23505")) {
      throw AppError.conflict("user_id already has a vessel", { user_id: input.user_id });
    }
    throw error;
  }
}

function hasPgCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === code;
}
