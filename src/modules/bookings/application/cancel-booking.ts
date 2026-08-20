import type { BookingRepository } from "@/modules/bookings/application/ports/booking.repository";
import { assertBookingIsCancellable } from "@/modules/rules";
import type { EntityId } from "@/shared/domain/common";
import { AppError } from "@/shared/errors/app-error";
import { assertCanAccessBooking, type RequestActor } from "@/shared/http/request-actor";

export type CancelBookingDeps = {
  bookings: BookingRepository;
};

export async function cancelBooking(
  deps: CancelBookingDeps,
  bookingId: EntityId,
  actor: RequestActor,
) {
  const current = await deps.bookings.findById(bookingId);
  if (!current) {
    throw AppError.notFound(`Booking ${bookingId} not found`);
  }

  assertCanAccessBooking(actor, current.userId);
  assertBookingIsCancellable(current.bookingStatus);

  const cancelled = await deps.bookings.updateStatus(bookingId, "CANCELLED");

  // Đảm bảo cập nhật toàn bộ trạng thái ghép tàu với các chủ tàu sang EXPIRED/CANCELLED
  try {
    const { database } = await import("@/infrastructure/database/postgres");
    
    // 1. Đóng toàn bộ yêu cầu ghép tàu đang PENDING hoặc ACCEPTED của đơn này
    await database.query(
      `UPDATE vessel_match
       SET match_status = 'EXPIRED', response_at = COALESCE(response_at, CURRENT_TIMESTAMP)
       WHERE booking_id = $1 AND match_status IN ('PENDING', 'ACCEPTED', 'SELECTED')`,
      [bookingId],
    );

    // 2. Hủy kế hoạch vận chuyển (nếu có)
    await database.query(
      `UPDATE shipment
       SET shipment_status = 'CANCELLED'
       WHERE review_id IN (SELECT review_id FROM booking_review WHERE booking_id = $1)
         AND shipment_status = 'PLANNED'`,
      [bookingId],
    );
  } catch (dbErr) {
    console.warn("[cancelBooking] Notice closing vessel matches / shipments:", dbErr);
  }

  return {
    bookingId: cancelled.bookingId,
    bookingStatus: cancelled.bookingStatus,
    message: "Đơn hàng đã được hủy thành công và các yêu cầu ghép tàu đã được đóng lại với các chủ tàu.",
  };
}
