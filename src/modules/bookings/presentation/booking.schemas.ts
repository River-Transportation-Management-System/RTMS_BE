import { z } from "zod";

import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "@/shared/http/pagination";

const positiveId = z.coerce.number().int().positive();

const dateInput = z.coerce.date({
  error: "Invalid date",
});

export const createBookingSchema = z
  .object({
    user_id: positiveId,
    route_id: positiveId,
    cargo_type: z.string().trim().min(1).max(80),
    cargo_capacity: z.union([z.number(), z.string()]),
    receive_date: dateInput,
    expected_date: dateInput,
    expired_date: dateInput.optional().nullable(),
    notes: z.string().trim().max(2000).optional().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.expected_date < value.receive_date) {
      ctx.addIssue({
        code: "custom",
        message: "expected_date must be on or after receive_date",
        path: ["expected_date"],
      });
    }

    if (value.expired_date && value.expired_date < value.receive_date) {
      ctx.addIssue({
        code: "custom",
        message: "expired_date must be on or after receive_date",
        path: ["expired_date"],
      });
    }
  });

export const updateBookingSchema = z
  .object({
    route_id: positiveId.optional(),
    cargo_type: z.string().trim().min(1).max(80).optional(),
    cargo_capacity: z.union([z.number(), z.string()]).optional(),
    receive_date: dateInput.optional(),
    expected_date: dateInput.optional(),
    expired_date: dateInput.nullable().optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one editable field is required",
  });

export const listBookingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
  booking_status: z.string().trim().min(1).optional(),
  user_id: positiveId.optional(),
  route_id: positiveId.optional(),
  receive_date_from: dateInput.optional(),
  receive_date_to: dateInput.optional(),
  expected_date_from: dateInput.optional(),
  expected_date_to: dateInput.optional(),
  booking_date_from: dateInput.optional(),
  booking_date_to: dateInput.optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
