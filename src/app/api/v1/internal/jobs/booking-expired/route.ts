import { database } from "@/infrastructure/database/postgres";
import { fail, ok } from "@/shared";
import { CORS_HEADERS } from "@/shared/http/api-response";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    // 1. Quá hạn các booking vượt quá expired_date
    const result = await database.query(
      `UPDATE booking
       SET booking_status = 'EXPIRED'
       WHERE booking_status IN ('PENDING', 'PENDING_PORT_REVIEW', 'WAITING_VESSEL_RESPONSE', 'VESSEL_CANDIDATES_READY', 'WAITING_CUSTOMER_SELECTION')
         AND expired_date < CURRENT_TIMESTAMP
       RETURNING booking_id`,
    );

    const expiredIds: number[] = result.rows.map(row => row.booking_id);

    // 2. Đóng và hủy toàn bộ yêu cầu ghép tàu liên quan với các chủ tàu
    let closedMatchesCount = 0;
    if (expiredIds.length > 0) {
      const matchResult = await database.query(
        `UPDATE vessel_match
         SET match_status = 'EXPIRED', response_at = COALESCE(response_at, CURRENT_TIMESTAMP)
         WHERE booking_id = ANY($1::int[])
           AND match_status IN ('PENDING', 'ACCEPTED', 'SELECTED')
         RETURNING match_id`,
        [expiredIds],
      );
      closedMatchesCount = matchResult.rowCount || 0;

      // 3. Hủy các chuyến shipment đã lên kế hoạch nhưng chưa bốc xếp
      await database.query(
        `UPDATE shipment
         SET shipment_status = 'CANCELLED'
         WHERE review_id IN (
           SELECT review_id FROM booking_review WHERE booking_id = ANY($1::int[])
         )
         AND shipment_status = 'PLANNED'`,
        [expiredIds],
      );
    }

    return ok({
      success: true,
      expired_booking_ids: expiredIds,
      processed_count: expiredIds.length,
      closed_vessel_matches_count: closedMatchesCount,
      job_status: "COMPLETED",
      message: `Đã hết hạn ${expiredIds.length} đơn hàng quá hạn và đóng ${closedMatchesCount} yêu cầu ghép tàu với các chủ tàu.`,
    });
  } catch (error) {
    return fail(error);
  }
}
