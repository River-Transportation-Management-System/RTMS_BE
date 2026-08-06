import type { ZodType } from "zod";

import { AppError } from "@/shared/errors/app-error";

export function parseOrThrow<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw AppError.badRequest("Validation failed", result.error.flatten());
  }

  return result.data;
}

export function parsePathId(raw: string, label = "id"): number {
  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    throw AppError.badRequest(`Invalid ${label}`);
  }

  return id;
}
