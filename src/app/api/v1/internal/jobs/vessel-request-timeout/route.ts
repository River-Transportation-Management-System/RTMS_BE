import { database } from "@/infrastructure/database/postgres";
import { fail, ok } from "@/shared";
import { CORS_HEADERS } from "@/shared/http/api-response";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    // 1. Timeout các vessel_match vẫn PENDING sau 24h (hoặc khi trigger job timeout)
    const timeoutResult = await database.query(
      `UPDATE vessel_match
       SET match_status = 'TIMEOUT', response_at = CURRENT_TIMESTAMP
       WHERE match_status = 'PENDING'
         AND created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours'
       RETURNING match_id, booking_id`,
    );

    const timedOutIds = timeoutResult.rows.map(row => row.match_id);

    // 2. Gom các booking đang ở trạng thái WAITING_VESSEL_RESPONSE:
    // - Nếu có ít nhất 1 tàu ACCEPTED -> Chuyển sang WAITING_CUSTOMER_SELECTION (để khách hàng chọn tàu)
    const readyForSelectionResult = await database.query(
      `UPDATE booking
       SET booking_status = 'WAITING_CUSTOMER_SELECTION'
       WHERE booking_status = 'WAITING_VESSEL_RESPONSE'
         AND EXISTS (
           SELECT 1 FROM vessel_match vm
           WHERE vm.booking_id = booking.booking_id
             AND vm.match_status = 'ACCEPTED'
         )
       RETURNING booking_id`,
    );

    const readyBookingIds = readyForSelectionResult.rows.map(row => row.booking_id);

    // - Nếu không có tàu nào ACCEPTED và không còn tàu nào PENDING -> Chuyển sang NO_VESSEL_ACCEPTED
    const noVesselResult = await database.query(
      `UPDATE booking
       SET booking_status = 'NO_VESSEL_ACCEPTED'
       WHERE booking_status = 'WAITING_VESSEL_RESPONSE'
         AND NOT EXISTS (
           SELECT 1 FROM vessel_match vm
           WHERE vm.booking_id = booking.booking_id
             AND vm.match_status IN ('PENDING', 'ACCEPTED')
         )
       RETURNING booking_id`,
    );

    const noVesselBookingIds = noVesselResult.rows.map(row => row.booking_id);

    return ok({
      success: true,
      timed_out_match_ids: timedOutIds,
      ready_for_customer_selection_booking_ids: readyBookingIds,
      no_vessel_accepted_booking_ids: noVesselBookingIds,
      job_status: "COMPLETED",
      message: `Đã xử lý timeout: ${timedOutIds.length} yêu cầu tàu; Chuyển sang chọn tàu: ${readyBookingIds.length} đơn; Không có tàu nhận: ${noVesselBookingIds.length} đơn.`,
    });
  } catch (error) {
    return fail(error);
  }
}
