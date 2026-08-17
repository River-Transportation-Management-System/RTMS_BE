import { BookingPgRepository } from "@/modules/bookings";
import {
  MatchingPgRepository,
  getBookingMatches,
  toMatchingResponse,
} from "@/modules/matching";
import { fail, ok, parsePathId } from "@/shared";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ bookingId: string }>;
};

const bookings = new BookingPgRepository();
const matching = new MatchingPgRepository();

export async function GET(request: Request, context: RouteContext) {
  try {
    const bookingId = parsePathId((await context.params).bookingId, "booking id");

    const result = await getBookingMatches({ bookings, matching }, bookingId);

    return ok(toMatchingResponse(result));
  } catch (error) {
    return fail(error);
  }
}
