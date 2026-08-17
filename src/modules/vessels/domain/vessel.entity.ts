import type { EntityId, Nullable } from "@/shared/domain/common";

export const VESSEL_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type VesselStatus = (typeof VESSEL_STATUSES)[number];

export interface VesselEntity {
  vesselId: EntityId;
  vesselOwnerName: Nullable<string>;
  vesselStatus: VesselStatus;
  vesselCapacity: Nullable<string>;
  vesselCargoType: Nullable<string>;
  userId: Nullable<EntityId>;
}
