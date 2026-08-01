import {
  BookingPgRepository,
  createBooking,
  createBookingSchema,
  listBookings,
  listBookingsQuerySchema,
  toBookingResponse,
} from "@/modules/bookings";
import { RoutePgRepository } from "@/modules/routes";
import {
  created,
  fail,
  ok,
  parseOrThrow,
  readJsonBody,
  resolveRequestActor,
} from "@/shared";

export const dynamic = "force-dynamic";

const bookings = new BookingPgRepository();
const routes = new RoutePgRepository();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = parseOrThrow(
      listBookingsQuerySchema,
      Object.fromEntries(url.searchParams.entries()),
    );
    const actor = resolveRequestActor(request);
    const result = await listBookings({ bookings }, query, actor);

    return ok({
      items: result.items.map(toBookingResponse),
      pagination: result.pagination,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const input = parseOrThrow(createBookingSchema, body);
    const booking = await createBooking({ bookings, routes }, input);

    return created(toBookingResponse(booking));
  } catch (error) {
    return fail(error);
  }
}
