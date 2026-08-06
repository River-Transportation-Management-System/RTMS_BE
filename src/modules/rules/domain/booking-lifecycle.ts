import { AppError } from "@/shared/errors/app-error";

/** Statuses that still allow cargo/route/date edits. */
export const EDITABLE_BOOKING_STATUSES: ReadonlySet<string> = new Set([
  "PENDING",
  "PENDING_PORT_REVIEW",
]);

export function assertBookingIsEditable(status: string | null | undefined): void {
  if (!status || !EDITABLE_BOOKING_STATUSES.has(status)) {
    throw AppError.unprocessable("Booking can only be updated while status is editable", {
      bookingStatus: status ?? null,
      editableStatuses: [...EDITABLE_BOOKING_STATUSES],
    });
  }
}

export function assertBookingIsCancellable(status: string | null | undefined): void {
  if (!status) {
    throw AppError.unprocessable("Booking status is missing");
  }

  if (status === "CANCELLED") {
    throw AppError.conflict("Booking is already cancelled");
  }

  if (status === "COMPLETED") {
    throw AppError.unprocessable("Completed bookings cannot be cancelled");
  }
}
