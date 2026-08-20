# Danh sách & Đặc tả Chi tiết Tất cả các API trong RTMS Backend (`/api/v1`)

Tài liệu này tổng hợp đặc tả chi tiết và đầy đủ 100% về tất cả 35 API / Background Jobs thuộc các cụm chức năng chính trong hệ thống backend RTMS (River Transportation Management System):

1. **Bookings APIs** (`/api/v1/bookings`) — 11 APIs
2. **Internal Workflow APIs & Jobs** (`/api/v1/internal`) — 10 APIs & Cron Jobs
3. **Auth APIs** (`/api/v1/auth`) — 3 APIs
4. **Users APIs** (`/api/v1/users`) — 2 APIs
5. **Cargo Type APIs** (`/api/v1/cargo_type`) — 1 API
6. **Ports APIs** (`/api/v1/ports`) — 2 APIs
7. **Vessels APIs** (`/api/v1/vessels`) — 4 APIs
8. **Vessel Matches API** (`/api/v1/vessel-matches`) — 1 API
9. **System Health API** (`/api/v1/health`) — 1 API

---

## 🏛️ A. Kiến trúc thiết kế Hệ thống (Clean Architecture / DDD)

Hệ thống backend RTMS được thiết kế chuẩn mực theo mô hình **Clean Architecture (Domain-Driven Design - DDD)** phân tách thành các modules độc lập nằm trong thư mục `src/modules/`:

```
src/modules/
├── auth/              # Xử lý đăng nhập JWT, giải mã token & phân quyền (Authentication & Authorization)
├── user/              # Quản lý danh sách, tìm kiếm & hồ sơ người dùng (User Management)
├── bookings/          # Quản lý đơn hàng vận tải đường thủy (Booking Lifecycle, Reviews, Vessel Requests, Selection, Final Confirm)
├── booking-reviews/  # Đánh giá điều kiện bốc xếp tại các Cảng (Port Review)
├── ports/             # Quản lý Bến Cảng & Tọa độ địa lý GIS PostGIS (Ports)
├── vessels/           # Quản lý Phương tiện vận tải & Phân loại hàng hóa (Vessels & Cargo Types)
├── vessel-matches/    # Phản hồi đồng ý / từ chối của Chủ tàu đối với yêu cầu ghép chuyến
├── matching/          # Ghép nối phương tiện vận chuyển phù hợp (Vessel Matching)
├── workflow/          # Điều phối luồng quy trình & máy trạng thái (Workflow State Machine)
└── events/            # Quản lý và phát thông tin sự kiện dùng chung (Event Bus)
```

Mỗi module bao gồm 4 tầng phân tách trách nhiệm tuyệt đối:
- **Domain Layer**: Định nghĩa Entities, Value Objects, Domain Rules và Repository Interfaces.
- **Application Layer**: Chứa các Use Cases thực thi nghiệp vụ chính của hệ thống.
- **Infrastructure Layer**: Thực thi kết nối cơ sở dữ liệu PostgreSQL thông qua Repositories (`UserPgRepository`, `BookingPgRepository`, `BookingVesselRequestPgRepository`, `PortPgRepository`, `VesselPgRepository`, `VesselMatchResponsePgRepository`, `WorkflowPgRepository`, `VesselSelectionPgRepository`, `FinalConfirmationPgRepository`,...).
- **Presentation Layer**: Validation Schemas (Zod) và Mappers chuyển đổi DTO sang chuẩn định dạng JSON Response.

---

## 🔄 B. Danh mục Trạng thái Đơn chuyến (Booking Statuses Matrix)

Hệ thống quy chuẩn hóa 15 trạng thái Đơn chuyến (`booking_status`) bao gồm Luồng xử lý tiêu chuẩn và các Trạng thái xử lý Ngoại lệ:

### 1. Luồng xử lý Tiêu chuẩn (Standard Workflow)
| Trạng thái | Mã `booking_status` | Ý nghĩa nghiệp vụ |
|---|---|---|
| **Chờ Cảng duyệt** | `PENDING_PORT_REVIEW` | Trạng thái khởi tạo mặc định khi tạo đơn chuyến, chờ cảng kiểm duyệt điều kiện |
| **Chờ Tàu phản hồi** | `WAITING_VESSEL_RESPONSE` | Đã phát yêu cầu ghép tàu, đang chờ các chủ tàu phản hồi chấp nhận/từ chối |
| **Đã có Tàu ứng viên** | `VESSEL_CANDIDATES_READY` | Đã có danh sách tàu chấp nhận chuyến, sẵn sàng cho khách chốt chọn |
| **Chờ Khách chọn Tàu** | `WAITING_CUSTOMER_SELECTION` | Hệ thống đang chờ khách hàng chọn phương tiện vận chuyển phù hợp |
| **Chờ Xác nhận cuối** | `WAITING_FINAL_CONFIRMATION` | Khách đã chọn tàu, chờ xác nhận chốt hợp đồng vận chuyển |
| **Đã xác nhận Chuyến** | `CONFIRMED` | Đơn chuyến đã được xác nhận chính thức, sẵn sàng bốc xếp hàng |
| **Đang vận chuyển** | `IN_PROGRESS` | Tàu đang tiến hành vận chuyển hàng hóa trên đường thủy |
| **Hoàn thành** | `COMPLETED` | Chuyến đi đã giao hàng thành công và nghiệm thu đơn hàng |

