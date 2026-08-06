import { BookingPgRepository } from "@/modules/bookings";
import {
  BookingReviewPgRepository,
  listPortReviews,
  toBookingReviewSummaryResponse,
} from "@/modules/booking-reviews";
import {
  fail,
  ok,
  parsePathId,
  resolveRequestActor,
} from "@/shared";

export const dynamic = "force-dynamic";

const bookings = new BookingPgRepository();
const reviews = new BookingReviewPgRepository();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const bookingId = parsePathId((await context.params).id, "booking id");
    const actor = resolveRequestActor(request);
    const items = await listPortReviews({ bookings, reviews }, bookingId, actor);

    return ok({
      booking_id: bookingId,
      items: items.map(toBookingReviewSummaryResponse),
    });
  } catch (error) {
    return fail(error);
  }
}
