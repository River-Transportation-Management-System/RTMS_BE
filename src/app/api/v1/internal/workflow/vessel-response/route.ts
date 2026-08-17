import { z } from "zod";
import { BookingPgRepository } from "@/modules/bookings";
import {
  WorkflowPgRepository,
  respondVessel,
  toRespondVesselResponse,
} from "@/modules/workflow";
import { fail, ok, parseOrThrow, readJsonBody } from "@/shared";

export const dynamic = "force-dynamic";

const schema = z.object({
  request_id: z.number().int().positive(),
  vessel_response_status: z.enum(["ACCEPTED", "REJECTED"]),
  response_timestamp: z.string().transform(v => new Date(v)),
});

const workflow = new WorkflowPgRepository();
const bookings = new BookingPgRepository();

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const input = parseOrThrow(schema, body);

    const result = await respondVessel(
      { workflow, bookings },
      {
        requestId: input.request_id,
        vesselResponseStatus: input.vessel_response_status,
        responseTimestamp: input.response_timestamp,
      },
    );

    return ok(toRespondVesselResponse(result));
  } catch (error) {
    return fail(error);
  }
}
