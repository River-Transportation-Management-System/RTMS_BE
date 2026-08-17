import { database } from "@/infrastructure/database/postgres";
import { fail, ok } from "@/shared";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const result = await database.query(
      `UPDATE booking
       SET booking_status = 'EXPIRED'
       WHERE booking_status = 'PENDING'
         AND expired_date < CURRENT_TIMESTAMP
       RETURNING booking_id`,
    );

    const expiredIds = result.rows.map(row => row.booking_id);

    return ok({
      success: true,
      expired_booking_ids: expiredIds,
      processed_count: expiredIds.length,
      job_status: "COMPLETED",
      message: `Expired ${expiredIds.length} pending bookings passing their expired date.`,
    });
  } catch (error) {
    return fail(error);
  }
}
