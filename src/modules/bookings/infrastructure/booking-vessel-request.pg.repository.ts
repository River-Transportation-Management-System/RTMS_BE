import type { Pool } from "pg";

import { database } from "@/infrastructure/database/postgres";
import type { EntityId } from "@/shared/domain/common";
import type {
  BookingVesselRequestRecord,
  BookingVesselRequestRepository,
} from "@/modules/bookings/application/ports/booking-vessel-request.repository";

type VesselRequestRow = {
  match_id: number;
  vessel_id: number;
  vessel_owner_name: string | null;
  vessel_status: string | null;
  vessel_capacity: string | null;
  vessel_cargo_type: string | null;
  vessel_user_id: number | null;
};

export class BookingVesselRequestPgRepository implements BookingVesselRequestRepository {
  constructor(private readonly db: Pool = database) {}

  async listByBookingId(bookingId: EntityId): Promise<BookingVesselRequestRecord[]> {
    const result = await this.db.query<VesselRequestRow>(
      `SELECT
         vm.match_id,
         vm.vessel_id,
         v.vessel_owner_name,
         v.vessel_status,
         v.vessel_capacity,
         v.vessel_cargo_type,
         v.user_id AS vessel_user_id
       FROM vessel_match vm
       INNER JOIN vessel v ON v.vessel_id = vm.vessel_id
       WHERE vm.booking_id = $1
       ORDER BY vm.match_id ASC`,
      [bookingId],
    );

    return result.rows.map((row) => ({
      matchId: row.match_id,
      vesselId: row.vessel_id,
      vesselOwnerName: row.vessel_owner_name,
      vesselStatus: row.vessel_status,
      vesselCapacity: row.vessel_capacity,
      vesselCargoType: row.vessel_cargo_type,
      vesselUserId: row.vessel_user_id,
    }));
  }
}