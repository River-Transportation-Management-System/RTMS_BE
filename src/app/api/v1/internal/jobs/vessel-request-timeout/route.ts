import { database } from "@/infrastructure/database/postgres";
import { fail, ok } from "@/shared";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const result = await database.query(
      `UPDATE vessel_match
       SET match_status = 'TIMEOUT', response_at = CURRENT_TIMESTAMP
       WHERE match_status = 'PENDING'
         AND created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours'
       RETURNING match_id`,
    );

    const timedOutIds = result.rows.map(row => row.match_id);

    return ok({
      success: true,
      timed_out_match_ids: timedOutIds,
      processed_count: timedOutIds.length,
      job_status: "COMPLETED",
      message: `Timed out ${timedOutIds.length} pending vessel matches after 24 hours.`,
    });
  } catch (error) {
    return fail(error);
  }
}
