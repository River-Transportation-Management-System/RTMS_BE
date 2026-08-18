import type { Pool } from "pg";

import { database } from "@/infrastructure/database/postgres";
import type { EntityId } from "@/shared/domain/common";
import type {
  VesselMatchResponseRecord,
  VesselMatchResponseRepository,
} from "@/modules/vessel-matches/application/ports/vessel-match-response.repository";

type VesselMatchResponseRow = {
  match_id: number;
  vessel_id: number;
  booking_id: number;
  vessel_user_id: number | null;
  vessel_owner_name: string | null;
  vessel_status: string | null;
  vessel_capacity: string | null;
  vessel_cargo_type: string | null;
};

export class VesselMatchResponsePgRepository implements VesselMatchResponseRepository {
  constructor(private readonly db: Pool = database) {}

  async findByMatchId(matchId: EntityId): Promise<VesselMatchResponseRecord | null> {
    const result = await this.db.query<VesselMatchResponseRow>(
      `SELECT
         vm.match_id,
         vm.vessel_id,
         vm.booking_id,
         v.user_id AS vessel_user_id,
         v.vessel_owner_name,
         v.vessel_status,
         v.vessel_capacity,
         v.vessel_cargo_type
       FROM vessel_match vm
       INNER JOIN vessel v ON v.vessel_id = vm.vessel_id
       WHERE vm.match_id = $1
       LIMIT 1`,
      [matchId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      matchId: row.match_id,
      vesselId: row.vessel_id,
      bookingId: row.booking_id,
      vesselUserId: row.vessel_user_id,
      vesselOwnerName: row.vessel_owner_name,
      vesselStatus: row.vessel_status,
      vesselCapacity: row.vessel_capacity,
      vesselCargoType: row.vessel_cargo_type,
    };
  }
}
