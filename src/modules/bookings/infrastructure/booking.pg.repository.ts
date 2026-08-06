import type { Pool } from "pg";

import type {
  CreateBookingRecord,
  ListBookingsFilter,
  UpdateBookingRecord,
  BookingRepository,
} from "@/modules/bookings/application/ports/booking.repository";
import type {
  BookingDetail,
  BookingEntity,
  BookingStatus,
} from "@/modules/bookings/domain/booking.entity";
import { database } from "@/infrastructure/database/postgres";
import type { EntityId } from "@/shared/domain/common";
import {
  paginationOffset,
  toPaginatedResult,
  type PaginationInput,
} from "@/shared/http/pagination";

type BookingRow = {
  booking_id: number;
  booking_date: Date | null;
  receive_date: Date | null;
  expected_date: Date | null;
  expired_date: Date | null;
  booking_status: string | null;
  cargo_type: string | null;
  cargo_capacity: string | null;
  notes: string | null;
  user_id: number | null;
  route_id: number | null;
};

function mapBooking(row: BookingRow): BookingEntity {
  return {
    bookingId: row.booking_id,
    bookingDate: row.booking_date,
    receiveDate: row.receive_date,
    expectedDate: row.expected_date,
    expiredDate: row.expired_date,
    bookingStatus: row.booking_status,
    cargoType: row.cargo_type,
    cargoCapacity: row.cargo_capacity == null ? null : String(row.cargo_capacity),
    notes: row.notes,
    userId: row.user_id,
    routeId: row.route_id,
  };
}

const BOOKING_COLUMNS = `
  booking_id,
  booking_date,
  receive_date,
  expected_date,
  expired_date,
  booking_status,
  cargo_type,
  cargo_capacity,
  notes,
  user_id,
  route_id
`;

export class BookingPgRepository implements BookingRepository {
  constructor(private readonly db: Pool = database) {}

  async create(input: CreateBookingRecord): Promise<BookingEntity> {
    const result = await this.db.query<BookingRow>(
      `INSERT INTO booking (
         booking_date,
         receive_date,
         expected_date,
         expired_date,
         booking_status,
         cargo_type,
         cargo_capacity,
         notes,
         user_id,
         route_id
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING ${BOOKING_COLUMNS}`,
      [
        input.bookingDate,
        input.receiveDate,
        input.expectedDate,
        input.expiredDate,
        input.bookingStatus,
        input.cargoType,
        input.cargoCapacity,
        input.notes,
        input.userId,
        input.routeId,
      ],
    );

    return mapBooking(result.rows[0]);
  }

  async findById(bookingId: EntityId): Promise<BookingEntity | null> {
    const result = await this.db.query<BookingRow>(
      `SELECT ${BOOKING_COLUMNS}
       FROM booking
       WHERE booking_id = $1`,
      [bookingId],
    );

    const row = result.rows[0];
    return row ? mapBooking(row) : null;
  }

