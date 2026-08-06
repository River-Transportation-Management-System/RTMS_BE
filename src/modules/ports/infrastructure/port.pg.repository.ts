import type { Pool } from "pg";

import type { PortRepository } from "@/modules/ports/application/ports/port.repository";
import type { PortEntity } from "@/modules/ports/domain/port.entity";
import type { EntityId } from "@/shared/domain/common";
import { database } from "@/infrastructure/database/postgres";

type PortRow = {
  port_id: number;
  port_name: string | null;
  port_geo: string | null;
  user_id: number | null;
};

function mapPort(row: PortRow): PortEntity {
  return {
    portId: row.port_id,
    portName: row.port_name,
    portGeo: row.port_geo,
    userId: row.user_id,
  };
}

const PORT_COLUMNS = `
  port_id,
  port_name,
  ST_AsGeoJSON(port_geo::geometry) AS port_geo,
  user_id
`;

export class PortPgRepository implements PortRepository {
  constructor(private readonly db: Pool = database) {}

  async list(): Promise<PortEntity[]> {
    const result = await this.db.query<PortRow>(
      `SELECT ${PORT_COLUMNS}
       FROM port
       ORDER BY port_id ASC`,
    );

    return result.rows.map(mapPort);
  }

  async findById(portId: EntityId): Promise<PortEntity | null> {
    const result = await this.db.query<PortRow>(
      `SELECT ${PORT_COLUMNS}
       FROM port
       WHERE port_id = $1`,
      [portId],
    );

    const row = result.rows[0];
    return row ? mapPort(row) : null;
  }

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
