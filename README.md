# RTMS Backend API

Backend Next.js cho hệ thống điều phối vận tải hàng hóa đường thủy nội địa
(RTMS). Tổ chức theo **modular monolith**: một API, code chia theo module khớp
schema PostgreSQL. n8n chỉ điều phối workflow; database là nguồn dữ liệu chuẩn.

Frontend nằm ở repository riêng `RTMS_FE`. Khi chạy Docker Compose, clone
`RTMS_FE` cạnh thư mục này:

```text
parent/
├── RTMS_BE/    # repo này
└── RTMS_FE/    # repo frontend
```

## Công nghệ

- Backend API: Next.js Route Handlers, TypeScript
- Database/GIS: PostgreSQL + PostGIS (`Port.port_geo`)
- Workflow: n8n
- Rule engine: `json-rules-engine` hoặc custom module
- Frontend (repo riêng): Next.js, Tailwind, Leaflet
- Deployment prototype: Docker Compose

## Yêu cầu trước khi chạy

- Docker Engine + Docker Compose
- Node.js 24+ và npm 11+ (chỉ cần khi chạy local / `npm run dev`)
- Hai repo phải nằm cạnh nhau:

```text
parent/
├── RTMS_BE/    # repo này — chạy docker compose tại đây
└── RTMS_FE/    # bắt buộc có nếu build service frontend
```

## Chạy nhanh bằng Docker

```bash
cd RTMS_BE
cp .env.example .env
docker compose up --build
```

Chạy nền (không chiếm terminal):

```bash
docker compose up --build -d
```

Sau khi khởi động, kiểm tra:

```bash
curl http://localhost:3001/api/v1/health
```

URL:

- Frontend: <http://localhost:3000>
- Backend health: <http://localhost:3001/api/v1/health>
- n8n: <http://localhost:5678> (lần đầu mở sẽ yêu cầu tạo tài khoản owner)
- PostgreSQL/PostGIS: `localhost:5432` (user/pass/db theo `.env`)

Lệnh hay dùng:

```bash
docker compose logs -f          # xem log
docker compose ps               # trạng thái container
docker compose down             # dừng, giữ dữ liệu
docker compose down -v          # dừng và XÓA volume DB + n8n
```

Chỉ chạy hạ tầng (để code FE/BE bằng `npm run dev`):

```bash
docker compose up database n8n
```

## Chạy ở chế độ phát triển

```bash
# terminal 1 — hạ tầng
cd RTMS_BE
cp .env.example .env
docker compose up database n8n

# terminal 2 — backend
cd RTMS_BE
cp .env.example .env.local
npm install
npm run dev
```

API chạy tại <http://localhost:3001>:

```bash
curl http://localhost:3001/api/v1/health
```

```bash
# terminal 3 — frontend
cd RTMS_FE
cp .env.example .env.local
npm install
npm run dev
```

Các lệnh chất lượng:

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

## Lưu ý khi chạy (quan trọng)

1. **`.env` vs `.env.local`**
   - Docker Compose đọc file `.env` trong `RTMS_BE`.
   - `npm run dev` đọc `.env.local` (Next.js).
2. **Cổng bị chiếm**: mặc định `3000`, `3001`, `5432`, `5678`. Đổi trong `.env` nếu máy đã dùng các cổng này.
3. **Chưa có bảng nghiệp vụ**: hiện chỉ bật extension PostGIS/`pgcrypto`. File migration `CREATE TABLE` chưa viết — xem `database/migrations/`. App chạy được nhưng chưa có API booking/tàu.
4. **API sẵn có lúc này**: chỉ `GET /api/v1/health`. Các endpoint còn lại là khung hướng dẫn để implement.
5. **n8n lần đầu**: mở <http://localhost:5678>, tạo owner account; workflow JSON chưa import sẵn.
6. **Build frontend Docker** cần thư mục `../RTMS_FE`. Thiếu sẽ lỗi context build.

## Schema database

Project database: `RiverTransportation` (PostgreSQL + PostGIS).

```text
Role 1──N User 1──1 CargoOwner 1──N Shipment
              │                      ▲
              ├──N Booking           │
              │      └──N BookingReview 1──1 Shipment
              N                N
            Port ◄─────────────┘
              ▲
Route 1──N RoutePort N──1 Port
  └──N Booking
```

Đây là **schema lõi do team cung cấp**. Để đáp ứng toàn bộ báo cáo, codebase
còn định nghĩa schema mở rộng cho `VesselOwner`, `Vessel`,
`VesselCargoCapability`, `VesselOperationHistory`, `VesselRequest`,
`VesselResponse`, `BookingVesselSelection`, `BookingWorkflow`,
`ApprovalHistory`, `CargoConflictRule`, `NotificationLog` và `WorkflowError`.

