/**
 * Public module boundaries for the RTMS modular monolith.
 *
 * Map 1:1 with the core PostgreSQL tables where possible.
 * Never import another module's infrastructure or persistence directly.
 */
export const RTMS_MODULES = [
  "auth",
  "bookings",
  "booking-reviews",
  "ports",
  "routes",
  "vessels",
  "vessel-matches",
  "matching",
  "shipments",
  "workflow",
  "rules",
  "notifications",
  "audit",
] as const;
