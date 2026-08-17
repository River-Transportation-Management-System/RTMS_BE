import type { Pool } from "pg";
import { database } from "@/infrastructure/database/postgres";
import type { MatchingRepository, VesselMatchDetail } from "../application/ports/matching.repository";
import type { EntityId } from "@/shared/domain/common";

export class MatchingPgRepository implements MatchingRepository {
  constructor(private readonly db: Pool = database) {}

  async findMatchesByBookingId(bookingId: EntityId): Promise<VesselMatchDetail[]> {
    const result = await this.db.query(
      `SELECT vm.match_id, vm.vessel_id, vm.booking_id, vm.match_status, vm.created_at, vm.response_at,
              v.vessel_owner_name, v.vessel_capacity, v.vessel_cargo_type, v.vessel_status
       FROM vessel_match vm
       JOIN vessel v ON vm.vessel_id = v.vessel_id
       WHERE vm.booking_id = $1`,
      [bookingId],
    );

    return result.rows.map(row => ({
      matchId: row.match_id,
      vesselId: row.vessel_id,
      bookingId: row.booking_id,
      matchStatus: row.match_status,
      createdAt: row.created_at,
      responseAt: row.response_at,
      vesselOwnerName: row.vessel_owner_name,
      vesselCapacity: row.vessel_capacity == null ? null : String(row.vessel_capacity),
      vesselCargoType: row.vessel_cargo_type,
      vesselStatus: row.vessel_status,
    }));
  }
}
