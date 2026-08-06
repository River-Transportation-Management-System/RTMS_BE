import { BookingPgRepository } from "@/modules/bookings";
import {
  BookingReviewPgRepository,
  createPortReview,
  createPortReviewSchema,
  toBookingReviewResponse,
} from "@/modules/booking-reviews";
import { PortPgRepository } from "@/modules/ports";
import {
  created,
  fail,
  parseOrThrow,
  parsePathId,
  readJsonBody,
} from "@/shared";

export const dynamic = "force-dynamic";

const bookings = new BookingPgRepository();
const reviews = new BookingReviewPgRepository();
const ports = new PortPgRepository();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const bookingId = parsePathId((await context.params).id, "booking id");
    const body = await readJsonBody(request);
    const input = parseOrThrow(createPortReviewSchema, body);
    const review = await createPortReview({ bookings, reviews, ports }, bookingId, input);

    return created(toBookingReviewResponse(review));
  } catch (error) {
    return fail(error);
  }
}
