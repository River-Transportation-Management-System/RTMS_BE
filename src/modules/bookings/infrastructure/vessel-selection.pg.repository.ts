import type { Pool } from "pg";

import type {
  SaveVesselSelectionRecord,
  SelectedVesselDetails,
  VesselMatchSelectionRecord,
  VesselSelectionRepository,
} from "@/modules/bookings/application/ports/vessel-selection.repository";
import { database } from "@/infrastructure/database/postgres";
import type { EntityId } from "@/shared/domain/common";

type VesselMatchSelectionRow = {
  match_id: number;
  booking_id: number;
  vessel_id: number;
};

type SelectedVesselRow = VesselMatchSelectionRow & {
  vessel_status: string | null;
  vessel_capacity: string | null;
  vessel_cargo_type: string | null;
  vessel_owner_name: string | null;
  owner_user_id: number | null;
  owner_user_name: string | null;
  owner_user_email: string | null;
  owner_user_phone: string | null;
  selection_note: string | null;
  selected_at: Date;
  selection_status: "FINALIZED";
  finalized_at: Date;
};

export class VesselSelectionPgRepository implements VesselSelectionRepository {
  constructor(private readonly db: Pool = database) {}

  async findMatchForBooking(
    bookingId: EntityId,
    vesselId: EntityId,
  ): Promise<VesselMatchSelectionRecord | null> {
    const result = await this.db.query<VesselMatchSelectionRow>(
      `SELECT match_id, booking_id, vessel_id
       FROM vessel_match
       WHERE booking_id = $1
         AND vessel_id = $2
       ORDER BY match_id ASC
       LIMIT 1`,
      [bookingId, vesselId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      matchId: row.match_id,
      bookingId: row.booking_id,
      vesselId: row.vessel_id,
    };
  }

  async findSelectedVesselByBookingId(
    bookingId: EntityId,
  ): Promise<SelectedVesselDetails | null> {
    const result = await this.db.query<SelectedVesselRow>(
      `SELECT
         bvs.match_id,
         bvs.booking_id,
         bvs.vessel_id,
         v.vessel_status,
         v.vessel_capacity,
         v.vessel_cargo_type,
         v.vessel_owner_name,
         owner.user_id AS owner_user_id,
         owner.user_name AS owner_user_name,
         owner.user_email AS owner_user_email,
         owner.user_phone AS owner_user_phone,
         bvs.selection_note,
         bvs.selected_at,
         bvs.selection_status,
         bvs.finalized_at
       FROM booking_vessel_selection bvs
       INNER JOIN vessel_match vm
         ON vm.match_id = bvs.match_id
        AND vm.booking_id = bvs.booking_id
        AND vm.vessel_id = bvs.vessel_id
       INNER JOIN vessel v ON v.vessel_id = bvs.vessel_id
       LEFT JOIN "user" owner ON owner.user_id = v.user_id
       WHERE bvs.booking_id = $1
       LIMIT 1`,
      [bookingId],
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      matchId: row.match_id,
      bookingId: row.booking_id,
      vesselId: row.vessel_id,
      vesselStatus: row.vessel_status,
      vesselCapacity: row.vessel_capacity == null ? null : String(row.vessel_capacity),
      vesselCargoType: row.vessel_cargo_type,
      vesselOwnerName: row.vessel_owner_name,
      ownerUserId: row.owner_user_id,
      ownerUserName: row.owner_user_name,
      ownerUserEmail: row.owner_user_email,
      ownerUserPhone: row.owner_user_phone,
      selectionNote: row.selection_note,
      selectedAt: row.selected_at,
      selectionStatus: row.selection_status,
      finalizedAt: row.finalized_at,
    };
  }

  async saveSelection(input: SaveVesselSelectionRecord): Promise<void> {
    const confirmation = await this.db.query<{ exists: boolean }>(
      `SELECT EXISTS(
         SELECT 1 FROM booking_final_confirmation WHERE booking_id = $1
       ) AS exists`,
      [input.bookingId],
    );
    if (confirmation.rows[0]?.exists) {
      throw new Error("VESSEL_SELECTION_ALREADY_CONFIRMED");
    }

    await this.db.query(
      `INSERT INTO booking_vessel_selection (
         booking_id,
         match_id,
         vessel_id,
         selection_note,
         selection_status,
         finalized_at
       ) VALUES ($1, $2, $3, $4, 'FINALIZED', CURRENT_TIMESTAMP)
       ON CONFLICT (booking_id) DO UPDATE
       SET match_id = EXCLUDED.match_id,
           vessel_id = EXCLUDED.vessel_id,
           selection_note = EXCLUDED.selection_note,
           selected_at = CURRENT_TIMESTAMP,
           selection_status = 'FINALIZED',
           finalized_at = CURRENT_TIMESTAMP`,
      [input.bookingId, input.matchId, input.vesselId, input.selectionNote],
    );
  }
}
