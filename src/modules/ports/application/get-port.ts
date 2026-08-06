import type { PortRepository } from "@/modules/ports/application/ports/port.repository";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";

export type GetPortDeps = {
  ports: PortRepository;
};

export async function getPort(deps: GetPortDeps, portId: EntityId) {
  const port = await deps.ports.findById(portId);
  if (!port) {
    throw AppError.notFound(`Port ${portId} not found`);
  }

  return port;
}
