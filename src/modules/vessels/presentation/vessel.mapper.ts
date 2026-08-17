import type { VesselEntity } from "@/modules/vessels/domain/vessel.entity";

export function toVesselResponse(vessel: VesselEntity) {
  return {
    vessel_id: vessel.vesselId,
    vessel_owner_name: vessel.vesselOwnerName,
    vessel_capacity: vessel.vesselCapacity,
    vessel_cargo_type: vessel.vesselCargoType,
    vessel_status: vessel.vesselStatus,
    user_id: vessel.userId,
  };
}
