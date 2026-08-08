import type { VesselEntity, VesselStatus } from "@/modules/vessels/domain/vessel.entity";
import type { EntityId } from "@/shared/domain/common";
import type { PaginatedResult, PaginationInput } from "@/shared/http/pagination";

export type CreateVesselRecord = {
  vesselOwnerName: string;
  vesselStatus: VesselStatus;
  vesselCapacity: string;
  vesselCargoType: string;
  userId: EntityId;
};

export type UpdateVesselRecord = Partial<Omit<CreateVesselRecord, "userId">>;

export type ListVesselsFilter = {
  vesselStatus?: VesselStatus;
  vesselCargoType?: string;
  userId?: EntityId;
};

export interface VesselRepository {
  list(filter: ListVesselsFilter, pagination: PaginationInput): Promise<PaginatedResult<VesselEntity>>;
  findById(vesselId: EntityId): Promise<VesselEntity | null>;
  create(input: CreateVesselRecord): Promise<VesselEntity>;
  update(vesselId: EntityId, patch: UpdateVesselRecord): Promise<VesselEntity>;
}
