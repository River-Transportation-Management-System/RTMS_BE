import { z } from "zod";
import { database } from "@/infrastructure/database/postgres";
import { fail, ok, parseOrThrow, readJsonBody } from "@/shared";

export const dynamic = "force-dynamic";

const schema = z.object({
  booking_ids: z.array(z.number().int().positive()),
  reminder_target_context: z.string(),
  reminder_schedule_metadata: z.any().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const input = parseOrThrow(schema, body);

    const affectedEntityIds = [];

    for (const bookingId of input.booking_ids) {
      const bookingResult = await database.query(
        `SELECT user_id, booking_status FROM booking WHERE booking_id = $1`,
        [bookingId],
      );

      if (bookingResult.rows.length > 0) {
        const booking = bookingResult.rows[0];
        if (booking.user_id) {
          console.log(`[Reminder Dispatcher] Reminded user ${booking.user_id} about booking #${bookingId} (Status: ${booking.booking_status}) in context ${input.reminder_target_context}`);
          affectedEntityIds.push({
            booking_id: bookingId,
            user_id: booking.user_id,
          });
        }
      }
    }

    return ok({
      success: true,
      delivery_status: "LOGGED",
      affected_entity_ids: affectedEntityIds,
      processed_count: affectedEntityIds.length,
      job_status: "COMPLETED",
    });
  } catch (error) {
    return fail(error);
  }
}
