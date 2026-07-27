# Schema overview — River Transportation

Source of truth: PostgreSQL + PostGIS.

This document mirrors the provided **Data Dictionary**.

## Entity relationship

```text
Role 1──N User
User 1──1 Vessel
User 1──N Booking
User 1──N Port

Route 1──N Booking
Route 1──N RoutePort N──1 Port

Booking 1──N BookingReview
Booking 1──N VesselMatch

Vessel 1──N Shipment
Vessel 1──N VesselMatch

BookingReview 1──N Shipment
Port 1──N BookingReview
```

## Tables

### Role
- `role_id` PK
- `role_name`, `role_code`

### User
- `user_id` PK
- `user_name`, `user_pwd`, `user_phone`, `user_email`, `user_status`
- `created_at`, `updated_at`, `deleted_at`
- `role_id` FK → Role

### Vessel
- `vessel_id` PK
- `vessel_owner_name`, `vessel_status`
- `vessel_capacity`, `vessel_cargo_type`
- `user_id` FK → User (unique)

### Booking
- `booking_id` PK
- `booking_date`, `receive_date`, `expected_date`, `expired_date`
- `booking_status`, `cargo_type`, `cargo_capacity`
- `user_id` FK → User
- `route_id` FK → Route

### Route
- `route_id` PK
- `route_code`
- `updated_at`, `deleted_at`

### Port
- `port_id` PK
- `port_name`
- `port_geo` (PostGIS geography)
- `user_id` FK → User

### Shipment
- `shipment_id` PK
- `shipment_status`, `shipment_date`
- `vessel_id` FK → Vessel
- `review_id` FK → BookingReview

### RoutePort
- `routeport_id` PK
- `route_id` FK → Route
- `port_id` FK → Port
- unique `(route_id, port_id)`

### BookingReview
- `review_id` PK
- `booking_id` FK → Booking
- `port_id` FK → Port
- `review_status`, `review_date`
- unique `(booking_id, port_id)`

### VesselMatch
- `match_id` PK
- `vessel_id` FK → Vessel
- `booking_id` FK → Booking

## Notes for implementers

1. Use `timestamptz` for timestamps and store UTC.
2. Hash `user_pwd`; never store plaintext.
3. Preserve unique constraints:
   - `vessel.user_id`
   - `route_port(route_id, port_id)`
   - `booking_review(booking_id, port_id)`
4. Keep migrations append-only; never edit applied migration files.
