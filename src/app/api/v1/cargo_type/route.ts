import { listCargoTypes, VesselPgRepository } from "@/modules/vessels";
import { fail, ok } from "@/shared";

export const dynamic = "force-dynamic";

const vessels = new VesselPgRepository();

export async function GET() {
  try {
    const items = await listCargoTypes({ vessels });
    return ok({ items });
  } catch (error) {
    return fail(error);
  }
}
