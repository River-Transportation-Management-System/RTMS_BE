import type {
  BookingDetail,
  BookingEntity,
} from "@/modules/bookings/domain/booking.entity";

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function toBookingResponse(booking: BookingEntity) {
  return {
    booking_id: booking.bookingId,
    booking_date: toIso(booking.bookingDate),
    receive_date: toIso(booking.receiveDate),
    expected_date: toIso(booking.expectedDate),
    expired_date: toIso(booking.expiredDate),
    booking_status: booking.bookingStatus,
    cargo_type: booking.cargoType,
    cargo_capacity: booking.cargoCapacity,
    notes: booking.notes,
    user_id: booking.userId,
    route_id: booking.routeId,
  };
}

export function toBookingDetailResponse(booking: BookingDetail) {
  return {
    ...toBookingResponse(booking),
    reviews_summary: {
      total: booking.reviewsSummary.total,
      pending: booking.reviewsSummary.pending,
      approved: booking.reviewsSummary.approved,
      rejected: booking.reviewsSummary.rejected,
    },
    matches_summary: {
      total: booking.matchesSummary.total,
    },
  };
}
