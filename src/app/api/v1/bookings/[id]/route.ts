import {
  BookingPgRepository,
  cancelBooking,
  getBooking,
  toBookingDetailResponse,
  toBookingResponse,
  updateBooking,
  updateBookingSchema,
} from "@/modules/bookings";
import { RoutePgRepository } from "@/modules/routes";
import {
  fail,
  ok,
  parseOrThrow,
  parsePathId,
  readJsonBody,
  resolveRequestActor,
} from "@/shared";

export const dynamic = "force-dynamic";

const bookings = new BookingPgRepository();
const routes = new RoutePgRepository();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const bookingId = parsePathId((await context.params).id, "booking id");
    const actor = resolveRequestActor(request);
    const booking = await getBooking({ bookings }, bookingId, actor);

    return ok(toBookingDetailResponse(booking));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const bookingId = parsePathId((await context.params).id, "booking id");
    const body = await readJsonBody(request);
    const input = parseOrThrow(updateBookingSchema, body);
    const actor = resolveRequestActor(request);
    const booking = await updateBooking({ bookings, routes }, bookingId, input, actor);

    return ok(toBookingResponse(booking));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const bookingId = parsePathId((await context.params).id, "booking id");
    const actor = resolveRequestActor(request);
    const result = await cancelBooking({ bookings }, bookingId, actor);

    return ok({
      success: true,
      message: result.message,
      booking_id: result.bookingId,
      booking_status: result.bookingStatus,
    });
  } catch (error) {
    return fail(error);
  }
}
