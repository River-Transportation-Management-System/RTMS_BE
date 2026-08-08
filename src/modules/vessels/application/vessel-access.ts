import type { VesselEntity } from "@/modules/vessels/domain/vessel.entity";
import { AppError } from "@/shared/errors/app-error";
import type { RequestActor } from "@/shared/http/request-actor";

export function requireAdmin(actor: RequestActor): void {
  if (actor.roleCode !== "ADMIN") {
    throw AppError.forbidden("Only ADMIN can create vessels");
  }
}

export function assertCanAccessVessel(actor: RequestActor, vessel: VesselEntity): void {
  if (actor.roleCode !== "VESSEL_OWNER") {
    return;
  }

  if (!actor.userId) {
    throw AppError.unauthorized("x-user-id is required for VESSEL_OWNER role");
  }

  if (vessel.userId !== actor.userId) {
    throw AppError.forbidden("Vessel owners can only access their own vessel");
  }
}

export function assertCanUpdateVessel(actor: RequestActor, vessel: VesselEntity): void {
  if (actor.roleCode === "ADMIN") {
    return;
  }

  if (actor.roleCode !== "VESSEL_OWNER") {
    throw AppError.forbidden("Only ADMIN or the vessel owner can update a vessel");
  }

  assertCanAccessVessel(actor, vessel);
}
