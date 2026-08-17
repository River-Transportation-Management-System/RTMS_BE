import {
  BookingPgRepository,
  getSelectedVesselForBooking,
  selectVesselForBooking,
  selectVesselForBookingSchema,
  toSelectedVesselResponse,
  VesselSelectionPgRepository,
} from "@/modules/bookings";
import { fail, ok, parseOrThrow, parsePathId, readJsonBody } from "@/shared";

export const dynamic = "force-dynamic";

const bookings = new BookingPgRepository();
const vesselSelections = new VesselSelectionPgRepository();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const bookingId = parsePathId((await context.params).id, "booking id");
    const body = await readJsonBody(request);
    const input = parseOrThrow(selectVesselForBookingSchema, body);
    const match = await selectVesselForBooking(
      { bookings, vesselSelections },
      bookingId,
      input,
    );

    return ok({
      match_id: match.matchId,
      booking_id: match.bookingId,
      vessel_id: match.vesselId,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const bookingId = parsePathId((await context.params).id, "booking id");
    const selectedVessel = await getSelectedVesselForBooking(
      { bookings, vesselSelections },
      bookingId,
    );

    return ok(toSelectedVesselResponse(selectedVessel));
  } catch (error) {
    return fail(error);
  }
}
