# Database migrations

Store ordered, immutable SQL migrations in this directory.

Naming convention: `YYYYMMDDHHMM_description.sql`

## Core tables supplied by the team

- Auth: `Role`, `User`
- Cargo owner: `CargoOwner`
- GIS/route: `Port`, `Route`, `RoutePort`
- Transport: `Booking`, `BookingReview`, `Shipment`

## Extension tables required by the analysis report

- Fleet: `VesselOwner`, `Vessel`, `VesselCargoCapability`,
  `VesselOperationHistory`
- Vessel coordination: `VesselRequest`, `VesselResponse`,
  `BookingVesselSelection`
- Workflow/audit: `BookingWorkflow`, `ApprovalHistory`, `WorkflowError`
- Rules/notification: `CargoConflictRule`, `NotificationLog`

See `000_schema_overview.md` for both scopes, columns, and relationships.

Do not edit a migration after it has been applied to a shared environment.
Create a new migration for every subsequent change.
