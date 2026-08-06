import type { Pool } from "pg";

import type {
  BookingReviewRepository,
  CreateBookingReviewRecord,
} from "@/modules/booking-reviews/application/ports/booking-review.repository";
import type {
  BookingReviewEntity,
  BookingReviewSummary,
} from "@/modules/booking-reviews/domain/booking-review.entity";
import { database } from "@/infrastructure/database/postgres";
import type { EntityId } from "@/shared/domain/common";

type ReviewRow = {
  review_id: number;
  booking_id: number | null;
  port_id: number | null;
  review_status: string | null;
  review_date: Date | null;
  review_note: string | null;
};

function mapReview(row: ReviewRow): BookingReviewEntity {
  return {
    reviewId: row.review_id,
    bookingId: row.booking_id,
    portId: row.port_id,
    reviewStatus: row.review_status,
    reviewDate: row.review_date,
    reviewNote: row.review_note,
  };
}

function buildSummary(row: ReviewRow): BookingReviewSummary {
  const note = row.review_note?.trim();
  const status = row.review_status ?? "UNKNOWN";
  const summary = note
    ? `${status}: ${note}`
    : `Port ${row.port_id ?? "n/a"} reviewed as ${status}`;

  return {
    reviewId: row.review_id,
    portId: row.port_id,
    reviewStatus: row.review_status,
    reviewDate: row.review_date,
    reviewNote: row.review_note,
    summary,
  };
}

const REVIEW_COLUMNS = `
  review_id,
  booking_id,
  port_id,
  review_status,
  review_date,
  review_note
`;

export class BookingReviewPgRepository implements BookingReviewRepository {
  constructor(private readonly db: Pool = database) {}

  async create(input: CreateBookingReviewRecord): Promise<BookingReviewEntity> {
    try {
      const result = await this.db.query<ReviewRow>(
        `INSERT INTO booking_review (
           booking_id,
           port_id,
           review_status,
           review_date,
           review_note
         ) VALUES ($1, $2, $3, $4, $5)
         RETURNING ${REVIEW_COLUMNS}`,
        [
          input.bookingId,
          input.portId,
          input.reviewStatus,
          input.reviewDate,
          input.reviewNote,
        ],
      );

      return mapReview(result.rows[0]);
    } catch (error) {
      if (isUniqueViolation(error)) {
        const conflict = new Error("UNIQUE_BOOKING_PORT_REVIEW");
        conflict.name = "UniqueBookingPortReviewError";
        throw conflict;
      }
      throw error;
    }
  }

  async listByBookingId(bookingId: EntityId): Promise<BookingReviewSummary[]> {
    const result = await this.db.query<ReviewRow>(
      `SELECT ${REVIEW_COLUMNS}
       FROM booking_review
       WHERE booking_id = $1
       ORDER BY review_date DESC NULLS LAST, review_id DESC`,
      [bookingId],
    );

    return result.rows.map(buildSummary);
  }

  async existsForBookingPort(bookingId: EntityId, portId: EntityId): Promise<boolean> {
    const result = await this.db.query<{ exists: boolean }>(
      `SELECT EXISTS(
         SELECT 1
         FROM booking_review
         WHERE booking_id = $1
           AND port_id = $2
       ) AS exists`,
      [bookingId, portId],
    );

    return result.rows[0]?.exists ?? false;
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
