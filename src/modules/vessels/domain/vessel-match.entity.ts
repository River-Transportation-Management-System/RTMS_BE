import type { EntityId, Nullable } from "@/shared/domain/common";

export interface VesselMatchEntity {
  matchId: EntityId;
  vesselId: Nullable<EntityId>;
  bookingId: Nullable<EntityId>;
}
