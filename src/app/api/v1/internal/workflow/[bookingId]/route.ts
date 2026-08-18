import { BookingPgRepository } from "@/modules/bookings";
import {
  WorkflowPgRepository,
  getWorkflowSnapshot,
  toWorkflowSnapshotResponse,
} from "@/modules/workflow";
import { fail, ok, parsePathId, readJsonBody } from "@/shared";
import { AppError } from "@/shared/errors/app-error";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ bookingId: string }>;
};

const workflow = new WorkflowPgRepository();
const bookings = new BookingPgRepository();

export async function GET(request: Request, context: RouteContext) {
  try {
    const bookingId = parsePathId((await context.params).bookingId, "booking id");

    const snapshot = await getWorkflowSnapshot({ workflow }, bookingId);

    // Calculate current workflow step based on status and matches
    let currentStep = "UNKNOWN";
    const status = snapshot.booking.bookingStatus;

    const EXCEPTION_STATUSES = new Set([
      "REJECTED_BY_PORT",
      "INVALID_ROUTE",
      "NO_VESSEL_AVAILABLE",
      "NO_VESSEL_ACCEPTED",
      "EXPIRED",
      "CANCELLED",
      "FAILED",
    ]);

    if (EXCEPTION_STATUSES.has(status || "")) {
      currentStep = `CLOSED_EXCEPTION_${status}`;
    } else if (status === "COMPLETED") {
      currentStep = "COMPLETED";
    } else if (status === "PENDING" || status === "PENDING_PORT_REVIEW") {
      currentStep = "PORT_REVIEW";
    } else if (status === "WAITING_VESSEL_RESPONSE") {
      currentStep = "VESSEL_RESPONSE_WAIT";
    } else if (status === "APPROVED" || status === "VESSEL_CANDIDATES_READY") {
      const hasAcceptedMatches = snapshot.matches.some(m => m.matchStatus === "ACCEPTED");
      currentStep = hasAcceptedMatches ? "CUSTOMER_SELECTION" : "VESSEL_MATCHING";
    } else if (status === "WAITING_CUSTOMER_SELECTION") {
      currentStep = "CUSTOMER_SELECTION";
    } else if (status === "WAITING_FINAL_CONFIRMATION") {
      currentStep = "FINAL_CONFIRMATION";
    } else if (status === "CONFIRMED" || status === "MATCHED") {
      currentStep = "SHIPMENT_PREPARATION";
    } else if (status === "IN_PROGRESS") {
      currentStep = "IN_TRANSIT";
    }

    return ok(toWorkflowSnapshotResponse(snapshot, currentStep));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const bookingId = parsePathId((await context.params).bookingId, "booking id");
    const body = await readJsonBody<any>(request);

    // Filter fields to update
    const patchData: any = {};
    if (body.receive_date !== undefined) patchData.receiveDate = body.receive_date ? new Date(body.receive_date) : null;
    if (body.expected_date !== undefined) patchData.expectedDate = body.expected_date ? new Date(body.expected_date) : null;
    if (body.expired_date !== undefined) patchData.expiredDate = body.expired_date ? new Date(body.expired_date) : null;
    if (body.cargo_type !== undefined) patchData.cargoType = body.cargo_type;
    if (body.cargo_capacity !== undefined) patchData.cargoCapacity = body.cargo_capacity;
    if (body.notes !== undefined) patchData.notes = body.notes;
    if (body.route_id !== undefined) patchData.routeId = body.route_id;

    let booking = await bookings.findById(bookingId);
    if (!booking) {
      throw AppError.notFound(`Booking ${bookingId} not found`);
    }

    if (Object.keys(patchData).length > 0) {
      booking = await bookings.update(bookingId, patchData);
    }

    if (body.booking_status !== undefined) {
      booking = await bookings.updateStatus(bookingId, body.booking_status);
    }

    return ok({
      booking_id: booking.bookingId,
      booking_status: booking.bookingStatus,
      booking_date: booking.bookingDate,
      receive_date: booking.receiveDate,
      expected_date: booking.expectedDate,
      expired_date: booking.expiredDate,
      cargo_type: booking.cargoType,
      cargo_capacity: booking.cargoCapacity,
      route_id: booking.routeId,
      notes: booking.notes,
    });
  } catch (error) {
    return fail(error);
  }
}
