import {
  BookingPgRepository,
  finalConfirmBooking,
  finalConfirmationSchema,
  FinalConfirmationPgRepository,
  toFinalConfirmationResponse,
  VesselSelectionPgRepository,
} from "@/modules/bookings";
import {
  created,
  fail,
  parseOrThrow,
  parsePathId,
  readJsonBody,
  resolveRequestActor,
} from "@/shared";

export const dynamic = "force-dynamic";

const bookings = new BookingPgRepository();
const vesselSelections = new VesselSelectionPgRepository();
const finalConfirmations = new FinalConfirmationPgRepository();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const bookingId = parsePathId((await context.params).id, "booking id");
    const body = await readJsonBody(request);
    const input = parseOrThrow(finalConfirmationSchema, body);
    const actor = resolveRequestActor(request);
    const result = await finalConfirmBooking(
      { bookings, vesselSelections, finalConfirmations },
      bookingId,
      input,
      actor,
    );

    return created(toFinalConfirmationResponse(result));
  } catch (error) {
    return fail(error);
  }
}
