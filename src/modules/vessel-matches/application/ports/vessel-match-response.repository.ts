import type { EntityId, Nullable } from "@/shared/domain/common";

export type VesselMatchResponseRecord = {
  matchId: EntityId;
  vesselId: EntityId;
  bookingId: EntityId;
  vesselUserId: Nullable<EntityId>;
  vesselOwnerName: Nullable<string>;
  vesselStatus: Nullable<string>;
  vesselCapacity: Nullable<string>;
  vesselCargoType: Nullable<string>;
};

export interface VesselMatchResponseRepository {
  findByMatchId(matchId: EntityId): Promise<VesselMatchResponseRecord | null>;
}
