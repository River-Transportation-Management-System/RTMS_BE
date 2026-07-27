# Database migrations

Store ordered, immutable SQL migrations in this directory.

Naming convention: `YYYYMMDDHHMM_description.sql`

## Data Dictionary tables

- `role`, `user`
- `vessel`
- `booking`
- `route`, `port`, `route_port`
- `booking_review`
- `shipment`
- `vessel_match`

See `000_schema_overview.md` for both scopes, columns, and relationships.

## Implemented baseline migration

- `202607271700_create_river_transportation_dictionary.sql`
  - Creates all 10 tables from the provided Data Dictionary:
    `role`, `user`, `vessel`, `booking`, `route`, `port`, `shipment`,
    `route_port`, `booking_review`, `vessel_match`.
  - Adds FK, unique constraints, and supporting indexes.

Apply manually (example with Docker database service):

```bash
docker compose exec -T database psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -f database/migrations/202607271700_create_river_transportation_dictionary.sql
```

Do not edit a migration after it has been applied to a shared environment.
Create a new migration for every subsequent change.
