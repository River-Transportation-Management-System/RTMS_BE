import type { EntityId, Nullable, Timestamp } from "@/shared/domain/common";

export interface RouteEntity {
  routeId: EntityId;
  routeCode: Nullable<string>;
  updatedAt: Nullable<Timestamp>;
  deletedAt: Nullable<Timestamp>;
}
