import { NextResponse } from "next/server";

import {
  respondVesselMatch,
  toVesselMatchResponse,
  vesselMatchResponseSchema,
  VesselMatchResponsePgRepository,
} from "@/modules/vessel-matches";
import { fail, ok, parseOrThrow, parsePathId, readJsonBody, resolveRequestActor } from "@/shared";

export const dynamic = "force-dynamic";

const vesselMatches = new VesselMatchResponsePgRepository();

type RouteContext = {
  params: Promise<{ matchId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const matchId = parsePathId((await context.params).matchId, "match id");
    const body = await readJsonBody(request);
    const input = parseOrThrow(vesselMatchResponseSchema, body);
    const actor = resolveRequestActor(request);

    const result = await respondVesselMatch(
      {
        vesselMatches,
        onRespond: async (payload) => {
          console.info("[vessel-match-response] side effect", {
            matchId: payload.matchId,
            vesselId: payload.vesselId,
            bookingId: payload.bookingId,
            responseStatus: payload.responseOutcome.responseStatus,
          });
        },
      },
      matchId,
      input,
      actor,
    );

    return ok(toVesselMatchResponse(result));
  } catch (error) {
    return fail(error);
  }
}
