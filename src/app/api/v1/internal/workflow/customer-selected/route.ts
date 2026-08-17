import { z } from "zod";
import { BookingPgRepository } from "@/modules/bookings";
import { BookingReviewPgRepository } from "@/modules/booking-reviews";
import {
  WorkflowPgRepository,
  selectCustomer,
  toSelectCustomerResponse,
} from "@/modules/workflow";
import { fail, ok, parseOrThrow, readJsonBody } from "@/shared";

export const dynamic = "force-dynamic";

const schema = z.object({
  booking_id: z.number().int().positive(),
  selected_vessel_id: z.number().int().positive(),
});

const workflow = new WorkflowPgRepository();
const bookings = new BookingPgRepository();
const bookingReviews = new BookingReviewPgRepository();

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const input = parseOrThrow(schema, body);

    const result = await selectCustomer(
      { workflow, bookings, bookingReviews },
      {
        bookingId: input.booking_id,
        selectedVesselId: input.selected_vessel_id,
      },
    );

    return ok(toSelectCustomerResponse(result));
  } catch (error) {
    return fail(error);
  }
}
