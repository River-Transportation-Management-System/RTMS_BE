# Schema overview — RiverTransportation

Source of truth: PostgreSQL + PostGIS.

This document has two scopes:

- **Core schema**: the nine tables supplied by the project team.
- **Required extension**: tables still needed to implement the complete
  three-actor workflow in the RTMS analysis report.

## Entity relationship

```text
Role 1──N User 1──1 CargoOwner 1──N Shipment
              │                      ▲
              │                      │
              ├──N Booking           │
              │      │               │
              │      └──N BookingReview 1──1 Shipment
              │                │
              N                N
            Port ◄─────────────┘
              ▲
              │
Route 1──N RoutePort N──1 Port
  │
  └──N Booking
```

## Tables

### Role
- `role_id` PK
- `role_name`, `role_code`

### User
- `user_id` PK
- `user_name`, `user_pwd`, `user_phone?`, `user_email`, `user_status`
- `created_at`, `updated_at`, `deleted_at?`
- `role_id` FK → Role

### CargoOwner
- `owner_id` PK
- `owner_name`, `cargo_capacity?`, `cargo_type?`
- `user_id` FK → User (unique)

### Port
- `port_id` PK
- `port_name`, `port_geo?` (geography)
- `user_id?` FK → User

### Route
- `route_id` PK
- `route_code`
- `updated_at?`, `deleted_at?`

### RoutePort
- `routeport_id` PK
- `route_id` FK → Route
- `port_id` FK → Port
- unique `(route_id, port_id)`

### Booking
- `booking_id` PK
- `booking_date`, `receive_date`, `expected_date`, `expired_date`
- `booking_status`, `cargo_type`, `cargo_capacity`
- `user_id` FK → User
- `route_id` FK → Route

### BookingReview
- `review_id` PK
- `booking_id` FK → Booking
- `port_id` FK → Port
- `review_status`, `review_date?`
- unique `(booking_id, port_id)`

### Shipment
- `shipment_id` PK
- `shipment_status`, `shipment_date?`
- `owner_id` FK → CargoOwner
- `review_id` FK → BookingReview

## Required extension for the full RTMS report

The supplied core schema does not yet represent vessels, vessel owners,
matching, vessel responses, workflow history, rules, or notifications.
Create these as separate migrations when implementation begins.

### VesselOwner
- `vessel_owner_id` PK
- `owner_name`
- `user_id` FK → User (unique)

### Vessel
- `vessel_id` PK
- `vessel_code`, `vessel_name`, `capacity`
- `availability_status`
- `vessel_owner_id` FK → VesselOwner

### VesselCargoCapability
- `vessel_id` FK → Vessel
- `cargo_type`
- unique `(vessel_id, cargo_type)`

### VesselOperationHistory
- `history_id` PK
- `vessel_id` FK → Vessel
- `cargo_type`, `started_at`, `completed_at?`

### VesselRequest
- `request_id` PK
- `booking_id` FK → Booking
- `vessel_id` FK → Vessel
- `request_status`, `response_deadline`, `created_at`
- unique `(booking_id, vessel_id)`

### VesselResponse
- `response_id` PK
- `request_id` FK → VesselRequest (unique)
- `response_status` (`ACCEPTED` or `REJECTED`)
- `responded_at`, `note?`

### BookingVesselSelection
- `selection_id` PK
- `booking_id` FK → Booking (unique)
- `vessel_id` FK → Vessel
- `selected_by` FK → User
- `selected_at`

### BookingWorkflow
- `workflow_id` PK
- `booking_id` FK → Booking (unique)
- `current_state`, `state_deadline?`, `updated_at`

### ApprovalHistory
- `approval_id` PK
- `booking_id` FK → Booking
- `actor_user_id` FK → User
- `action`, `from_state?`, `to_state`, `note?`, `created_at`

### CargoConflictRule
- `rule_id` PK
- `previous_cargo_type`, `requested_cargo_type`
- `is_allowed`, `reason?`
- unique `(previous_cargo_type, requested_cargo_type)`

### NotificationLog
- `notification_id` PK
- `user_id` FK → User
- `booking_id?` FK → Booking
- `channel`, `status`, `sent_at?`, `created_at`

### WorkflowError
- `error_id` PK
- `booking_id?` FK → Booking
- `workflow_name`, `error_message`, `created_at`, `resolved_at?`

## Full workflow relationships

```text
User 1──1 VesselOwner 1──N Vessel
Booking 1──N VesselRequest N──1 Vessel
VesselRequest 1──1 VesselResponse
Booking 1──1 BookingVesselSelection N──1 Vessel
Booking 1──1 BookingWorkflow
Booking 1──N ApprovalHistory
Vessel 1──N VesselOperationHistory
```

## Notes for implementers

1. Use snake_case table/column names in SQL if preferred (`role`, `user`, ...),
   but keep the logical model above.
2. Prefer `timestamptz` for all timestamps; store UTC.
3. `review_date` should be `timestamptz`, not MySQL `datetime`.
4. Hash `user_pwd`; never store plaintext.
5. Soft-delete filters must exclude rows where `deleted_at IS NOT NULL`.
6. Keep the supplied core schema stable; add report requirements through
   ordered extension migrations instead of silently changing existing tables.
