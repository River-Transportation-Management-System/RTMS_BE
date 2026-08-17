import type { EntityId } from "@/shared/domain/common";
import type { Nullable, Timestamp } from "@/shared/domain/common";

export type VesselMatchSelectionRecord = {
  matchId: EntityId;
  bookingId: EntityId;
  vesselId: EntityId;
};

export type SaveVesselSelectionRecord = VesselMatchSelectionRecord & {
  selectionNote: string | null;
};

export type SelectedVesselDetails = VesselMatchSelectionRecord & {
  vesselStatus: Nullable<string>;
  vesselCapacity: Nullable<string>;
  vesselCargoType: Nullable<string>;
  vesselOwnerName: Nullable<string>;
  ownerUserId: Nullable<EntityId>;
  ownerUserName: Nullable<string>;
  ownerUserEmail: Nullable<string>;
  ownerUserPhone: Nullable<string>;
  selectionNote: Nullable<string>;
  selectedAt: Timestamp;
  selectionStatus: "FINALIZED";
  finalizedAt: Timestamp;
};

export interface VesselSelectionRepository {
  findMatchForBooking(
    bookingId: EntityId,
    vesselId: EntityId,
  ): Promise<VesselMatchSelectionRecord | null>;
  findSelectedVesselByBookingId(bookingId: EntityId): Promise<SelectedVesselDetails | null>;
  saveSelection(input: SaveVesselSelectionRecord): Promise<void>;
}
