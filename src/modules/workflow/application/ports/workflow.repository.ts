import type { EntityId, Nullable } from "@/shared/domain/common";

export type WorkflowSnapshot = {
  booking: {
    bookingId: EntityId;
    bookingStatus: string | null;
    bookingDate: Date | null;
    receiveDate: Date | null;
    expectedDate: Date | null;
    expiredDate: Date | null;
    cargoType: string | null;
    cargoCapacity: string | null;
    routeId: EntityId | null;
    notes: string | null;
  };
  reviews: Array<{
    reviewId: EntityId;
    portId: EntityId;
    reviewStatus: string | null;
    reviewDate: Date | null;
    reviewNote: string | null;
  }>;
  matches: Array<{
    matchId: EntityId;
    vesselId: EntityId;
    matchStatus: string | null;
    createdAt: Date | null;
    responseAt: Date | null;
  }>;
  shipments: Array<{
    shipmentId: EntityId;
    shipmentStatus: string | null;
    shipmentDate: Date | null;
    vesselId: EntityId | null;
    reviewId: EntityId | null;
  }>;
};

export interface WorkflowRepository {
  getSnapshot(bookingId: EntityId): Promise<WorkflowSnapshot | null>;
  updateVesselMatchResponse(matchId: EntityId, status: string, timestamp: Date): Promise<any>;
  updateVesselMatchSelected(bookingId: EntityId, selectedVesselId: EntityId): Promise<void>;
  createShipment(vesselId: EntityId, reviewId: EntityId): Promise<EntityId>;
}