### 2. Xử lý Ngoại lệ & Lỗi (Exception & Failure States)
| Trạng thái | Mã `booking_status` | Ý nghĩa nghiệp vụ |
|---|---|---|
| **Cảng từ chối** | `REJECTED_BY_PORT` | Đơn chuyến bị bến cảng từ chối do không đủ điều kiện bốc xếp |
| **Tuyến đường không hợp lệ** | `INVALID_ROUTE` | Tuyến đường vận chuyển bị đóng hoặc không hợp lệ |
| **Không có Tàu khả dụng** | `NO_VESSEL_AVAILABLE` | Hệ thống không tìm thấy tàu nào phù hợp với tải trọng và loại hàng |
| **Không Tàu nào nhận** | `NO_VESSEL_ACCEPTED` | Tất cả tàu ứng viên đều từ chối hoặc quá thời hạn phản hồi |
| **Hết hạn đơn** | `EXPIRED` | Đơn chuyến quá thời hạn xử lý `expired_date` |
| **Đã hủy** | `CANCELLED` | Khách hàng hoặc quản trị viên chủ động hủy đơn |
| **Thất bại** | `FAILED` | Sự cố kỹ thuật/vận hành bất khả kháng trong quá trình vận chuyển |

---

## 🚢 C. Trạng thái Phương tiện Vận tải (`vessel_status`)

Trạng thái phương tiện vận tải (`vessel_status`) được quy chuẩn bao gồm **2 giá trị duy nhất**:
- **`ACTIVE`**: Phương tiện đang hoạt động bình thường trên hệ thống.
- **`INACTIVE`**: Phương tiện tạm ngưng hoạt động / vô hiệu hóa.

*(Ràng buộc PostgreSQL Check Constraint: `CHECK (vessel_status IN ('ACTIVE', 'INACTIVE'))` với giá trị mặc định là `'ACTIVE'`)*.

---

## 📋 1. Cụm Bookings APIs (`/api/v1/bookings`)

| # | Tên API | HTTP Method | Endpoint Path | Mô tả chức năng | Module thực thi |
|---|---|---|---|---|---|
| 1 | **Lấy danh sách Đơn đặt chuyến** | `GET` | `/api/v1/bookings` | Danh sách Booking với phân trang, bộ lọc `booking_status`, `user_id`, `route_id` | `modules/bookings` |
| 2 | **Tạo Đơn đặt chuyến mới** | `POST` | `/api/v1/bookings` | Khởi tạo đơn hàng mới (Mặc định trạng thái: `PENDING_PORT_REVIEW`) | `modules/bookings` |
| 3 | **Xem chi tiết Đơn đặt chuyến** | `GET` | `/api/v1/bookings/:id` | Thông tin chi tiết booking + tổng quan đánh giá cảng & ghép tàu | `modules/bookings` |
| 4 | **Cập nhật Đơn đặt chuyến** | `PATCH` | `/api/v1/bookings/:id` | Cập nhật thông tin booking (khi ở trạng thái editable) | `modules/bookings` |
| 5 | **Hủy Đơn đặt chuyến** | `DELETE` | `/api/v1/bookings/:id` | Hủy đơn đặt chuyến (`CANCELLED`) | `modules/bookings` |
| 6 | **Tạo Đánh giá Cảng** | `POST` | `/api/v1/bookings/:id/port-review` | Thêm kết quả kiểm duyệt từ phía Cảng | `modules/booking-reviews` |
| 7 | **Danh sách Đánh giá Cảng** | `GET` | `/api/v1/bookings/:id/port-reviews` | Lấy danh sách các đánh giá cảng của booking | `modules/booking-reviews` |
| 8 | **Danh sách Yêu cầu ghép Tàu** | `GET` | `/api/v1/bookings/:id/vessel-requests` | Lấy danh sách các đề xuất/yêu cầu ghép phương tiện của đơn chuyến | `modules/bookings` |
| 9 | **Chốt chọn Phương tiện** | `POST` | `/api/v1/bookings/:id/selected-vessel` | Lưu phương tiện được chọn ghép chuyến | `modules/bookings` |
| 10 | **Xem Phương tiện đã chọn** | `GET` | `/api/v1/bookings/:id/selected-vessel` | Xem thông tin phương tiện khách hàng đã chọn | `modules/bookings` |
| 11 | **Xác nhận chuyến Cuối cùng** | `POST` | `/api/v1/bookings/:id/final-confirmation` | Xác nhận chốt hợp đồng chuyến cuối cùng | `modules/bookings` |

---

### 1.1 Lấy danh sách Đơn đặt chuyến (List Bookings)

