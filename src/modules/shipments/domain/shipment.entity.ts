import type { EntityId, Nullable, Timestamp } from "@/shared/domain/common";

export type ShipmentStatus = "PLANNED" | "LOADING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED" | string;

export interface ShipmentEntity {
  shipmentId: EntityId;
  shipmentStatus: Nullable<ShipmentStatus>;
  shipmentDate: Nullable<Timestamp>;
  vesselId: Nullable<EntityId>;
  reviewId: Nullable<EntityId>;
}
