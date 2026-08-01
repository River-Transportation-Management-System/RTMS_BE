import type { Pool } from "pg";

import type { RouteRepository } from "@/modules/routes/application/ports/route.repository";
import type { EntityId } from "@/shared/domain/common";
import { database } from "@/infrastructure/database/postgres";

export class RoutePgRepository implements RouteRepository {
  constructor(private readonly db: Pool = database) {}

  async existsActive(routeId: EntityId): Promise<boolean> {
    const result = await this.db.query<{ exists: boolean }>(
      `SELECT EXISTS(
         SELECT 1
         FROM route
         WHERE route_id = $1
           AND deleted_at IS NULL
       ) AS exists`,
      [routeId],
    );

    return result.rows[0]?.exists ?? false;
  }
}
