import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    service: "rtms-backend",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
