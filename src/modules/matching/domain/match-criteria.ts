import type { EntityId, Nullable } from "@/shared/domain/common";

export interface MatchCriteria {
  bookingId: EntityId;
  cargoType: Nullable<string>;
  cargoCapacity: Nullable<string>;
  routeId: Nullable<EntityId>;
}