  async findDetailById(bookingId: EntityId): Promise<BookingDetail | null> {
    const booking = await this.findById(bookingId);
    if (!booking) {
      return null;
    }

    const [reviews, matches] = await Promise.all([
      this.db.query<{
        total: string;
        pending: string;
        approved: string;
        rejected: string;
      }>(
        `SELECT
           COUNT(*)::text AS total,
           COUNT(*) FILTER (WHERE review_status = 'PENDING')::text AS pending,
           COUNT(*) FILTER (WHERE review_status = 'APPROVED')::text AS approved,
           COUNT(*) FILTER (WHERE review_status = 'REJECTED')::text AS rejected
         FROM booking_review
         WHERE booking_id = $1`,
        [bookingId],
      ),
      this.db.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total
         FROM vessel_match
         WHERE booking_id = $1`,
        [bookingId],
      ),
    ]);

    const reviewRow = reviews.rows[0];
    const matchRow = matches.rows[0];

    return {
      ...booking,
      reviewsSummary: {
        total: Number(reviewRow?.total ?? 0),
        pending: Number(reviewRow?.pending ?? 0),
        approved: Number(reviewRow?.approved ?? 0),
        rejected: Number(reviewRow?.rejected ?? 0),
      },
      matchesSummary: {
        total: Number(matchRow?.total ?? 0),
      },
    };
  }

  async list(filter: ListBookingsFilter, pagination: PaginationInput) {
    const where: string[] = [];
    const params: unknown[] = [];

    const push = (clause: string, value: unknown) => {
      params.push(value);
      where.push(clause.replace("?", `$${params.length}`));
    };

    if (filter.bookingStatus) {
      push("booking_status = ?", filter.bookingStatus);
    }

    if (filter.userId != null) {
      push("user_id = ?", filter.userId);
    }

    if (filter.routeId != null) {
      push("route_id = ?", filter.routeId);
    }

    if (filter.receiveDateFrom) {
      push("receive_date >= ?", filter.receiveDateFrom);
    }

    if (filter.receiveDateTo) {
      push("receive_date <= ?", filter.receiveDateTo);
    }

    if (filter.expectedDateFrom) {
      push("expected_date >= ?", filter.expectedDateFrom);
    }

    if (filter.expectedDateTo) {
      push("expected_date <= ?", filter.expectedDateTo);
    }

    if (filter.bookingDateFrom) {
      push("booking_date >= ?", filter.bookingDateFrom);
    }

    if (filter.bookingDateTo) {
      push("booking_date <= ?", filter.bookingDateTo);
    }

    if (filter.excludeCancelled) {
      where.push("booking_status IS DISTINCT FROM 'CANCELLED'");
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const offset = paginationOffset(pagination);

    const countResult = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM booking ${whereSql}`,
      params,
    );

    const listParams = [...params, pagination.limit, offset];
    const listResult = await this.db.query<BookingRow>(
      `SELECT ${BOOKING_COLUMNS}
       FROM booking
       ${whereSql}
       ORDER BY booking_id DESC
       LIMIT $${params.length + 1}
       OFFSET $${params.length + 2}`,
      listParams,
    );

    return toPaginatedResult(
      listResult.rows.map(mapBooking),
      Number(countResult.rows[0]?.total ?? 0),
      pagination,
    );
  }

  async update(bookingId: EntityId, patch: UpdateBookingRecord): Promise<BookingEntity> {
    const sets: string[] = [];
    const params: unknown[] = [];

    const setColumn = (column: string, value: unknown) => {
      params.push(value);
      sets.push(`${column} = $${params.length}`);
    };

    if (patch.receiveDate !== undefined) {
      setColumn("receive_date", patch.receiveDate);
    }
    if (patch.expectedDate !== undefined) {
      setColumn("expected_date", patch.expectedDate);
    }
    if (patch.expiredDate !== undefined) {
      setColumn("expired_date", patch.expiredDate);
    }
    if (patch.cargoType !== undefined) {
      setColumn("cargo_type", patch.cargoType);
    }
    if (patch.cargoCapacity !== undefined) {
      setColumn("cargo_capacity", patch.cargoCapacity);
    }
    if (patch.notes !== undefined) {
      setColumn("notes", patch.notes);
    }
    if (patch.routeId !== undefined) {
      setColumn("route_id", patch.routeId);
    }

    if (sets.length === 0) {
      const current = await this.findById(bookingId);
      if (!current) {
        throw new Error(`Booking ${bookingId} not found`);
      }
      return current;
    }

    params.push(bookingId);
    const result = await this.db.query<BookingRow>(
      `UPDATE booking
       SET ${sets.join(", ")}
       WHERE booking_id = $${params.length}
       RETURNING ${BOOKING_COLUMNS}`,
      params,
    );

    return mapBooking(result.rows[0]);
  }

  async updateStatus(bookingId: EntityId, status: BookingStatus): Promise<BookingEntity> {
    const result = await this.db.query<BookingRow>(
      `UPDATE booking
       SET booking_status = $1
       WHERE booking_id = $2
       RETURNING ${BOOKING_COLUMNS}`,
      [status, bookingId],
    );

    return mapBooking(result.rows[0]);
  }
}
