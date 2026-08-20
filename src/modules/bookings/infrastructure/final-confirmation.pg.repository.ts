import type { Pool } from "pg";

import type {
  ApprovedPortContext,
  CreateFinalConfirmationRecord,
  FinalConfirmationRepository,
  FinalConfirmationResult,
} from "@/modules/bookings/application/ports/final-confirmation.repository";
import { database } from "@/infrastructure/database/postgres";
import type { EntityId } from "@/shared/domain/common";

type ApprovedPortContextRow = {
  review_id: number;
  port_user_id: number | null;
};

type FinalConfirmationRow = {
  confirmation_id: number;
  booking_id: number;
  match_id: number;
  vessel_id: number;
  port_id: number;
  confirmation_actor_id: number;
  confirmation_note: string | null;
  confirmed_at: Date;
  service_creation_status: "CREATED";
  service_created_at: Date;
  shipment_id: number;
};

export class FinalConfirmationPgRepository implements FinalConfirmationRepository {
  constructor(private readonly db: Pool = database) {}

  async findApprovedPortContext(
    bookingId: EntityId,
    portId: EntityId,
  ): Promise<ApprovedPortContext | null> {
    const result = await this.db.query<ApprovedPortContextRow>(
      `SELECT br.review_id, p.user_id AS port_user_id
       FROM booking_review br
       INNER JOIN port p ON p.port_id = br.port_id
       WHERE br.booking_id = $1
         AND br.port_id = $2
         AND br.review_status = 'APPROVED'
       LIMIT 1`,
      [bookingId, portId],
    );

    const row = result.rows[0];
    return row
      ? { reviewId: row.review_id, portUserId: row.port_user_id }
      : null;
  }

  async existsForBooking(bookingId: EntityId): Promise<boolean> {
    const result = await this.db.query<{ exists: boolean }>(
      `SELECT EXISTS(
         SELECT 1 FROM booking_final_confirmation WHERE booking_id = $1
       ) AS exists`,
      [bookingId],
    );

    return result.rows[0]?.exists ?? false;
  }

  async create(input: CreateFinalConfirmationRecord): Promise<FinalConfirmationResult> {
    const client = await this.db.connect();

    try {
      await client.query("BEGIN");

      const shipmentResult = await client.query<{
        shipment_id: number;
        shipment_status: "PLANNED";
        shipment_date: Date;
      }>(
        `INSERT INTO shipment (shipment_status, shipment_date, vessel_id, review_id)
         VALUES ('PLANNED', CURRENT_TIMESTAMP, $1, $2)
         RETURNING shipment_id, shipment_status, shipment_date`,
        [input.vesselId, input.reviewId],
      );
      const shipment = shipmentResult.rows[0];

      const bookingResult = await client.query<{ booking_id: number }>(
        `UPDATE booking
         SET booking_status = 'IN_PROGRESS'
         WHERE booking_id = $1
           AND booking_status IN ('MATCHED', 'WAITING_FINAL_CONFIRMATION')
         RETURNING booking_id`,
        [input.bookingId],
      );
      if (!bookingResult.rows[0]) {
        throw new Error("BOOKING_WORKFLOW_CHANGED");
      }

      const confirmationResult = await client.query<FinalConfirmationRow>(
        `INSERT INTO booking_final_confirmation (
           booking_id,
           match_id,
           vessel_id,
           port_id,
           confirmation_actor_id,
           confirmation_note,
           shipment_id
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING
           confirmation_id,
           booking_id,
           match_id,
           vessel_id,
           port_id,
           confirmation_actor_id,
           confirmation_note,
           confirmed_at,
           service_creation_status,
           service_created_at,
           shipment_id`,
        [
          input.bookingId,
          input.matchId,
          input.vesselId,
          input.portId,
          input.confirmationActorId,
          input.confirmationNote,
          shipment.shipment_id,
        ],
      );
      const confirmation = confirmationResult.rows[0];

      await client.query("COMMIT");

      return {
        confirmationId: confirmation.confirmation_id,
        bookingId: confirmation.booking_id,
        matchId: confirmation.match_id,
        vesselId: confirmation.vessel_id,
        portId: confirmation.port_id,
        confirmationActorId: confirmation.confirmation_actor_id,
        confirmationNote: confirmation.confirmation_note,
        confirmedAt: confirmation.confirmed_at,
        serviceCreationStatus: confirmation.service_creation_status,
        serviceCreatedAt: confirmation.service_created_at,
        shipmentId: confirmation.shipment_id,
        shipmentStatus: shipment.shipment_status,
        bookingWorkflowState: "IN_PROGRESS",
        workflowChangedAt: confirmation.confirmed_at,
      };
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);

      if (isUniqueViolation(error)) {
        throw new Error("FINAL_CONFIRMATION_ALREADY_EXISTS");
      }
      throw error;
    } finally {
      client.release();
    }
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}
