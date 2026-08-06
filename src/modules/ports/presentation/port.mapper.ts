import type { PortEntity } from "@/modules/ports/domain/port.entity";

function parseGeoJson(value: string | null): unknown {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export function toPortResponse(port: PortEntity) {
  return {
    port_id: port.portId,
    port_name: port.portName,
    port_geo: parseGeoJson(port.portGeo),
    user_id: port.userId,
  };
}
