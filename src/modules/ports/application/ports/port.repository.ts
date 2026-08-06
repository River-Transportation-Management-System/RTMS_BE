import type { EntityId } from "@/shared/domain/common";

export interface PortRepository {
  exists(portId: EntityId): Promise<boolean>;
  isOnRoute(portId: EntityId, routeId: EntityId): Promise<boolean>;
}
