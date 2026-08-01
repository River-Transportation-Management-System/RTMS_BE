import type {
  BookingDetail,
  BookingEntity,
  BookingStatus,
} from "@/modules/bookings/domain/booking.entity";
import type { EntityId, Nullable, Timestamp } from "@/shared/domain/common";
import type { PaginatedResult, PaginationInput } from "@/shared/http/pagination";

export type CreateBookingRecord = {
  bookingDate: Timestamp;
  receiveDate: Timestamp;
  expectedDate: Timestamp;
  expiredDate: Nullable<Timestamp>;
  bookingStatus: BookingStatus;
  cargoType: string;
  cargoCapacity: string;
  notes: Nullable<string>;
  userId: EntityId;
  routeId: EntityId;
};

export type UpdateBookingRecord = {
  receiveDate?: Timestamp;
  expectedDate?: Timestamp;
  expiredDate?: Nullable<Timestamp>;
  cargoType?: string;
  cargoCapacity?: string;
  notes?: Nullable<string>;
  routeId?: EntityId;
};

export type ListBookingsFilter = {
  bookingStatus?: string;
  userId?: EntityId;
  routeId?: EntityId;
  receiveDateFrom?: Timestamp;
  receiveDateTo?: Timestamp;
  expectedDateFrom?: Timestamp;
  expectedDateTo?: Timestamp;
  bookingDateFrom?: Timestamp;
  bookingDateTo?: Timestamp;
  excludeCancelled?: boolean;
};

export interface BookingRepository {
  create(input: CreateBookingRecord): Promise<BookingEntity>;
  findById(bookingId: EntityId): Promise<BookingEntity | null>;
  findDetailById(bookingId: EntityId): Promise<BookingDetail | null>;
  list(
    filter: ListBookingsFilter,
    pagination: PaginationInput,
  ): Promise<PaginatedResult<BookingEntity>>;
  update(bookingId: EntityId, patch: UpdateBookingRecord): Promise<BookingEntity>;
  updateStatus(bookingId: EntityId, status: BookingStatus): Promise<BookingEntity>;
}
