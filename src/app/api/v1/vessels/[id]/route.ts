import {
  getVessel,
  toVesselResponse,
  updateVessel,
  updateVesselSchema,
  VesselPgRepository,
} from "@/modules/vessels";
import {
  fail,
  ok,
  parseOrThrow,
  parsePathId,
  readJsonBody,
  resolveRequestActor,
} from "@/shared";

export const dynamic = "force-dynamic";

const vessels = new VesselPgRepository();
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const vesselId = parsePathId((await context.params).id, "vessel id");
    const actor = resolveRequestActor(request);
    const vessel = await getVessel({ vessels }, vesselId, actor);
    return ok(toVesselResponse(vessel));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const vesselId = parsePathId((await context.params).id, "vessel id");
    const actor = resolveRequestActor(request);
    const input = parseOrThrow(updateVesselSchema, await readJsonBody(request));
    const vessel = await updateVessel({ vessels }, vesselId, input, actor);
    return ok(toVesselResponse(vessel));
  } catch (error) {
    return fail(error);
  }
}
