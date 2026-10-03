# ⚡ RTMS_BE — BACKEND REST APIs SERVICE
> **Phân Hệ Backend REST APIs, CSDL PostgreSQL PostGIS & Workflow State Machine của Hệ Thống RTMS**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js 16](https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![PostGIS](https://img.shields.io/badge/PostGIS-GeoJSON-green?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Test Status](https://img.shields.io/badge/APIs%20Test-35%2F35%20Passed-brightgreen?style=for-the-badge)

---

## 📌 1. TỔNG QUAN PHÂN HỆ BACKEND

`RTMS_BE` đóng vai trò là hạt nhân xử lý dữ liệu và điều hành máy trạng thái (State Machine) cho dự án vận tải đường thủy RTMS. Service được phát triển trên nền tảng **Next.js App Router (TypeScript)**, kiến trúc **Clean Architecture (Domain-Driven Design - DDD)**, lưu trữ trên **PostgreSQL** kết hợp tiện ích mở rộng địa lý **PostGIS (GeoJSON Point)**.

---

## 🏛️ 2. KIẾN TRÚC MÃ NGUỒN (CLEAN ARCHITECTURE / DDD)

Mã nguồn backend được tổ chức phân rã thành các **Bounded Contexts** độc lập trong `src/modules/`:

```text
RTMS_BE/
├── database/init/             # Scripts khởi tạo CSDL PostgreSQL & Data Seed
│   ├── 01-schema.sql          # Định nghĩa 13 bảng CSDL chuẩn hóa (PostGIS GeoJSON + RefreshToken)
│   └── 02-seed.sql            # Dữ liệu mẫu khởi tạo (Roles, Users, Ports, Vessels, Routes, Bookings)
├── Dockerfile                 # Multi-stage Dockerfile cho Backend Service (Port 3001)
├── docker-compose.yml         # Container compose cho PostgreSQL + PostGIS, BE, FE, n8n
├── src/
│   ├── app/api/v1/            # 35+ REST API Route Handlers
│   ├── modules/               # Bounded Contexts theo mô hình DDD
│   │   ├── auth/              # Đăng nhập, JWT Access Token (15m) & Refresh Token (7d)
│   │   ├── user/              # Quản lý tài khoản & phân quyền RBAC
│   │   ├── bookings/          # Vòng đời Booking 15 trạng thái & chốt hợp đồng
│   │   ├── booking-reviews/  # Đánh giá điều kiện bốc xếp tại Cảng
│   │   ├── ports/             # Danh mục Cảng & Tọa độ PostGIS GeoJSON Point
│   │   ├── vessels/           # Quản lý Đội tàu & Trạng thái ACTIVE/INACTIVE
│   │   ├── vessel-matches/    # Phản hồi Chấp nhận / Từ chối ghép chuyến
│   │   ├── workflow/          # Điều phối luồng máy trạng thái 6 bước
│   │   └── events/            # Tự động hóa sự kiện Event Bus
│   └── shared/                # Helper HTTP Response, Zod Schemas
├── APIs.md                    # Tài liệu đặc tả chuẩn hóa 35 REST APIs
├── REPORT.md                  # Báo cáo kỹ thuật Backend APIs (100% Passed)
└── test-all-apis.js           # Bộ kiểm thử tự động toàn bộ 35 APIs
```

---

## 🗄️ 3. CƠ SỞ DỮ LIỆU POSTGRESQL & POSTGIS (13 BẢNG CSDL)

CSDL PostgreSQL được thiết kế chuẩn hóa tại `database/init/01-schema.sql`:

1. `role`: Vai trò người dùng (`ADMIN`, `CUSTOMER`, `PORT_MANAGER`, `VESSEL_OWNER`).
2. `"user"`: Tài khoản người dùng (hỗ trợ xóa mềm `deleted_at`).
3. `port`: Danh mục Cảng sông & Tọa độ PostGIS GeoJSON Point (`port_geo`).
4. `vessel`: Danh mục Phương tiện vận chuyển (`vessel_status`: `ACTIVE`/`INACTIVE`).
5. `route`: Tuyến đường vận tải sông.
6. `route_port`: Liên kết danh sách Cảng thuộc Tuyến đường.
7. `booking`: Đơn đặt chuyến 15 trạng thái (chứa `expired_date`, `notes`).
8. `booking_review`: Kết quả kiểm duyệt Cảng (chứa `review_note`).
9. `vessel_match`: Đề xuất ghép tàu (chứa `match_status`: `PENDING`, `ACCEPTED`, `REJECTED`, `SELECTED`, `EXPIRED`, `TIMEOUT`).
10. `booking_vessel_selection`: Phương tiện Khách chọn (`selection_status`: `FINALIZED`).
11. `shipment`: Lô hàng vận chuyển thực tế (`PLANNED`, `LOADING`, `IN_TRANSIT`, `DELIVERED`, `CANCELLED`).
12. `booking_final_confirmation`: Xác nhận hợp đồng chính thức (`service_creation_status`: `CREATED`).
13. `refresh_token`: Lưu trữ & quản lý trạng thái JWT Refresh Token (`token`, `expires_at`, `is_revoked`).

---

## 📋 4. DANH MỤC REST APIs & BACKGROUND JOBS (`/api/v1`)

### 🔑 Auth APIs
- `POST /api/v1/auth/login`: Đăng nhập cấp JWT Access Token (15m) & Refresh Token (7d).
- `GET /api/v1/auth/me`: Lấy thông tin hồ sơ tài khoản hiện tại.
- `POST /api/v1/auth/logout`: Đăng xuất và thu hồi Refresh Token trong DB.
- `POST /api/v1/auth/refresh`: Đổi Refresh Token lấy Access Token mới (Refresh Token Rotation).

### 📦 Bookings APIs
- `GET /api/v1/bookings`: Danh sách đơn chuyến (Phân trang, lọc `booking_status`, `user_id`, `route_id`).
- `POST /api/v1/bookings`: Tạo đơn chuyến mới (`PENDING_PORT_REVIEW`).
- `GET /api/v1/bookings/:id`: Chi tiết đơn chuyến + tổng quan đánh giá Cảng & ghép tàu.
- `PATCH /api/v1/bookings/:id`: Cập nhật thông tin đơn chuyến.
- `DELETE /api/v1/bookings/:id`: Hủy đơn chuyến (`CANCELLED`).
- `POST /api/v1/bookings/:id/port-review`: Ghi nhận kết quả kiểm duyệt Cảng.
- `GET /api/v1/bookings/:id/port-reviews`: Danh sách đánh giá của các Cảng trên tuyến.
- `GET /api/v1/bookings/:id/vessel-requests`: Danh sách các tàu ứng viên ghép chuyến.
- `POST /api/v1/bookings/:id/selected-vessel`: Khách chốt chọn tàu vận chuyển.
- `GET /api/v1/bookings/:id/selected-vessel`: Xem tàu khách đã chọn.
- `POST /api/v1/bookings/:id/final-confirmation`: Cảng xác nhận chốt hợp đồng chuyến cuối cùng.

### ⚙️ Internal Workflow & Background Jobs
- `GET /api/v1/internal/matching/:bookingId`: Lấy danh sách tàu ghép nối với Booking.
- `POST /api/v1/internal/workflow/port-review-completed`: Cập nhật kết luận hoàn tất duyệt Cảng.
- `POST /api/v1/internal/workflow/vessel-response`: Ghi nhận phản hồi đồng ý/từ chối của chủ tàu.
- `GET /api/v1/internal/workflow/:bookingId`: Snapshot luồng làm việc & máy trạng thái.
- `POST /api/v1/internal/workflow/customer-selected`: Khách chọn tàu, chuyển `WAITING_FINAL_CONFIRMATION` & tạo Shipment.
- `PATCH /api/v1/internal/workflow/:bookingId`: Cập nhật ghi chú workflow.
- `POST /api/v1/internal/events`: Phát sự kiện lên Event Bus hệ thống.
- `POST /api/v1/internal/jobs/booking-expired`: Job tự động chuyển đơn quá hạn sang `EXPIRED`.
- `POST /api/v1/internal/jobs/vessel-request-timeout`: Job tự động timeout yêu cầu ghép tàu quá 24h (`TIMEOUT`).
- `POST /api/v1/internal/jobs/send-reminder`: Job phát thông báo n8n reminder đôn đốc.

### ⚓ Ports, Vessels, Users & Health
- `GET /api/v1/ports`: Danh sách Cảng kèm tọa độ PostGIS GeoJSON (`port_geo`).
- `GET /api/v1/ports/:id`: Xem chi tiết Cảng.
- `GET /api/v1/vessels`: Danh sách Tàu, lọc `vessel_status` (`ACTIVE`/`INACTIVE`).
- `POST /api/v1/vessels`: Đăng ký phương tiện mới.
- `GET /api/v1/vessels/:id`: Chi tiết phương tiện.
- `PATCH /api/v1/vessels/:id`: Cập nhật sức chứa, loại hàng, bật/tắt `vessel_status`.
- `POST /api/v1/vessel-matches/:matchId/response`: Chủ tàu phản hồi `ACCEPT` hoặc `REJECT` kèm lý do.
- `GET /api/v1/users`: Danh sách người dùng hệ thống.
- `GET /api/v1/users/:id`: Xem chi tiết người dùng.
- `GET /api/v1/cargo_type`: Danh mục các loại hàng hóa vận chuyển.
- `GET /api/v1/health`: Kiểm tra sức khỏe hệ thống Backend.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY (GETTING STARTED)

### 1. Khởi chạy với Docker Compose (Khuyên dùng)
```bash
docker compose up --build -d backend database
# Server REST APIs chạy tại: http://localhost:3001/api/v1
```

### 2. Khởi chạy Thủ công
```bash
# Nạp dữ liệu SQL vào PostgreSQL
psql -U postgres -d vesse_app -f database/init/01-schema.sql
psql -U postgres -d vesse_app -f database/init/02-seed.sql

# Cài đặt thư viện & khởi chạy dev server
npm install
npm run dev
# Server REST APIs chạy tại: http://localhost:3001
```

### 3. Chạy Bộ Kiểm Thử Tự Động APIs (100% Passed)
```bash
node test-all-apis.js
```

Đặc tả chi tiết xem tại: [`APIs.md`](APIs.md) và [`REPORT.md`](REPORT.md).
