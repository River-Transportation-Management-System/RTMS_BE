import type { Pool } from "pg";

import type { PortRepository } from "@/modules/ports/application/ports/port.repository";
import type { EntityId } from "@/shared/domain/common";
import { database } from "@/infrastructure/database/postgres";

export class PortPgRepository implements PortRepository {
  constructor(private readonly db: Pool = database) {}

  async exists(portId: EntityId): Promise<boolean> {
    const result = await this.db.query<{ exists: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM port WHERE port_id = $1) AS exists`,
      [portId],
    );

    return result.rows[0]?.exists ?? false;
  }

  async isOnRoute(portId: EntityId, routeId: EntityId): Promise<boolean> {
    const result = await this.db.query<{ exists: boolean }>(
      `SELECT EXISTS(
         SELECT 1
         FROM route_port
         WHERE port_id = $1
           AND route_id = $2
       ) AS exists`,
      [portId, routeId],
    );

    return result.rows[0]?.exists ?? false;
  }
}
