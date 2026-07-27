# RTMS Backend API

Backend Next.js (App Router + Route Handlers) cho RTMS, tổ chức theo
**modular monolith** để dễ mở rộng thành service-based architecture sau này.

## Stack

- Runtime/API: Next.js + TypeScript
- Database: PostgreSQL + PostGIS
- Rule engine: `json-rules-engine`
- Workflow orchestration: n8n
- Container: Docker Compose

## Data Dictionary scope

Codebase hiện bám theo đúng 10 bảng bạn cung cấp:

1. `role`
2. `user`
3. `vessel`
4. `booking`
5. `route`
6. `port`
7. `shipment`
8. `route_port`
9. `booking_review`
10. `vessel_match`

Migration đã tạo sẵn:

- `database/migrations/202607271700_create_river_transportation_dictionary.sql`

Schema chi tiết:

- `database/migrations/000_schema_overview.md`

## Chạy bằng Docker

Yêu cầu:

- Docker Engine + Docker Compose
- Thư mục `RTMS_FE` đặt cạnh `RTMS_BE` (để build frontend service)

```bash
cd RTMS_BE
cp .env.example .env
docker compose up --build
```

Kiểm tra:

```bash
curl http://localhost:3001/api/v1/health
```

URL:

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:3001>
- Health: <http://localhost:3001/api/v1/health>
- n8n: <http://localhost:5678>

Dừng:

```bash
docker compose down
```

Xóa volume:

```bash
docker compose down -v
```

## Áp dụng migration SQL

Sau khi database container chạy:

```bash
docker compose exec -T database psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -f database/migrations/202607271700_create_river_transportation_dictionary.sql
```

## Chạy local (dev)

```bash
# terminal 1
cd RTMS_BE
cp .env.example .env
docker compose up database n8n

# terminal 2
cd RTMS_BE
cp .env.example .env.local
npm install
npm run dev
```

## Cấu trúc backend

```text
src/
├── app/api/v1/                 # HTTP routes
├── config/                     # env validation
├── infrastructure/database/    # pg pool
├── modules/
│   ├── auth/                   # role, user entities
│   ├── vessels/                # vessel, vessel_match entities
│   ├── bookings/               # booking entity
│   ├── routes/                 # route, route_port entities
│   ├── ports/                  # port entity
│   ├── booking-reviews/        # booking_review entity
│   ├── shipments/              # shipment entity
│   ├── matching/               # match criteria contracts
│   ├── workflow/               # workflow boundary
│   ├── rules/                  # rule boundary
│   ├── notifications/          # notification boundary
│   └── audit/                  # audit boundary
└── shared/domain/              # common entity types
```

## Entity setup (đã có)

Entity TypeScript đã được tạo theo data dictionary tại:

- `src/modules/auth/domain/role.entity.ts`
- `src/modules/auth/domain/user.entity.ts`
- `src/modules/vessels/domain/vessel.entity.ts`
- `src/modules/vessels/domain/vessel-match.entity.ts`
- `src/modules/bookings/domain/booking.entity.ts`
- `src/modules/routes/domain/route.entity.ts`
- `src/modules/routes/domain/route-port.entity.ts`
- `src/modules/ports/domain/port.entity.ts`
- `src/modules/booking-reviews/domain/booking-review.entity.ts`
- `src/modules/shipments/domain/shipment.entity.ts`

## Chất lượng code

```bash
npm run lint
npm run typecheck
npm run build
```

## Quy ước phát triển

- Không đặt business logic trong route handler.
- Logic đi theo lớp: `domain -> application -> infrastructure -> presentation`.
- Không commit `.env` và secret.
- Migration đã áp dụng không được sửa; luôn tạo file migration mới.
