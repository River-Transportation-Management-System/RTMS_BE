import type { EntityId, Nullable } from "@/shared/domain/common";

export interface PortEntity {
  portId: EntityId;
  portName: Nullable<string>;
  portGeo: Nullable<string>;
  userId: Nullable<EntityId>;
}
