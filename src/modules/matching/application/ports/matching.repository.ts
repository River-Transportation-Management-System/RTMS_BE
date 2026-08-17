import type { VesselMatchEntity } from "@/modules/vessels/domain/vessel-match.entity";
import type { EntityId } from "@/shared/domain/common";

export type VesselMatchDetail = VesselMatchEntity & {
  vesselOwnerName: string | null;
  vesselCapacity: string | null;
  vesselCargoType: string | null;
  vesselStatus: string | null;
  matchStatus: string | null;
  createdAt: Date | null;
  responseAt: Date | null;
};

export interface MatchingRepository {
  findMatchesByBookingId(bookingId: EntityId): Promise<VesselMatchDetail[]>;
}
