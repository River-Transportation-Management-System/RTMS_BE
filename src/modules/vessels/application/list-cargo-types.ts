import type { VesselRepository } from "@/modules/vessels/application/ports/vessel.repository";

export function listCargoTypes(deps: { vessels: VesselRepository }): Promise<string[]> {
  return deps.vessels.listCargoTypes();
}
