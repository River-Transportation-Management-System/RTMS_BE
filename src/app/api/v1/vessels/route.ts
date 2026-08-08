import {
  createVessel,
  createVesselSchema,
  listVessels,
  listVesselsQuerySchema,
  toVesselResponse,
  VesselPgRepository,
} from "@/modules/vessels";
import {
  created,
  fail,
  ok,
  parseOrThrow,
  readJsonBody,
  resolveRequestActor,
} from "@/shared";

export const dynamic = "force-dynamic";

const vessels = new VesselPgRepository();

export async function GET(request: Request) {
  try {
    const query = parseOrThrow(
      listVesselsQuerySchema,
      Object.fromEntries(new URL(request.url).searchParams.entries()),
    );
    const actor = resolveRequestActor(request);
    const result = await listVessels({ vessels }, query, actor);

    return ok({
      items: result.items.map(toVesselResponse),
      pagination: result.pagination,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = resolveRequestActor(request);
    const input = parseOrThrow(createVesselSchema, await readJsonBody(request));
    const vessel = await createVessel({ vessels }, input, actor);
    return created(toVesselResponse(vessel));
  } catch (error) {
    return fail(error);
  }
}
