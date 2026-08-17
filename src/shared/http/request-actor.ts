import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";

export type RequestActor = {
  userId: EntityId | null;
  roleCode: string | null;
};

function parsePositiveInt(value: string | null): EntityId | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw AppError.badRequest("Invalid actor user id");
  }

  return parsed;
}

/**
 * Temporary actor resolution until auth middleware exists.
 * Clients pass `x-user-id` and `x-role-code` headers.
 */
export function resolveRequestActor(request: Request): RequestActor {
  const userId = parsePositiveInt(request.headers.get("x-user-id"));
  const roleCode = request.headers.get("x-role-code")?.trim().toUpperCase() || null;

  return { userId, roleCode };
}

export function assertCanAccessBooking(
  actor: RequestActor,
  bookingUserId: EntityId | null,
): void {
  if (!actor.roleCode || actor.roleCode === "ADMIN") {
    return;
  }

  if (actor.roleCode === "CUSTOMER") {
    if (!actor.userId || actor.userId !== bookingUserId) {
      throw AppError.forbidden("You can only access your own bookings");
    }
  }
}