* **Method / Endpoint**: `GET /api/v1/bookings`
* **Vị trí Route Handler**: [`src/app/api/v1/bookings/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/bookings/route.ts)
* **Request Parameters**:
  * **Query Params**: `page`, `limit`, `booking_status`, `user_id`, `route_id`.
  * **Headers**: `x-user-id`, `x-role-code`.

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "booking_id": 30,
          "booking_date": "2026-08-07T11:00:38.101Z",
          "receive_date": "2026-08-09T11:00:38.101Z",
          "expected_date": "2026-08-15T11:00:38.101Z",
          "expired_date": "2026-08-20T11:00:38.101Z",
          "booking_status": "CONFIRMED",
          "cargo_type": "Container",
          "cargo_capacity": "500.00",
          "notes": null,
          "user_id": 6,
          "route_id": 1
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 5,
        "total": 30,
        "totalPages": 6
      }
    }
  }
  ```

---

### 1.2 Tạo Đơn đặt chuyến mới (Create Booking)

* **Method / Endpoint**: `POST /api/v1/bookings`
* **Vị trí Route Handler**: [`src/app/api/v1/bookings/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/bookings/route.ts)

* **Request Body (JSON)**:
  ```json
  {
    "user_id": 2,
    "route_id": 1,
    "cargo_type": "Lúa gạo",
    "cargo_capacity": 200,
    "receive_date": "2026-08-19T17:00:00.000Z",
    "expected_date": "2026-08-21T17:00:00.000Z",
    "notes": "Tạo đơn hàng mới"
  }
  ```

* **Response Example (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "booking_id": 31,
      "booking_date": "2026-08-18T17:13:20.100Z",
      "receive_date": "2026-08-19T17:00:00.000Z",
      "expected_date": "2026-08-21T17:00:00.000Z",
      "expired_date": null,
      "booking_status": "PENDING_PORT_REVIEW",
      "cargo_type": "Lúa gạo",
      "cargo_capacity": "200.00",
      "notes": "Tạo đơn hàng mới",
      "user_id": 2,
      "route_id": 1
    }
  }
  ```

---

### 1.3 Xem chi tiết Đơn đặt chuyến (Get Booking Detail)

* **Method / Endpoint**: `GET /api/v1/bookings/:id`
* **Vị trí Route Handler**: [`src/app/api/v1/bookings/[id]/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/bookings/[id]/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "booking_id": 30,
      "booking_date": "2026-08-07T11:00:38.101Z",
      "receive_date": "2026-08-09T11:00:38.101Z",
      "expected_date": "2026-08-15T11:00:38.101Z",
      "expired_date": "2026-08-20T11:00:38.101Z",
      "booking_status": "CONFIRMED",
      "cargo_type": "Container",
      "cargo_capacity": "500.00",
      "notes": null,
      "user_id": 6,
      "route_id": 1,
      "reviews_summary": {
        "total": 1,
        "pending": 0,
        "approved": 1,
        "rejected": 0
      },
      "matches_summary": {
        "total": 1
      }
    }
  }
  ```

---

### 1.4 Cập nhật Đơn đặt chuyến (Update Booking)

* **Method / Endpoint**: `PATCH /api/v1/bookings/:id`
* **Vị trí Route Handler**: [`src/app/api/v1/bookings/[id]/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/bookings/[id]/route.ts)

* **Request Body (JSON)**:
  ```json
  {
    "cargo_capacity": 250,
    "notes": "Booking đã được cập nhật"
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "booking_id": 31,
      "booking_date": "2026-08-18T17:13:20.100Z",
      "receive_date": "2026-08-19T17:00:00.000Z",
      "expected_date": "2026-08-21T17:00:00.000Z",
      "expired_date": null,
      "booking_status": "PENDING_PORT_REVIEW",
      "cargo_type": "Lúa gạo",
      "cargo_capacity": "250.00",
      "notes": "Booking đã được cập nhật",
      "user_id": 2,
      "route_id": 1
    }
  }
  ```

---

### 1.5 Hủy Đơn đặt chuyến (Cancel Booking)

* **Method / Endpoint**: `DELETE /api/v1/bookings/:id`
* **Vị trí Route Handler**: [`src/app/api/v1/bookings/[id]/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/bookings/[id]/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "message": "Booking cancelled successfully",
      "booking_id": 31,
      "booking_status": "CANCELLED"
    }
  }
  ```

---

### 1.6 Tạo Đánh giá Cảng (Create Port Review)

* **Method / Endpoint**: `POST /api/v1/bookings/:id/port-review`
* **Vị trí Route Handler**: [`src/app/api/v1/bookings/[id]/port-review/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/bookings/[id]/port-review/route.ts)

* **Request Body (JSON)**:
  ```json
  {
    "port_id": 5,
    "review_status": "APPROVED",
    "review_note": "Cảng Long An bốc xếp đủ điều kiện"
  }
  ```

* **Response Example (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "review_id": 27,
      "booking_id": 2,
      "port_id": 5,
      "review_status": "APPROVED",
      "review_date": "2026-08-18T17:13:22.000Z",
      "review_note": "Cảng Long An bốc xếp đủ điều kiện"
    }
  }
  ```

---

### 1.7 Danh sách Đánh giá Cảng (List Port Reviews)

* **Method / Endpoint**: `GET /api/v1/bookings/:id/port-reviews`
* **Vị trí Route Handler**: [`src/app/api/v1/bookings/[id]/port-reviews/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/bookings/[id]/port-reviews/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "booking_id": 2,
      "items": [
        {
          "review_id": 27,
          "port_id": 5,
          "review_status": "APPROVED",
          "review_date": "2026-08-18T17:13:22.000Z",
          "review_note": "Cảng Long An bốc xếp đủ điều kiện",
          "review_summary": "APPROVED: Cảng Long An bốc xếp đủ điều kiện"
        }
      ]
    }
  }
  ```

---

### 1.8 Danh sách Yêu cầu ghép Tàu (Get Booking Vessel Requests)

* **Method / Endpoint**: `GET /api/v1/bookings/:id/vessel-requests`
* **Vị trí Route Handler**: [`src/app/api/v1/bookings/[id]/vessel-requests/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/bookings/[id]/vessel-requests/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "match_id": 19,
          "vessel_id": 8,
          "vessel_summary": {
            "vessel_owner_name": "Vận tải Miền Tây 08",
            "vessel_status": "INACTIVE",
            "vessel_capacity": "700.00",
            "vessel_cargo_type": "Container",
            "user_id": 23
          }
        }
      ]
    }
  }
  ```

---

### 1.9 Chốt chọn Phương tiện (Select Vessel for Booking)

* **Method / Endpoint**: `POST /api/v1/bookings/:id/selected-vessel`
* **Vị trí Route Handler**: [`src/app/api/v1/bookings/[id]/selected-vessel/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/bookings/[id]/selected-vessel/route.ts)

