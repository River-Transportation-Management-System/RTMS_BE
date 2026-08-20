import { NextResponse } from "next/server";
import { AppError, isAppError } from "@/shared/errors/app-error";

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-user-id, x-role-code, Accept, Origin, X-Requested-With",
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status, headers: CORS_HEADERS });
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
      { status: error.status, headers: CORS_HEADERS },
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
    { status: 500, headers: CORS_HEADERS },
  );
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw AppError.badRequest("Invalid JSON body");
  }
}