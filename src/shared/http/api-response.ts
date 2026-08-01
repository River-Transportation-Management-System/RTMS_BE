import { NextResponse } from "next/server";

import { AppError, isAppError } from "@/shared/errors/app-error";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function fail(error: unknown) {
  if (isAppError(error)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? null,
        },
      },
      { status: error.status },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL",
        message: "Internal server error",
        details: null,
      },
    },
    { status: 500 },
  );
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw AppError.badRequest("Invalid JSON body");
  }
}