* **Request Body (JSON)**:
  ```json
  {
    "match_id": 6,
    "selected_vessel_id": 7,
    "selection_note": "Khách chọn tàu 7"
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "match_id": 6,
      "booking_id": 9,
      "vessel_id": 7
    }
  }
  ```

---

### 1.10 Xem Phương tiện đã chọn (Get Selected Vessel for Booking)

* **Method / Endpoint**: `GET /api/v1/bookings/:id/selected-vessel`
* **Vị trí Route Handler**: [`src/app/api/v1/bookings/[id]/selected-vessel/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/bookings/[id]/selected-vessel/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "selection_id": 4,
      "booking_id": 9,
      "match_id": 6,
      "vessel_id": 7,
      "selection_note": "Khách chọn tàu 7",
      "selected_at": "2026-08-18T17:13:30.000Z"
    }
  }
  ```

---

### 1.11 Xác nhận chuyến Cuối cùng (Final Confirm Booking)

* **Method / Endpoint**: `POST /api/v1/bookings/:id/final-confirmation`
* **Vị trí Route Handler**: [`src/app/api/v1/bookings/[id]/final-confirmation/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/bookings/[id]/final-confirmation/route.ts)

* **Request Body (JSON)**:
  ```json
  {
    "port_id": 2,
    "confirmation_note": "Xác nhận hợp đồng chính thức booking 9"
  }
  ```

* **Response Example (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "confirmation_id": 4,
      "booking_id": 9,
      "port_id": 2,
      "confirmation_note": "Xác nhận hợp đồng chính thức booking 9",
      "confirmed_by_user_id": 1,
      "confirmed_at": "2026-08-18T17:13:35.000Z"
    }
  }
  ```

---

## ⚙️ 2. Cụm Internal Workflow APIs & Jobs (`/api/v1/internal`)

| # | Tên API | Method | Endpoint Path | Mô tả chức năng | Module thực thi |
|---|---|---|---|---|---|
| 1 | **Lấy danh sách Tàu khớp** | `GET` | `/api/v1/internal/matching/:bookingId` | Danh sách ứng viên tàu ghép nối với Booking | `modules/matching` |
| 2 | **Hoàn tất Đánh giá Cảng** | `POST` | `/api/v1/internal/workflow/port-review-completed` | Cập nhật kết luận cảng (`APPROVED` -> `VESSEL_CANDIDATES_READY`, `REJECTED` -> `REJECTED_BY_PORT`) | `modules/workflow` |
| 3 | **Ghi nhận Phản hồi Chủ tàu** | `POST` | `/api/v1/internal/workflow/vessel-response` | Ghi nhận phản hồi đồng ý/từ chối của chủ tàu | `modules/workflow` |
| 4 | **Xem Trạng thái Quy trình** | `GET` | `/api/v1/internal/workflow/:bookingId` | Lấy snapshot luồng làm việc & tính bước `current_step` | `modules/workflow` |
| 5 | **Khách chọn Tàu** | `POST` | `/api/v1/internal/workflow/customer-selected` | Khách chốt chọn tàu, cập nhật `WAITING_FINAL_CONFIRMATION` & tạo Shipment | `modules/workflow` |
| 6 | **Cập nhật dữ liệu Workflow** | `PATCH` | `/api/v1/internal/workflow/:bookingId` | Cập nhật linh hoạt thông tin đơn chuyến trong luồng | `modules/workflow` |
| 7 | **Đăng sự kiện (Event Bus)** | `POST` | `/api/v1/internal/events` | Gửi event chuẩn hóa lên hệ thống Event Bus | `modules/events` |
| 8 | **Job: Booking quá hạn** | `POST` | `/api/v1/internal/jobs/booking-expired` | Job tự động quét & cập nhật `EXPIRED` các đơn trễ hạn | Cron/Job |
| 9 | **Job: Yêu cầu tàu Timeout** | `POST` | `/api/v1/internal/jobs/vessel-request-timeout` | Job tự động timeout các ghép tàu quá 24h (`TIMEOUT`) | Cron/Job |
| 10 | **Job: Gửi Nhắc nhở** | `POST` | `/api/v1/internal/jobs/send-reminder` | Job gửi nhắc nhở cho các bên liên quan | Cron/Job |

---

### 2.1 Lấy danh sách Tàu khớp (Get Booking Matches)

* **Method / Endpoint**: `GET /api/v1/internal/matching/:bookingId`
* **Vị trí Route Handler**: [`src/app/api/v1/internal/matching/[bookingId]/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/internal/matching/[bookingId]/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "booking_id": 6,
      "cargo_type": "Thép cuộn",
      "cargo_capacity": "270.00",
      "route_id": 3,
      "matches": [
        {
          "match_id": 1,
          "vessel_id": 1,
          "match_status": "ACCEPTED",
          "created_at": "2026-08-17T08:08:18.920Z",
          "response_at": "2026-08-17T08:08:18.943Z",
          "vessel_owner_name": "Công ty Vận tải Sông Việt 01",
          "vessel_capacity": "500.00",
          "vessel_cargo_type": "Container",
          "vessel_status": "ACTIVE"
        }
      ]
    }
  }
  ```

---

### 2.2 Hoàn tất Đánh giá Cảng (Complete Port Review Workflow)

* **Method / Endpoint**: `POST /api/v1/internal/workflow/port-review-completed`
* **Vị trí Route Handler**: [`src/app/api/v1/internal/workflow/port-review-completed/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/internal/workflow/port-review-completed/route.ts)

* **Request Body (JSON)**:
  ```json
  {
    "booking_id": 6,
    "port_review_summary": "Duyệt điều kiện cảng xuất phát và cảng đích",
    "final_review_decision": "APPROVED"
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "booking_id": 6,
      "booking_status": "VESSEL_CANDIDATES_READY",
      "next_step": "MATCHING_VESSELS",
      "message": "Port review process completed with decision: APPROVED"
    }
  }
  ```

---

### 2.3 Ghi nhận Phản hồi Chủ tàu (Respond Vessel Workflow)

* **Method / Endpoint**: `POST /api/v1/internal/workflow/vessel-response`
* **Vị trí Route Handler**: [`src/app/api/v1/internal/workflow/vessel-response/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/internal/workflow/vessel-response/route.ts)

* **Request Body (JSON)**:
  ```json
  {
    "request_id": 1,
    "vessel_response_status": "ACCEPTED",
    "response_timestamp": "2026-08-18T17:00:00.000Z"
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "request_id": 1,
      "vessel_id": 1,
      "booking_id": 6,
      "match_status": "ACCEPTED",
      "booking_status": "WAITING_FINAL_CONFIRMATION",
      "message": "Vessel response recorded: ACCEPTED"
    }
  }
  ```

---

### 2.4 Xem Trạng thái Quy trình (Get Workflow Snapshot)

* **Method / Endpoint**: `GET /api/v1/internal/workflow/:bookingId`
* **Vị trí Route Handler**: [`src/app/api/v1/internal/workflow/[bookingId]/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/internal/workflow/[bookingId]/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "booking_id": 6,
      "booking_status": "WAITING_FINAL_CONFIRMATION",
      "booking_date": "2026-08-15T11:17:34.620Z",
      "receive_date": "2026-08-17T11:17:34.620Z",
      "expected_date": "2026-08-21T11:17:34.620Z",
      "expired_date": "2026-08-25T11:17:34.620Z",
      "cargo_type": "Thép cuộn",
      "cargo_capacity": "270.00",
      "route_id": 3,
      "current_step": "FINAL_CONFIRMATION",
      "state_machine_data": {
        "total_port_reviews": 1,
        "approved_port_reviews": 1,
        "total_vessel_matches": 2,
        "accepted_vessel_matches": 1
      },
      "reviews": [
        {
          "review_id": 7,
          "port_id": 1,
          "review_status": "APPROVED",
          "review_date": "2026-08-09T11:17:34.620Z",
          "review_note": "Duyệt điều kiện bến Cát Lái"
        }
      ],
      "matches": [
        {
          "match_id": 1,
          "vessel_id": 1,
          "match_status": "ACCEPTED",
          "created_at": "2026-08-15T11:17:34.620Z",
          "response_at": "2026-08-16T11:17:34.620Z"
        }
      ],
      "shipments": []
    }
  }
  ```

---

### 2.5 Khách chọn Tàu (Customer Selected Workflow)

* **Method / Endpoint**: `POST /api/v1/internal/workflow/customer-selected`
* **Vị trí Route Handler**: [`src/app/api/v1/internal/workflow/customer-selected/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/internal/workflow/customer-selected/route.ts)

* **Request Body (JSON)**:
  ```json
  {
    "booking_id": 6,
    "selected_vessel_id": 1
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "booking_id": 6,
      "booking_status": "WAITING_FINAL_CONFIRMATION",
      "selected_vessel_id": 1,
      "shipment_id": 22,
      "message": "Customer selection recorded. Booking status updated to MATCHED and shipment created."
    }
  }
  ```

---

### 2.6 Cập nhật dữ liệu Workflow (Patch Workflow Booking Data)

* **Method / Endpoint**: `PATCH /api/v1/internal/workflow/:bookingId`
* **Vị trí Route Handler**: [`src/app/api/v1/internal/workflow/[bookingId]/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/internal/workflow/[bookingId]/route.ts)

* **Request Body (JSON)**:
  ```json
  {
    "notes": "Cập nhật ghi chú thông qua Internal Workflow API"
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "booking_id": 6,
      "booking_status": "WAITING_FINAL_CONFIRMATION",
      "booking_date": "2026-08-15T11:17:34.620Z",
      "receive_date": "2026-08-17T11:17:34.620Z",
      "expected_date": "2026-08-21T11:17:34.620Z",
      "expired_date": "2026-08-25T11:17:34.620Z",
      "cargo_type": "Thép cuộn",
      "cargo_capacity": "270.00",
      "route_id": 3,
      "notes": "Cập nhật ghi chú thông qua Internal Workflow API"
    }
  }
  ```

---

### 2.7 Đăng sự kiện (Publish Event Bus)

* **Method / Endpoint**: `POST /api/v1/internal/events`
* **Vị trí Route Handler**: [`src/app/api/v1/internal/events/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/internal/events/route.ts)

* **Request Body (JSON)**:
  ```json
  {
    "event_name": "vessel.selection_confirmed",
    "entity_ids": { "booking_id": 6, "vessel_id": 1 },
    "payload": { "confirm_source": "customer_mobile_app" },
    "source_service": "workflow_engine",
    "timestamp": "2026-08-18T17:00:00.000Z"
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "event_id": "evt_1786954100008_rcmp2u0",
      "acknowledged": true,
      "timestamp": "2026-08-18T17:00:00.013Z"
    }
  }
  ```

---

### 2.8 Job: Booking Quá Hạn (Booking Expired Job)

* **Method / Endpoint**: `POST /api/v1/internal/jobs/booking-expired`
* **Vị trí Route Handler**: [`src/app/api/v1/internal/jobs/booking-expired/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/internal/jobs/booking-expired/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "expired_booking_ids": [16, 27],
      "processed_count": 2,
      "job_status": "COMPLETED",
      "message": "Expired 2 pending bookings passing their expired date."
    }
  }
  ```

---

### 2.9 Job: Yêu cầu Tàu Timeout (Vessel Request Timeout Job)

* **Method / Endpoint**: `POST /api/v1/internal/jobs/vessel-request-timeout`
* **Vị trí Route Handler**: [`src/app/api/v1/internal/jobs/vessel-request-timeout/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/internal/jobs/vessel-request-timeout/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "timed_out_match_ids": [],
      "processed_count": 0,
      "job_status": "COMPLETED",
      "message": "Timed out 0 pending vessel matches after 24 hours."
    }
  }
  ```

---

### 2.10 Job: Gửi Nhắc nhở (Send Reminder Job)

* **Method / Endpoint**: `POST /api/v1/internal/jobs/send-reminder`
* **Vị trí Route Handler**: [`src/app/api/v1/internal/jobs/send-reminder/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/internal/jobs/send-reminder/route.ts)

