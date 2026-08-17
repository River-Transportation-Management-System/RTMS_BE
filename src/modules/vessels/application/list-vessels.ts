import type { VesselRepository } from "@/modules/vessels/application/ports/vessel.repository";
import type { ListVesselsQuery } from "@/modules/vessels/presentation/vessel.schemas";
import { AppError } from "@/shared/errors/app-error";
import { normalizePagination } from "@/shared/http/pagination";
import type { RequestActor } from "@/shared/http/request-actor";

export async function listVessels(
  deps: { vessels: VesselRepository },
  query: ListVesselsQuery,
  actor: RequestActor,
) {
  let userId = query.user_id;

  if (actor.roleCode === "VESSEL_OWNER") {
    if (!actor.userId) {
      throw AppError.unauthorized("x-user-id is required for VESSEL_OWNER role");
    }
    if (userId != null && userId !== actor.userId) {
      throw AppError.forbidden("Vessel owners can only list their own vessel");
    }
    userId = actor.userId;
  }

  return deps.vessels.list(
    {
      vesselStatus: query.vessel_status,
      vesselCargoType: query.vessel_cargo_type,
      userId,
    },
    normalizePagination(query.page, query.limit),
  );
}
