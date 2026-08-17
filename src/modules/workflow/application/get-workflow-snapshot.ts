import type { WorkflowRepository } from "./ports/workflow.repository";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";

export type GetWorkflowSnapshotDeps = {
  workflow: WorkflowRepository;
};

export async function getWorkflowSnapshot(deps: GetWorkflowSnapshotDeps, bookingId: EntityId) {
  const snapshot = await deps.workflow.getSnapshot(bookingId);
  if (!snapshot) {
    throw AppError.notFound(`Booking ${bookingId} not found`);
  }
  return snapshot;
}
