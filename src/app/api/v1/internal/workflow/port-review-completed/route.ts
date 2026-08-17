import { z } from "zod";
import { BookingPgRepository } from "@/modules/bookings";
import {
  completePortReview,
  toCompletePortReviewResponse,
} from "@/modules/workflow";
import { fail, ok, parseOrThrow, readJsonBody } from "@/shared";

export const dynamic = "force-dynamic";

const schema = z.object({
  booking_id: z.number().int().positive(),
  port_review_summary: z.string(),
  final_review_decision: z.enum(["APPROVED", "REJECTED", "REQUIRES_UPDATE"]),
});

const bookings = new BookingPgRepository();

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const input = parseOrThrow(schema, body);

    const result = await completePortReview(
      { bookings },
      {
        bookingId: input.booking_id,
        portReviewSummary: input.port_review_summary,
        finalReviewDecision: input.final_review_decision,
      },
    );

    return ok(toCompletePortReviewResponse(result, input.final_review_decision));
  } catch (error) {
    return fail(error);
  }
}
