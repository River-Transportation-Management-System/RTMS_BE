import { z } from "zod";
import { publishEvent } from "@/modules/events";
import { fail, ok, parseOrThrow, readJsonBody } from "@/shared";

export const dynamic = "force-dynamic";

const schema = z.object({
  event_name: z.string().min(1),
  entity_ids: z.any(),
  payload: z.any(),
  source_service: z.string().min(1),
  timestamp: z.string().transform(v => new Date(v)),
});

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const input = parseOrThrow(schema, body);

    const result = await publishEvent({
      eventName: input.event_name,
      entityIds: input.entity_ids,
      payload: input.payload,
      sourceService: input.source_service,
      timestamp: input.timestamp,
    });

    return ok({
      success: true,
      event_id: result.eventId,
      acknowledged: result.acknowledged,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return fail(error);
  }
}