Chi tiết hai phạm vi, cột và quan hệ:
`database/migrations/000_schema_overview.md`.

Module sở hữu:

- `auth`: `Role`, `User`
- `cargo-owners`: `CargoOwner`
- `ports`: `Port`
- `routes`: `Route`, `RoutePort`
- `bookings`: `Booking`
- `booking-reviews`: `BookingReview`
- `vessels`: toàn bộ bảng Chủ tàu/tàu/request/response
- `matching`: dịch vụ lọc tàu, không sở hữu bảng lõi
- `shipments`: `Shipment`
- `workflow`: `BookingWorkflow`
- `rules`: `CargoConflictRule`
- `notifications`: `NotificationLog`
- `audit`: `ApprovalHistory`, `WorkflowError`

## Kiến trúc prototype

```text
Browser
   │
   ▼
Next.js Frontend (RTMS_FE) ──► Next.js Backend API ──► PostgreSQL/PostGIS
                                      │
                                      ├──► n8n (deadline / webhook)
                                      └──► Email/In-app notification
```

Nguyên tắc:

1. PostgreSQL lưu `Booking`, `BookingReview`, `Shipment` và các bảng master.
2. n8n chỉ điều phối wait, deadline, webhook; không thay database.
3. Route Handlers chỉ nhận/trả HTTP; nghiệp vụ nằm trong module.
4. Module không truy cập persistence nội bộ của module khác.
5. Frontend không chứa business rules.

### Luồng nghiệp vụ mục tiêu

```text
User (CargoOwner) tạo Booking
  → Cảng kiểm tra hàng hóa và Route
  → Matching lọc Vessel theo rule/capacity/availability/lịch sử
  → gửi VesselRequest
  → Chủ tàu accept/reject qua VesselResponse
  → Cảng tổng hợp ứng viên
  → Chủ hàng tạo BookingVesselSelection
  → Cảng xác nhận cuối cùng
  → tạo/cập nhật Shipment
  → hoàn tất dịch vụ
```

## Cấu trúc source

```text
src/
├── app/api/v1/                 # HTTP Route Handlers
├── config/                     # Biến môi trường
├── infrastructure/
│   ├── database/               # PostgreSQL pool (pg + PostGIS)
│   ├── n8n/
│   ├── email/
│   └── logging/
├── modules/
│   ├── auth/                   # Role, User
│   ├── cargo-owners/           # CargoOwner
│   ├── bookings/               # Booking
│   ├── booking-reviews/        # BookingReview
│   ├── ports/                  # Port
│   ├── routes/                 # Route, RoutePort
│   ├── vessels/                # Owner, Vessel, request/response, history
│   ├── matching/               # Lọc tàu phù hợp
│   ├── shipments/              # Shipment
│   ├── workflow/               # Transition + n8n boundary
│   ├── rules/                  # Cargo conflict/compatibility
│   ├── notifications/          # Email / in-app
│   └── audit/                  # Approval history, workflow error
└── shared/                     # Error, result, helpers dùng chung

database/
├── init/                       # postgis, pgcrypto
└── migrations/                 # SQL migration + schema overview

n8n/workflows/
docker-compose.yml
```

## Cấu trúc bên trong một module

```text
src/modules/bookings/
├── domain/
├── application/
├── infrastructure/
├── presentation/
└── index.ts
```

```text
presentation ─► application ─► domain
infrastructure ─► application/domain
```

`domain` không import Next.js, PostgreSQL, n8n hoặc HTTP.
Module khác chỉ import từ `index.ts`.

### Code chức năng ở module nào?

- Tạo/cập nhật booking và chọn tàu: `modules/bookings`
- Cảng approve/reject và xác nhận cuối: `modules/booking-reviews`, `modules/ports`
- Hồ sơ tàu, availability, capability, request/response: `modules/vessels`
- Lọc theo capacity/cargo/status/history: `modules/matching`
- Cargo compatibility/conflict: `modules/rules`
- Kiểm tra cảng, tuyến và PostGIS: `modules/routes`
- Deadline, state transition, callback n8n: `modules/workflow`
- Email/in-app: `modules/notifications`
- Approval history và workflow errors: `modules/audit`
- Shipment sau khi xác nhận: `modules/shipments`

Không đặt nghiệp vụ vào `src/app/api`: route chỉ validate request và gọi
application use case qua public API của module.

## Endpoint đặt ở đâu?

Route Handler chỉ: đọc request → validate DTO → gọi use case → trả HTTP.

