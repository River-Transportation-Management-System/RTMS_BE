import type { EntityId } from "@/shared/domain/common";

export interface RouteRepository {
  existsActive(routeId: EntityId): Promise<boolean>;
}
