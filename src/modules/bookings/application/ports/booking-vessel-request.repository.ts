import type { EntityId, Nullable } from "@/shared/domain/common";

export type BookingVesselRequestRecord = {
  matchId: EntityId;
  vesselId: EntityId;
  matchStatus?: Nullable<string>;
  vesselOwnerName: Nullable<string>;
  vesselStatus: Nullable<string>;
  vesselCapacity: Nullable<string>;
  vesselCargoType: Nullable<string>;
  vesselUserId: Nullable<EntityId>;
};

export interface BookingVesselRequestRepository {
  listByBookingId(bookingId: EntityId): Promise<BookingVesselRequestRecord[]>;
}