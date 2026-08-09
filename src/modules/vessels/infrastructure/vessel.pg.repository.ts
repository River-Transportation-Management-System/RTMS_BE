import type { Pool } from "pg";

import { database } from "@/infrastructure/database/postgres";
import type {
  CreateVesselRecord,
  ListVesselsFilter,
  UpdateVesselRecord,
  VesselRepository,
} from "@/modules/vessels/application/ports/vessel.repository";
import type { VesselEntity, VesselStatus } from "@/modules/vessels/domain/vessel.entity";
import type { EntityId } from "@/shared/domain/common";
import {
  paginationOffset,
  toPaginatedResult,
  type PaginationInput,
} from "@/shared/http/pagination";

type VesselRow = {
  vessel_id: number;
  vessel_owner_name: string | null;
  vessel_status: VesselStatus;
  vessel_capacity: string | null;
  vessel_cargo_type: string | null;
  user_id: number | null;
};

const VESSEL_COLUMNS = `
  vessel_id,
  vessel_owner_name,
  vessel_status,
  vessel_capacity,
  vessel_cargo_type,
  user_id
`;

function mapVessel(row: VesselRow): VesselEntity {
  return {
    vesselId: row.vessel_id,
    vesselOwnerName: row.vessel_owner_name,
    vesselStatus: row.vessel_status,
    vesselCapacity: row.vessel_capacity == null ? null : String(row.vessel_capacity),
    vesselCargoType: row.vessel_cargo_type,
    userId: row.user_id,
  };
}

export class VesselPgRepository implements VesselRepository {
  constructor(private readonly db: Pool = database) {}

  async listCargoTypes(): Promise<string[]> {
    const result = await this.db.query<{ vessel_cargo_type: string }>(
      `SELECT DISTINCT LOWER(BTRIM(vessel_cargo_type)) AS vessel_cargo_type
       FROM vessel
       WHERE vessel_cargo_type IS NOT NULL
         AND BTRIM(vessel_cargo_type) <> ''
       ORDER BY vessel_cargo_type ASC`,
    );

    return result.rows.map((row) => row.vessel_cargo_type);
  }

  async list(filter: ListVesselsFilter, pagination: PaginationInput) {
    const where: string[] = [];
    const params: unknown[] = [];

    const push = (clause: string, value: unknown) => {
      params.push(value);
      where.push(clause.replace("?", `$${params.length}`));
    };

    if (filter.vesselStatus) {
      push("vessel_status = ?", filter.vesselStatus);
    }
    if (filter.vesselCargoType) {
      push("LOWER(vessel_cargo_type) = LOWER(?)", filter.vesselCargoType);
    }
    if (filter.userId != null) {
      push("user_id = ?", filter.userId);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const countResult = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM vessel ${whereSql}`,
      params,
    );

    const listParams = [...params, pagination.limit, paginationOffset(pagination)];
    const result = await this.db.query<VesselRow>(
      `SELECT ${VESSEL_COLUMNS}
       FROM vessel
       ${whereSql}
       ORDER BY vessel_id DESC
       LIMIT $${params.length + 1}
       OFFSET $${params.length + 2}`,
      listParams,
    );

    return toPaginatedResult(
      result.rows.map(mapVessel),
      Number(countResult.rows[0]?.total ?? 0),
      pagination,
    );
  }

  async findById(vesselId: EntityId): Promise<VesselEntity | null> {
    const result = await this.db.query<VesselRow>(
      `SELECT ${VESSEL_COLUMNS} FROM vessel WHERE vessel_id = $1`,
      [vesselId],
    );
    return result.rows[0] ? mapVessel(result.rows[0]) : null;
  }

  async create(input: CreateVesselRecord): Promise<VesselEntity> {
    const result = await this.db.query<VesselRow>(
      `INSERT INTO vessel (
         vessel_owner_name, vessel_capacity, vessel_cargo_type, vessel_status, user_id
       ) VALUES ($1, $2, $3, $4, $5)
       RETURNING ${VESSEL_COLUMNS}`,
      [
        input.vesselOwnerName,
        input.vesselCapacity,
        input.vesselCargoType,
        input.vesselStatus,
        input.userId,
      ],
    );
    return mapVessel(result.rows[0]);
  }

  async update(vesselId: EntityId, patch: UpdateVesselRecord): Promise<VesselEntity> {
    const sets: string[] = [];
    const params: unknown[] = [];
    const setColumn = (column: string, value: unknown) => {
      params.push(value);
      sets.push(`${column} = $${params.length}`);
    };

    if (patch.vesselOwnerName !== undefined) setColumn("vessel_owner_name", patch.vesselOwnerName);
    if (patch.vesselCapacity !== undefined) setColumn("vessel_capacity", patch.vesselCapacity);
    if (patch.vesselCargoType !== undefined) setColumn("vessel_cargo_type", patch.vesselCargoType);
    if (patch.vesselStatus !== undefined) setColumn("vessel_status", patch.vesselStatus);

    params.push(vesselId);
    const result = await this.db.query<VesselRow>(
      `UPDATE vessel
       SET ${sets.join(", ")}
       WHERE vessel_id = $${params.length}
       RETURNING ${VESSEL_COLUMNS}`,
      params,
    );
    return mapVessel(result.rows[0]);
  }
}