* **Request Body (JSON)**:
  ```json
  {
    "booking_ids": [6],
    "reminder_target_context": "VESSEL_RESPONSE_PENDING"
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "delivery_status": "LOGGED",
      "affected_entity_ids": [
        {
          "booking_id": 6,
          "user_id": 6
        }
      ],
      "processed_count": 1,
      "job_status": "COMPLETED"
    }
  }
  ```

---

## 🔑 3. Cụm Auth APIs (`/api/v1/auth`)

| # | Tên API | HTTP Method | Endpoint Path | Mô tả chức năng | Module thực thi |
|---|---|---|---|---|---|
| 1 | **Đăng nhập hệ thống** | `POST` | `/api/v1/auth/login` | Xác thực email/password và trả về Bearer Token | `modules/auth` |
| 2 | **Lấy thông tin người dùng hiện tại** | `GET` | `/api/v1/auth/me` | Lấy profile tài khoản qua Authorization Header | `modules/auth` |
| 3 | **Đăng xuất hệ thống** | `POST` | `/api/v1/auth/logout` | Thu hồi token phía Client & trả mốc thời gian `revoked_at` | `modules/auth` |

---

### 3.1 Đăng nhập hệ thống (User Login)

* **Method / Endpoint**: `POST /api/v1/auth/login`
* **Vị trí Route Handler**: [`src/app/api/v1/auth/login/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/auth/login/route.ts)

* **Request Body (JSON)**:
  ```json
  {
    "user_email": "admin@vesseapp.vn",
    "password": "123456"
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "token_type": "Bearer",
      "expires_in": 900,
      "user": {
        "user_id": "1",
        "user_name": "admin_system",
        "user_email": "admin@vesseapp.vn",
        "role_id": "1",
        "role_name": "Quản trị viên",
        "user_status": "ACTIVE"
      }
    }
  }
  ```

---

### 3.2 Lấy thông tin người dùng hiện tại (Get Current User Profile)

* **Method / Endpoint**: `GET /api/v1/auth/me`
* **Vị trí Route Handler**: [`src/app/api/v1/auth/me/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/auth/me/route.ts)
* **Request Header**: `Authorization: Bearer <access_token>`

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "timestamp": "2026-08-18T17:13:00.000Z",
    "data": {
      "user_id": 1,
      "user_name": "admin_system",
      "user_phone": "0901000001",
      "user_email": "admin@vesseapp.vn",
      "user_status": "ACTIVE",
      "created_at": "2026-06-02T16:03:52.636Z",
      "updated_at": "2026-08-01T16:03:52.636Z",
      "role": {
        "role_id": 1,
        "role_name": "Quản trị viên",
        "role_code": "ADMIN"
      }
    }
  }
  ```

---

### 3.3 Đăng xuất hệ thống (User Logout)

* **Method / Endpoint**: `POST /api/v1/auth/logout`
* **Vị trí Route Handler**: [`src/app/api/v1/auth/logout/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/auth/logout/route.ts)
* **Request Header**: `Authorization: Bearer <access_token>`

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Đăng xuất thành công",
    "revoked_at": "2026-08-18T17:13:01.000Z"
  }
  ```

---

## 👤 4. Cụm Users APIs (`/api/v1/users`)

| # | Tên API | HTTP Method | Endpoint Path | Mô tả chức năng | Module thực thi |
|---|---|---|---|---|---|
| 1 | **Danh sách Người dùng** | `GET` | `/api/v1/users` | Phân trang, tìm kiếm tên/email, lọc `role_id` & `user_status` | `modules/user` |
| 2 | **Chi tiết Người dùng** | `GET` | `/api/v1/users/:id` | Xem chi tiết tài khoản người dùng theo ID | `modules/user` |

---

### 4.1 Danh sách Người dùng (List Users)

* **Method / Endpoint**: `GET /api/v1/users`
* **Vị trí Route Handler**: [`src/app/api/v1/users/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/users/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "user_id": 10,
        "user_name": "doan_van_i",
        "user_email": "doanvani@gmail.com",
        "user_phone": "0912345679",
        "user_status": "INACTIVE",
        "role_id": 2,
        "created_at": "2026-07-12T16:03:52.636Z",
        "updated_at": "2026-08-01T16:03:52.636Z",
        "deleted_at": null
      }
    ],
    "meta": {
      "total": 35,
      "page": 1,
      "limit": 5,
      "total_pages": 7
    }
  }
  ```

---

### 4.2 Xem chi tiết Người dùng (Get User Detail)

* **Method / Endpoint**: `GET /api/v1/users/:id`
* **Vị trí Route Handler**: [`src/app/api/v1/users/[id]/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/users/[id]/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "timestamp": "2026-08-18T17:13:02.000Z",
    "data": {
      "user_id": 1,
      "user_name": "admin_system",
      "user_email": "admin@vesseapp.vn",
      "user_phone": "0901000001",
      "user_status": "ACTIVE",
      "role": {
        "role_id": 1,
        "role_name": "Quản trị viên",
        "role_code": "ADMIN"
      },
      "timestamps": {
        "created_at": "2026-06-02T16:03:52.636Z",
        "updated_at": "2026-08-01T16:03:52.636Z"
      }
    }
  }
  ```

---

## 📦 5. Cụm Cargo Types APIs (`/api/v1/cargo_type`)

| # | Tên API | HTTP Method | Endpoint Path | Mô tả chức năng | Module thực thi |
|---|---|---|---|---|---|
| 1 | **Danh sách loại hàng hóa** | `GET` | `/api/v1/cargo_type` | Lấy danh sách tên loại hàng hóa duy nhất từ phương tiện | `modules/vessels` |

---

### 5.1 Danh sách loại hàng hóa (List Cargo Types)

* **Method / Endpoint**: `GET /api/v1/cargo_type`
* **Vị trí Route Handler**: [`src/app/api/v1/cargo_type/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/cargo_type/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        "cát xây dựng",
        "container",
        "gỗ cây",
        "lúa gạo",
        "nông sản",
        "phân bón",
        "than đá",
        "thép cuộn",
        "vật liệu xây dựng"
      ]
    }
  }
  ```

---

## ⚓ 6. Cụm Ports APIs (`/api/v1/ports`)

| # | Tên API | HTTP Method | Endpoint Path | Mô tả chức năng | Module thực thi |
|---|---|---|---|---|---|
| 1 | **Danh sách Cảng** | `GET` | `/api/v1/ports` | Danh sách Cảng kèm tọa độ địa lý PostGIS GeoJSON | `modules/ports` |
| 2 | **Chi tiết Cảng** | `GET` | `/api/v1/ports/:id` | Xem chi tiết một Cảng theo ID | `modules/ports` |

---

### 6.1 Danh sách Cảng (List Ports)

* **Method / Endpoint**: `GET /api/v1/ports`
* **Vị trí Route Handler**: [`src/app/api/v1/ports/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/ports/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "port_id": 1,
          "port_name": "Cảng Cát Lái",
          "port_geo": {
            "type": "Point",
            "coordinates": [106.7801, 10.7563]
          },
          "user_id": 11
        }
      ]
    }
  }
  ```

---

### 6.2 Chi tiết Cảng (Get Port Detail)

* **Method / Endpoint**: `GET /api/v1/ports/:id`
* **Vị trí Route Handler**: [`src/app/api/v1/ports/[id]/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/ports/[id]/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "port_id": 1,
      "port_name": "Cảng Cát Lái",
      "port_geo": {
        "type": "Point",
        "coordinates": [106.7801, 10.7563]
      },
      "user_id": 11
    }
  }
  ```

---

## 🚢 7. Cụm Vessels APIs (`/api/v1/vessels`)

| # | Tên API | HTTP Method | Endpoint Path | Mô tả chức năng | Module thực thi |
|---|---|---|---|---|---|
| 1 | **Danh sách Phương tiện (Tàu)** | `GET` | `/api/v1/vessels` | Lấy danh sách tàu với phân trang, bộ lọc `vessel_status` (`ACTIVE`/`INACTIVE`), loại hàng & chủ sở hữu | `modules/vessels` |
| 2 | **Tạo Phương tiện mới** | `POST` | `/api/v1/vessels` | Thêm mới phương tiện vận chuyển (Mặc định `vessel_status: "ACTIVE"`) | `modules/vessels` |
| 3 | **Xem chi tiết Phương tiện** | `GET` | `/api/v1/vessels/:id` | Lấy thông tin chi tiết của một phương tiện theo ID | `modules/vessels` |
| 4 | **Cập nhật thông tin Phương tiện** | `PATCH` | `/api/v1/vessels/:id` | Cập nhật tải trọng, loại hàng, trạng thái (`ACTIVE` hoặc `INACTIVE`) | `modules/vessels` |

---

### 7.1 Danh sách Phương tiện (List Vessels)

* **Method / Endpoint**: `GET /api/v1/vessels`
* **Vị trí Route Handler**: [`src/app/api/v1/vessels/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/vessels/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "vessel_id": 21,
          "vessel_owner_name": "Công ty Vận tải Sông Hồng 09",
          "vessel_capacity": "2000.00",
          "vessel_cargo_type": "Cát xây dựng",
          "vessel_status": "ACTIVE",
          "user_id": 1
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 5,
        "total": 21,
        "totalPages": 5
      }
    }
  }
  ```

---

### 7.2 Tạo Phương tiện mới (Create Vessel)

* **Method / Endpoint**: `POST /api/v1/vessels`
* **Vị trí Route Handler**: [`src/app/api/v1/vessels/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/vessels/route.ts)

