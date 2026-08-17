import type { EntityId, Nullable, Timestamp } from "@/shared/domain/common";

export type ApprovedPortContext = {
  reviewId: EntityId;
  portUserId: Nullable<EntityId>;
};

export type CreateFinalConfirmationRecord = {
  bookingId: EntityId;
  matchId: EntityId;
  vesselId: EntityId;
  reviewId: EntityId;
  portId: EntityId;
  confirmationActorId: EntityId;
  confirmationNote: Nullable<string>;
};

export type FinalConfirmationResult = {
  confirmationId: EntityId;
  bookingId: EntityId;
  matchId: EntityId;
  vesselId: EntityId;
  portId: EntityId;
  confirmationActorId: EntityId;
  confirmationNote: Nullable<string>;
  confirmedAt: Timestamp;
  serviceCreationStatus: "CREATED";
  serviceCreatedAt: Timestamp;
  shipmentId: EntityId;
  shipmentStatus: "PLANNED";
  bookingWorkflowState: "IN_PROGRESS";
  workflowChangedAt: Timestamp;
};

export interface FinalConfirmationRepository {
  findApprovedPortContext(bookingId: EntityId, portId: EntityId): Promise<ApprovedPortContext | null>;
  existsForBooking(bookingId: EntityId): Promise<boolean>;
  create(input: CreateFinalConfirmationRecord): Promise<FinalConfirmationResult>;
}
