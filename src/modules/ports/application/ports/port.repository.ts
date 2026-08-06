import type { PortEntity } from "@/modules/ports/domain/port.entity";
import type { EntityId } from "@/shared/domain/common";

export interface PortRepository {
  list(): Promise<PortEntity[]>;
  findById(portId: EntityId): Promise<PortEntity | null>;
  exists(portId: EntityId): Promise<boolean>;
  isOnRoute(portId: EntityId, routeId: EntityId): Promise<boolean>;
}