* **Request Body (JSON)**:
  ```json
  {
    "vessel_owner_name": "Tập đoàn Vận tải Sông Nam 22",
    "vessel_capacity": 2500,
    "vessel_cargo_type": "Container",
    "vessel_status": "ACTIVE",
    "user_id": 2
  }
  ```

* **Response Example (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "vessel_id": 21,
      "vessel_owner_name": "Tập đoàn Vận tải Sông Nam 22",
      "vessel_capacity": "2500.00",
      "vessel_cargo_type": "Container",
      "vessel_status": "ACTIVE",
      "user_id": 2
    }
  }
  ```

---

### 7.3 Xem chi tiết Phương tiện (Get Vessel Detail)

* **Method / Endpoint**: `GET /api/v1/vessels/:id`
* **Vị trí Route Handler**: [`src/app/api/v1/vessels/[id]/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/vessels/[id]/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "vessel_id": 21,
      "vessel_owner_name": "Tập đoàn Vận tải Sông Nam 22",
      "vessel_capacity": "2500.00",
      "vessel_cargo_type": "Container",
      "vessel_status": "ACTIVE",
      "user_id": 2
    }
  }
  ```

---

### 7.4 Cập nhật thông tin Phương tiện (Update Vessel)

* **Method / Endpoint**: `PATCH /api/v1/vessels/:id`
* **Vị trí Route Handler**: [`src/app/api/v1/vessels/[id]/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/vessels/[id]/route.ts)

