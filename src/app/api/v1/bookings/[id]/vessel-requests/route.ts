import { BookingPgRepository, getBooking } from "@/modules/bookings";
import { BookingVesselRequestPgRepository } from "@/modules/bookings/infrastructure/booking-vessel-request.pg.repository";
import { getBookingVesselRequests } from "@/modules/bookings/application/get-booking-vessel-requests";
import { toBookingVesselRequestResponse } from "@/modules/bookings/presentation/booking-vessel-request.mapper";
import { fail, ok, parsePathId, resolveRequestActor } from "@/shared";

export const dynamic = "force-dynamic";

const bookings = new BookingPgRepository();
const vesselRequests = new BookingVesselRequestPgRepository();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const bookingId = parsePathId((await context.params).id, "booking id");
    const actor = resolveRequestActor(request);

    await getBooking({ bookings }, bookingId, actor);

    const items = await getBookingVesselRequests({ vesselRequests }, bookingId);

    return ok({
      items: items.map(toBookingVesselRequestResponse),
    });
  } catch (error) {
    console.error("vessel-requests error:", error);
    return fail(error);
  }
}