- `POST /api/v1/auth/login` → `src/app/api/v1/auth/login/route.ts`
- `GET /api/v1/users/:id` → `src/app/api/v1/users/[id]/route.ts`
- `POST /api/v1/cargo-owners` → `src/app/api/v1/cargo-owners/route.ts`
- `POST /api/v1/bookings` → `src/app/api/v1/bookings/route.ts`
- `GET /api/v1/bookings/:id` → `src/app/api/v1/bookings/[id]/route.ts`
- `PATCH /api/v1/bookings/:id/status` → `src/app/api/v1/bookings/[id]/status/route.ts`
- `POST /api/v1/bookings/:id/port-review` → `src/app/api/v1/bookings/[id]/port-review/route.ts`
- `POST /api/v1/matching/vessels` → `src/app/api/v1/matching/vessels/route.ts`
- `POST /api/v1/vessel-requests` → `src/app/api/v1/vessel-requests/route.ts`
- `POST /api/v1/vessel-responses` → `src/app/api/v1/vessel-responses/route.ts`
- `POST /api/v1/bookings/:id/selected-vessel` → `src/app/api/v1/bookings/[id]/selected-vessel/route.ts`
- `POST /api/v1/bookings/:id/final-confirmation` → `src/app/api/v1/bookings/[id]/final-confirmation/route.ts`
- `POST /api/v1/shipments` → `src/app/api/v1/shipments/route.ts`
- `GET /api/v1/ports` → `src/app/api/v1/ports/route.ts`
- `GET /api/v1/routes` → `src/app/api/v1/routes/route.ts`
- `POST /api/v1/routes/:id/ports` → `src/app/api/v1/routes/[id]/ports/route.ts`
- `POST /api/v1/routes/validate` → `src/app/api/v1/routes/validate/route.ts`
- `POST /api/v1/rules/validate-cargo` → `src/app/api/v1/rules/validate-cargo/route.ts`
- `POST /api/v1/notifications` → `src/app/api/v1/notifications/route.ts`

## Database migrations

PostGIS được bật trong `database/init/001_extensions.sql`.

Tạo migration mới:

```text
YYYYMMDDHHMM_description.sql
```

Ví dụ các migration cần viết tiếp:

1. `create_role_and_user`
2. `create_cargo_owner`
3. `create_port_route_routeport`
4. `create_booking_booking_review`
5. `create_shipment`
6. `create_vessel_owner_and_vessel`
7. `create_vessel_capability_and_history`
8. `create_vessel_request_response_and_selection`
9. `create_booking_workflow_and_audit`
10. `create_cargo_conflict_rule_and_notification`

Gợi ý kỹ thuật:

- Dùng `timestamptz` (kể cả `review_date`).
- Soft-delete: lọc `deleted_at IS NULL` trên `User` và `Route`.
- Hash `user_pwd`; không lưu plaintext.
- Unique constraints: `CargoOwner.user_id`, `RoutePort(route_id, port_id)`,
  `BookingReview(booking_id, port_id)`.

Không sửa migration đã chạy ở môi trường dùng chung.

## Workflow và n8n

Backend xác thực transition theo chuỗi
`PENDING_PORT_REVIEW → WAITING_VESSEL_RESPONSE → VESSEL_CANDIDATES_READY →
WAITING_CUSTOMER_SELECTION → WAITING_FINAL_CONFIRMATION → CONFIRMED →
IN_PROGRESS → COMPLETED`. Sau transaction thành công mới gọi webhook n8n.
Callback phải có idempotency key.

Không đặt trong n8n: trạng thái booking duy nhất, business rule quyết định
duyệt/từ chối, credential trong JSON workflow.

## Biến môi trường

Xem `.env.example`.

- App local: copy thành `.env.local` (cần `DATABASE_URL`).
- Docker Compose: copy thành `.env`.

## Quy ước phát triển

- Branch riêng cho từng chức năng.
- Không commit `.env` hoặc secret n8n.
- Chạy lint, typecheck, build trước khi mở PR.
- API public dưới `/api/v1`.
- Migration đã áp dụng không được sửa.
- UTC trong database.

## Checklist khi thêm chức năng

1. Xác định bảng/module sở hữu dữ liệu.
2. Viết domain model không phụ thuộc framework.
3. Viết use case và repository interface.
4. Viết adapter PostgreSQL/PostGIS.
5. Tạo DTO + Route Handler `/api/v1`.
6. Cập nhật trạng thái Booking/Review/Shipment nếu có.
7. Thêm test phù hợp.
8. Chạy lint, typecheck và build.

## Ngoài phạm vi prototype

GPS realtime, tối ưu tuyến phức tạp, pricing/bidding, thanh toán trực tuyến,
quản lý hợp đồng đầy đủ và tối ưu lịch trình nâng cao.
