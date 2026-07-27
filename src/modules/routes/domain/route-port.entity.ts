import type { EntityId, Nullable } from "@/shared/domain/common";

export interface RoutePortEntity {
  routePortId: EntityId;
  routeId: Nullable<EntityId>;
  portId: Nullable<EntityId>;
}
