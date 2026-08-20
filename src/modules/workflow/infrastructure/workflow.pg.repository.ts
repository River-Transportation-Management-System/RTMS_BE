import type { Pool } from "pg";
import { database } from "@/infrastructure/database/postgres";
import type { WorkflowRepository, WorkflowSnapshot } from "../application/ports/workflow.repository";
import type { EntityId } from "@/shared/domain/common";

export class WorkflowPgRepository implements WorkflowRepository {
  constructor(private readonly db: Pool = database) {}

  async getSnapshot(bookingId: EntityId): Promise<WorkflowSnapshot | null> {
    const bookingResult = await this.db.query(
      `SELECT booking_id, booking_date, receive_date, expected_date, expired_date, booking_status, route_id, cargo_type, cargo_capacity, notes
       FROM booking
       WHERE booking_id = $1`,
      [bookingId],
    );

    if (bookingResult.rowCount === 0) {
      return null;
    }

    const bookingRow = bookingResult.rows[0];

    const reviewsResult = await this.db.query(
      `SELECT review_id, port_id, review_status, review_date, review_note
       FROM booking_review
       WHERE booking_id = $1
       ORDER BY review_id ASC`,
      [bookingId],
    );

    const matchesResult = await this.db.query(
      `SELECT match_id, vessel_id, match_status, created_at, response_at
       FROM vessel_match
       WHERE booking_id = $1
       ORDER BY match_id ASC`,
      [bookingId],
    );

    const reviewIds = reviewsResult.rows.map(r => r.review_id);
    let shipmentsRows: any[] = [];
    if (reviewIds.length > 0) {
      const shipmentsResult = await this.db.query(
        `SELECT shipment_id, shipment_status, shipment_date, vessel_id, review_id
         FROM shipment
         WHERE review_id = ANY($1)
         ORDER BY shipment_id ASC`,
        [reviewIds],
      );
      shipmentsRows = shipmentsResult.rows;
    }

    return {
      booking: {
        bookingId: bookingRow.booking_id,
        bookingStatus: bookingRow.booking_status,
        bookingDate: bookingRow.booking_date,
        receiveDate: bookingRow.receive_date,
        expectedDate: bookingRow.expected_date,
        expiredDate: bookingRow.expired_date,
        cargoType: bookingRow.cargo_type,
        cargoCapacity: bookingRow.cargo_capacity == null ? null : String(bookingRow.cargo_capacity),
        routeId: bookingRow.route_id,
        notes: bookingRow.notes,
      },
      reviews: reviewsResult.rows.map(r => ({
        reviewId: r.review_id,
        portId: r.port_id,
        reviewStatus: r.review_status,
        reviewDate: r.review_date,
        reviewNote: r.review_note,
      })),
      matches: matchesResult.rows.map(m => ({
        matchId: m.match_id,
        vesselId: m.vessel_id,
        matchStatus: m.match_status,
        createdAt: m.created_at,
        responseAt: m.response_at,
      })),
      shipments: shipmentsRows.map(s => ({
        shipmentId: s.shipment_id,
        shipmentStatus: s.shipment_status,
        shipmentDate: s.shipment_date,
        vesselId: s.vessel_id,
        reviewId: s.review_id,
      })),
    };
  }

  async updateVesselMatchResponse(matchId: EntityId, status: string, timestamp: Date): Promise<any> {
    const result = await this.db.query(
      `UPDATE vessel_match
       SET match_status = $1, response_at = $2
       WHERE match_id = $3
       RETURNING match_id, booking_id, vessel_id, match_status, response_at`,
      [status, timestamp, matchId],
    );

    return result.rows[0];
  }

  async updateVesselMatchSelected(bookingId: EntityId, selectedVesselId: EntityId): Promise<void> {
    await this.db.query(
      `UPDATE vessel_match
       SET match_status = 'SELECTED'
       WHERE booking_id = $1 AND vessel_id = $2`,
      [bookingId, selectedVesselId],
    );

    await this.db.query(
      `UPDATE vessel_match
       SET match_status = 'REJECTED'
       WHERE booking_id = $1 AND vessel_id != $2 AND match_status IN ('ACCEPTED', 'PENDING')`,
      [bookingId, selectedVesselId],
    );
  }

  async createShipment(vesselId: EntityId, reviewId: EntityId): Promise<EntityId> {
    const result = await this.db.query(
      `INSERT INTO shipment (shipment_status, shipment_date, vessel_id, review_id)
       VALUES ('PLANNED', CURRENT_TIMESTAMP, $1, $2)
       RETURNING shipment_id`,
      [vesselId, reviewId],
    );

    return result.rows[0].shipment_id;
  }
}
