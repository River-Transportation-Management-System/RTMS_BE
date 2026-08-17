import { getPort, PortPgRepository, toPortResponse } from "@/modules/ports";
import { fail, ok, parsePathId } from "@/shared";

export const dynamic = "force-dynamic";

const ports = new PortPgRepository();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const portId = parsePathId((await context.params).id, "port id");
    const port = await getPort({ ports }, portId);

    return ok(toPortResponse(port));
  } catch (error) {
    return fail(error);
  }
}
