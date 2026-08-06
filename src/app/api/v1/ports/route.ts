import { listPorts, PortPgRepository, toPortResponse } from "@/modules/ports";
import { fail, ok } from "@/shared";

export const dynamic = "force-dynamic";

const ports = new PortPgRepository();

export async function GET() {
  try {
    const items = await listPorts({ ports });

    return ok({ items: items.map(toPortResponse) });
  } catch (error) {
    return fail(error);
  }
}
