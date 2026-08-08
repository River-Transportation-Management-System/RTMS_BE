import type { EntityId, Nullable } from "@/shared/domain/common";

export const VESSEL_STATUSES = [
  "AVAILABLE",
  "IN_TRANSIT",
  "MAINTENANCE",
  "INACTIVE",
] as const;

export type VesselStatus = (typeof VESSEL_STATUSES)[number];

export interface VesselEntity {
  vesselId: EntityId;
  vesselOwnerName: Nullable<string>;
  vesselStatus: Nullable<VesselStatus>;
  vesselCapacity: Nullable<string>;
  vesselCargoType: Nullable<string>;
  userId: Nullable<EntityId>;
}
