import type { EntityId, Nullable } from "@/shared/domain/common";

export type VesselStatus = "AVAILABLE" | "IN_TRANSIT" | "MAINTENANCE" | "INACTIVE" | string;

export interface VesselEntity {
  vesselId: EntityId;
  vesselOwnerName: Nullable<string>;
  vesselStatus: Nullable<VesselStatus>;
  vesselCapacity: Nullable<string>;
  vesselCargoType: Nullable<string>;
  userId: Nullable<EntityId>;
}