* **Request Body (JSON)**:
  ```json
  {
    "vessel_capacity": 2800,
    "vessel_status": "INACTIVE"
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "vessel_id": 21,
      "vessel_owner_name": "Tập đoàn Vận tải Sông Nam 22",
      "vessel_capacity": "2800.00",
      "vessel_cargo_type": "Container",
      "vessel_status": "INACTIVE",
      "user_id": 2
    }
  }
  ```

---

## ⚓ 8. Cụm Vessel Matches API (`/api/v1/vessel-matches`)

| # | Tên API | HTTP Method | Endpoint Path | Mô tả chức năng | Module thực thi |
|---|---|---|---|---|---|
| 1 | **Chủ tàu phản hồi Ghép chuyến** | `POST` | `/api/v1/vessel-matches/:matchId/response` | Chủ tàu nhận (`ACCEPT`) hoặc từ chối (`REJECT`) đề xuất ghép chuyến | `modules/vessel-matches` |

---

### 8.1 Chủ tàu phản hồi Ghép chuyến (Vessel Match Response)

* **Method / Endpoint**: `POST /api/v1/vessel-matches/:matchId/response`
* **Vị trí Route Handler**: [`src/app/api/v1/vessel-matches/[matchId]/response/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/vessel-matches/[matchId]/response/route.ts)
* **Request Headers**: `x-user-id` (ID Chủ tàu), `x-role-code: VESSEL_OWNER`.

* **Request Body (JSON)**:
  ```json
  {
    "response_status": "ACCEPT",
    "reason": "Đồng ý nhận chuyến bốc xếp tại Cảng Cát Lái"
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "match_id": 1,
      "vessel_id": 1,
      "booking_id": 6,
      "response_status": "ACCEPT",
      "reason": "Đồng ý nhận chuyến bốc xếp tại Cảng Cát Lái",
      "responded_at": "2026-08-18T17:27:10.000Z"
    }
  }
  ```

---

## 🟢 9. Cụm System Health API (`/api/v1/health`)

| # | Tên API | HTTP Method | Endpoint Path | Mô tả chức năng |
|---|---|---|---|---|
| 1 | **Kiểm tra sức khỏe hệ thống** | `GET` | `/api/v1/health` | Trả về trạng thái hoạt động của hệ thống backend |

---

### 9.1 Kiểm tra sức khỏe hệ thống (Health Check)

* **Method / Endpoint**: `GET /api/v1/health`
* **Vị trí Route Handler**: [`src/app/api/v1/health/route.ts`](file:///d:/Develop/River_Management/RTMS_BE/src/app/api/v1/health/route.ts)

* **Response Example (`200 OK`)**:
  ```json
  {
    "service": "rtms-backend",
    "status": "ok",
    "timestamp": "2026-08-18T17:26:10.000Z"
  }
  ```
