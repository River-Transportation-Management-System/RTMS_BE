import type { PortRepository } from "@/modules/ports/application/ports/port.repository";

export type ListPortsDeps = {
  ports: PortRepository;
};

export async function listPorts(deps: ListPortsDeps) {
  return deps.ports.list();
}
