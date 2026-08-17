# Danh sách & Đặc tả Chi tiết các API trong RTMS Backend (`/api/v1`)

Tài liệu này tổng hợp đặc tả đầy đủ về các API trong hệ thống backend RTMS, bao gồm cụm **Bookings APIs** (`/api/v1/bookings`) và toàn bộ **Internal Workflow APIs** (`/api/v1/internal`).

---

## 🏛️ Kiến trúc thiết kế Hệ thống (Clean Architecture / DDD)

Hệ thống được thiết kế chuẩn theo mô hình **Clean Architecture (Domain-Driven Design)** chia làm các module độc lập trong thư mục `src/modules/`:

```
src/modules/
├── bookings/          # Quản lý đơn hàng vận tải (Booking)
├── booking-reviews/  # Đánh giá điều kiện cập cảng (Port Review)
├── matching/          # Ghép nối tàu vận chuyển phù hợp (Vessel Matching)
├── workflow/          # Điều phối luồng làm việc & trạng thái (Workflow & State Machine)
└── events/            # Quản lý sự kiện dùng chung (Event Bus)
```

Mỗi module bao gồm 4 tầng phân tách rõ ràng:
1. **Domain Layer**: Định nghĩa Entities, Interfaces và Value Objects của nghiệp vụ.
2. **Application Layer**: Chứa các Use Cases (bộ xử lý logic nghiệp vụ chính).
3. **Infrastructure Layer**: Thực thi kết nối DB PostgreSQL thông qua Repositories (`PgRepository`).
4. **Presentation Layer**: Validation Schemas (Zod) và Mappers chuyển đổi DTO sang JSON response.

---

## 📋 1. Danh sách Bookings APIs (`/api/v1/bookings`)

| # | Tên API | HTTP Method | Endpoint Path | Mô tả chức năng |
|---|---|---|---|---|
| 1 | **Lấy danh sách Đơn đặt chuyến** | `GET` | `/api/v1/bookings` | Danh sách Booking với phân trang & lọc |
| 2 | **Tạo Đơn đặt chuyến mới** | `POST` | `/api/v1/bookings` | Khởi tạo đơn hàng vận chuyển mới |
| 3 | **Xem chi tiết Đơn đặt chuyến** | `GET` | `/api/v1/bookings/:id` | Thông tin chi tiết booking + tổng quan đánh giá & ghép tàu |
| 4 | **Cập nhật Đơn đặt chuyến** | `PATCH` | `/api/v1/bookings/:id` | Cập nhật thông tin booking (khi ở trạng thái PENDING) |
| 5 | **Hủy Đơn đặt chuyến** | `DELETE` | `/api/v1/bookings/:id` | Hủy đơn đặt chuyến |
| 6 | **Tạo Đánh giá Cảng** | `POST` | `/api/v1/bookings/:id/port-review` | Thêm kết quả kiểm duyệt từ phía Cảng |
| 7 | **Danh sách Đánh giá Cảng** | `GET` | `/api/v1/bookings/:id/port-reviews` | Lấy danh sách các đánh giá cảng của booking |

---

### 1.1 Lấy danh sách Đơn đặt chuyến (List Bookings)

* **Method / Endpoint**: `GET /api/v1/bookings`
* **Vị trí Route Handler**: `src/app/api/v1/bookings/route.ts`
* **Thiết kế thực hiện**:
  * **Presentation**: [`listBookingsQuerySchema`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/presentation/booking.schemas.ts), [`toBookingResponse`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/presentation/booking.mapper.ts).
  * **Application**: [`listBookings`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/application/list-bookings.ts).
  * **Infrastructure**: [`BookingPgRepository.list`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/infrastructure/booking.pg.repository.ts).
  * **Domain**: [`BookingEntity`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/domain/booking.entity.ts).

* **Request**:
  * **Query Parameters**: `page` (trang số), `limit` (số lượng/trang), `booking_status`, `user_id`, `route_id`.
  * **Headers**: `x-user-id`, `x-role-code`.

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "booking_id": 30,
          "booking_date": "2026-07-29T16:03:52.636Z",
          "receive_date": "2026-07-31T16:03:52.636Z",
          "expected_date": "2026-08-04T16:03:52.636Z",
          "expired_date": "2026-08-08T16:03:52.636Z",
          "booking_status": "MATCHED",
          "cargo_type": "Thép cuộn",
          "cargo_capacity": "270.00",
          "notes": null,
          "user_id": 6,
          "route_id": 3
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
* **Vị trí Route Handler**: `src/app/api/v1/bookings/route.ts`
* **Thiết kế thực hiện**:
  * **Presentation**: [`createBookingSchema`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/presentation/booking.schemas.ts), [`toBookingResponse`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/presentation/booking.mapper.ts).
  * **Application**: [`createBooking`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/application/create-booking.ts).
  * **Infrastructure**: [`BookingPgRepository.create`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/infrastructure/booking.pg.repository.ts), [`RoutePgRepository.findById`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/routes/infrastructure/route.pg.repository.ts).
  * **Domain**: [`BookingEntity`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/domain/booking.entity.ts).

* **Request Body (JSON)**:
  ```json
  {
    "user_id": 1,
    "route_id": 1,
    "cargo_type": "CÁT_XÂY_DỰNG",
    "cargo_capacity": 1200,
    "receive_date": "2026-08-18T07:42:52.230Z",
    "expected_date": "2026-08-20T07:42:52.231Z",
    "notes": "Tải trọng thử nghiệm 1200 tấn"
  }
  ```

* **Response Example (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "booking_id": 31,
      "booking_date": "2026-08-17T07:42:52.277Z",
      "receive_date": "2026-08-18T07:42:52.230Z",
      "expected_date": "2026-08-20T07:42:52.231Z",
      "expired_date": null,
      "booking_status": "PENDING",
      "cargo_type": "CÁT_XÂY_DỰNG",
      "cargo_capacity": "1200.00",
      "notes": "Tải trọng thử nghiệm 1200 tấn",
      "user_id": 1,
      "route_id": 1
    }
  }
  ```

---

### 1.3 Xem chi tiết Đơn đặt chuyến (Get Booking Detail)

* **Method / Endpoint**: `GET /api/v1/bookings/:id`
* **Vị trí Route Handler**: `src/app/api/v1/bookings/[id]/route.ts`
* **Thiết kế thực hiện**:
  * **Presentation**: [`toBookingDetailResponse`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/presentation/booking.mapper.ts).
  * **Application**: [`getBooking`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/application/get-booking.ts).
  * **Infrastructure**: [`BookingPgRepository.findDetailById`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/infrastructure/booking.pg.repository.ts).
  * **Domain**: [`BookingDetail`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/domain/booking.entity.ts).

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "booking_id": 31,
      "booking_date": "2026-08-17T07:42:52.277Z",
      "receive_date": "2026-08-18T07:42:52.230Z",
      "expected_date": "2026-08-20T07:42:52.231Z",
      "expired_date": null,
      "booking_status": "PENDING",
      "cargo_type": "CÁT_XÂY_DỰNG",
      "cargo_capacity": "1200.00",
      "notes": "Tải trọng thử nghiệm 1200 tấn",
      "user_id": 1,
      "route_id": 1,
      "reviews_summary": {
        "total": 1,
        "pending": 0,
        "approved": 1,
        "rejected": 0
      },
      "matches_summary": {
        "total": 0
      }
    }
  }
  ```

---

### 1.4 Cập nhật Đơn đặt chuyến (Update Booking)

* **Method / Endpoint**: `PATCH /api/v1/bookings/:id`
* **Vị trí Route Handler**: `src/app/api/v1/bookings/[id]/route.ts`
* **Thiết kế thực hiện**:
  * **Presentation**: [`updateBookingSchema`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/presentation/booking.schemas.ts).
  * **Application**: [`updateBooking`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/application/update-booking.ts).
  * **Infrastructure**: [`BookingPgRepository.update`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/infrastructure/booking.pg.repository.ts).
  * **Domain**: [`BookingEntity`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/domain/booking.entity.ts).

* **Request Body (JSON)**:
  ```json
  {
    "cargo_capacity": 1500,
    "notes": "Cập nhật tải trọng lên 1500 tấn"
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "booking_id": 31,
      "booking_date": "2026-08-17T07:42:52.277Z",
      "receive_date": "2026-08-18T07:42:52.230Z",
      "expected_date": "2026-08-20T07:42:52.231Z",
      "expired_date": null,
      "booking_status": "PENDING",
      "cargo_type": "CÁT_XÂY_DỰNG",
      "cargo_capacity": "1500.00",
      "notes": "Cập nhật tải trọng lên 1500 tấn",
      "user_id": 1,
      "route_id": 1
    }
  }
  ```

---

### 1.5 Hủy Đơn đặt chuyến (Cancel Booking)

* **Method / Endpoint**: `DELETE /api/v1/bookings/:id`
* **Vị trí Route Handler**: `src/app/api/v1/bookings/[id]/route.ts`
* **Thiết kế thực hiện**:
  * **Application**: [`cancelBooking`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/application/cancel-booking.ts).
  * **Infrastructure**: [`BookingPgRepository.updateStatus`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/infrastructure/booking.pg.repository.ts).

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
* **Vị trí Route Handler**: `src/app/api/v1/bookings/[id]/port-review/route.ts`
* **Thiết kế thực hiện**:
  * **Presentation**: [`createPortReviewSchema`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/booking-reviews/presentation/booking-review.schemas.ts), [`toBookingReviewResponse`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/booking-reviews/presentation/booking-review.mapper.ts).
  * **Application**: [`createPortReview`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/booking-reviews/application/create-port-review.ts).
  * **Infrastructure**: [`BookingReviewPgRepository.create`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/booking-reviews/infrastructure/booking-review.pg.repository.ts).

* **Request Body (JSON)**:
  ```json
  {
    "port_id": 1,
    "review_status": "APPROVED",
    "review_note": "Cảng Bến Bức chấp nhận tiếp nhận tàu vào làm hàng"
  }
  ```

* **Response Example (`201 Created`)**:
  ```json
  {
    "success": true,
    "data": {
      "review_id": 27,
      "booking_id": 31,
      "port_id": 1,
      "review_status": "APPROVED",
      "review_date": "2026-08-17T07:42:54.216Z",
      "review_note": "Cảng Bến Bức chấp nhận tiếp nhận tàu vào làm hàng"
    }
  }
  ```

---

### 1.7 Danh sách Đánh giá Cảng (List Port Reviews)

* **Method / Endpoint**: `GET /api/v1/bookings/:id/port-reviews`
* **Vị trí Route Handler**: `src/app/api/v1/bookings/[id]/port-reviews/route.ts`
* **Thiết kế thực hiện**:
  * **Presentation**: [`toBookingReviewSummaryResponse`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/booking-reviews/presentation/booking-review.mapper.ts).
  * **Application**: [`listPortReviews`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/booking-reviews/application/list-port-reviews.ts).
  * **Infrastructure**: [`BookingReviewPgRepository.listByBookingId`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/booking-reviews/infrastructure/booking-review.pg.repository.ts).

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "booking_id": 31,
      "items": [
        {
          "review_id": 27,
          "port_id": 1,
          "review_status": "APPROVED",
          "review_date": "2026-08-17T07:42:54.216Z",
          "review_note": "Cảng Bến Bức chấp nhận tiếp nhận tàu vào làm hàng",
          "review_summary": "APPROVED: Cảng Bến Bức chấp nhận tiếp nhận tàu vào làm hàng"
        }
      ]
    }
  }
  ```

---

## ⚙️ 2. Danh sách Internal Workflow APIs (`/api/v1/internal`)

| # | Tên API | Method | Endpoint Path | Mô tả chức năng | Module thực thi |
|---|---|---|---|---|---|
| 1 | **Lấy danh sách Tàu khớp** | `GET` | `/api/v1/internal/matching/:bookingId` | Danh sách ứng viên tàu ghép nối với Booking | `modules/matching` |
| 2 | **Hoàn tất Đánh giá Cảng** | `POST` | `/api/v1/internal/workflow/port-review-completed` | Cập nhật kết luận từ cảng & chuyển bước quy trình | `modules/workflow` |
| 3 | **Ghi nhận Phản hồi Chủ tàu** | `POST` | `/api/v1/internal/workflow/vessel-response` | Ghi nhận phản hồi đồng ý/từ chối của chủ tàu | `modules/workflow` |
| 4 | **Xem Trạng thái Quy trình** | `GET` | `/api/v1/internal/workflow/:bookingId` | Lấy snapshot luồng làm việc & trạng thái bước hiện tại | `modules/workflow` |
| 5 | **Khách chọn Tàu** | `POST` | `/api/v1/internal/workflow/customer-selected` | Khách chốt chọn tàu, cập nhật MATCHED & tạo Shipment | `modules/workflow` |
| 6 | **Cập nhật dữ liệu Workflow** | `PATCH` | `/api/v1/internal/workflow/:bookingId` | Cập nhật thông tin chi tiết Booking trong luồng | `modules/workflow` |
| 7 | **Đăng sự kiện (Event Bus)** | `POST` | `/api/v1/internal/events` | Gửi event chuẩn hóa lên hệ thống Event Bus | `modules/events` |
| 8 | **Job: Booking quá hạn** | `POST` | `/api/v1/internal/jobs/booking-expired` | Job tự động quét & quá hạn các booking PENDING | Cron/Job |
| 9 | **Job: Yêu cầu tàu Timeout** | `POST` | `/api/v1/internal/jobs/vessel-request-timeout` | Job tự động timeout các ghép tàu quá 24h | Cron/Job |
| 10 | **Job: Gửi Nhắc nhở** | `POST` | `/api/v1/internal/jobs/send-reminder` | Job gửi nhắc nhở cho các bên liên quan | Cron/Job |

---

### 2.1 Lấy danh sách Tàu khớp (Get Booking Matches)

* **Method / Endpoint**: `GET /api/v1/internal/matching/:bookingId`
* **Vị trí Route Handler**: `src/app/api/v1/internal/matching/[bookingId]/route.ts`
* **Thiết kế thực hiện**:
  * **Presentation**: [`toMatchingResponse`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/matching/presentation/matching.mapper.ts).
  * **Application**: [`getBookingMatches`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/matching/application/get-booking-matches.ts).
  * **Infrastructure**: [`MatchingPgRepository.findMatchesByBookingId`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/matching/infrastructure/matching.pg.repository.ts) (JOIN SQL giữa `vessel_match` và `vessel`).
  * **Domain**: [`VesselMatchDetail`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/matching/application/ports/matching.repository.ts).

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "booking_id": 1,
      "cargo_type": "Lúa gạo",
      "cargo_capacity": "150.00",
      "route_id": 1,
      "matches": [
        {
          "match_id": 23,
          "vessel_id": 1,
          "match_status": "ACCEPTED",
          "created_at": "2026-08-17T08:08:18.920Z",
          "response_at": "2026-08-17T08:08:18.943Z",
          "vessel_owner_name": "Công ty Vận tải Sông Việt 01",
          "vessel_capacity": "500.00",
          "vessel_cargo_type": "Container",
          "vessel_status": "AVAILABLE"
        }
      ]
    }
  }
  ```

---

### 2.2 Hoàn tất Đánh giá Cảng (Complete Port Review Workflow)

* **Method / Endpoint**: `POST /api/v1/internal/workflow/port-review-completed`
* **Vị trí Route Handler**: `src/app/api/v1/internal/workflow/port-review-completed/route.ts`
* **Thiết kế thực hiện**:
  * **Presentation**: [`toCompletePortReviewResponse`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/workflow/presentation/workflow.mapper.ts).
  * **Application**: [`completePortReview`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/workflow/application/complete-port-review.ts) (nếu APPROVED -> cập nhật trạng thái `APPROVED` & chuyển bước `MATCHING_VESSELS`).
  * **Infrastructure**: [`BookingPgRepository.updateStatus`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/infrastructure/booking.pg.repository.ts).

* **Request Body (JSON)**:
  ```json
  {
    "booking_id": 1,
    "port_review_summary": "Mọi thủ tục kiểm duyệt cảng hoàn tất xuất sắc",
    "final_review_decision": "APPROVED"
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "booking_id": 1,
      "booking_status": "APPROVED",
      "next_step": "MATCHING_VESSELS",
      "message": "Port review process completed with decision: APPROVED"
    }
  }
  ```

---

### 2.3 Ghi nhận Phản hồi Chủ tàu (Respond Vessel Workflow)

* **Method / Endpoint**: `POST /api/v1/internal/workflow/vessel-response`
* **Vị trí Route Handler**: `src/app/api/v1/internal/workflow/vessel-response/route.ts`
* **Thiết kế thực hiện**:
  * **Presentation**: [`toRespondVesselResponse`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/workflow/presentation/workflow.mapper.ts).
  * **Application**: [`respondVessel`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/workflow/application/respond-vessel.ts).
  * **Infrastructure**: [`WorkflowPgRepository.updateVesselMatchResponse`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/workflow/infrastructure/workflow.pg.repository.ts).

* **Request Body (JSON)**:
  ```json
  {
    "request_id": 23,
    "vessel_response_status": "ACCEPTED",
    "response_timestamp": "2026-08-17T08:08:18.943Z"
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "request_id": 23,
      "vessel_id": 1,
      "booking_id": 1,
      "match_status": "ACCEPTED",
      "booking_status": "APPROVED",
      "message": "Vessel response recorded: ACCEPTED"
    }
  }
  ```

---

### 2.4 Xem Trạng thái Quy trình (Get Workflow Snapshot)

* **Method / Endpoint**: `GET /api/v1/internal/workflow/:bookingId`
* **Vị trí Route Handler**: `src/app/api/v1/internal/workflow/[bookingId]/route.ts`
* **Thiết kế thực hiện**:
  * **Presentation**: [`toWorkflowSnapshotResponse`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/workflow/presentation/workflow.mapper.ts).
  * **Application**: [`getWorkflowSnapshot`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/workflow/application/get-workflow-snapshot.ts) (tính toán bước `current_step` trong State Machine).
  * **Infrastructure**: [`WorkflowPgRepository.getSnapshot`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/workflow/infrastructure/workflow.pg.repository.ts).

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "booking_id": 1,
      "booking_status": "APPROVED",
      "booking_date": "2026-07-30T16:03:52.636Z",
      "receive_date": "2026-08-02T16:03:52.636Z",
      "expected_date": "2026-08-06T16:03:52.636Z",
      "expired_date": "2026-08-11T16:03:52.636Z",
      "cargo_type": "Lúa gạo",
      "cargo_capacity": "150.00",
      "route_id": 1,
      "current_step": "CUSTOMER_SELECTION",
      "state_machine_data": {
        "total_port_reviews": 1,
        "approved_port_reviews": 0,
        "total_vessel_matches": 1,
        "accepted_vessel_matches": 1
      },
      "reviews": [
        {
          "review_id": 1,
          "port_id": 1,
          "review_status": "PENDING",
          "review_date": "2026-07-31T16:03:52.636Z",
          "review_note": null
        }
      ],
      "matches": [
        {
          "match_id": 23,
          "vessel_id": 1,
          "match_status": "ACCEPTED",
          "created_at": "2026-08-17T08:08:18.920Z",
          "response_at": "2026-08-17T08:08:18.943Z"
        }
      ],
      "shipments": [
        {
          "shipment_id": 18,
          "shipment_status": "PLANNED",
          "shipment_date": "2026-08-06T07:53:22.448Z",
          "vessel_id": 1,
          "review_id": 1
        }
      ]
    }
  }
  ```

---

### 2.5 Khách chọn Tàu (Customer Selected Workflow)

* **Method / Endpoint**: `POST /api/v1/internal/workflow/customer-selected`
* **Vị trí Route Handler**: `src/app/api/v1/internal/workflow/customer-selected/route.ts`
* **Thiết kế thực hiện**:
  * **Presentation**: [`toSelectCustomerResponse`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/workflow/presentation/workflow.mapper.ts).
  * **Application**: [`selectCustomer`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/workflow/application/select-customer.ts) (gán match status `SELECTED`, cập nhật booking status `MATCHED` và tự động tạo `Shipment` trạng thái `PLANNED`).
  * **Infrastructure**: [`WorkflowPgRepository.updateVesselMatchSelected`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/workflow/infrastructure/workflow.pg.repository.ts), [`WorkflowPgRepository.createShipment`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/workflow/infrastructure/workflow.pg.repository.ts).

* **Request Body (JSON)**:
  ```json
  {
    "booking_id": 1,
    "selected_vessel_id": 1
  }
  ```

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "booking_id": 1,
      "booking_status": "MATCHED",
      "selected_vessel_id": 1,
      "shipment_id": 21,
      "message": "Customer selection recorded. Booking status updated to MATCHED and shipment created."
    }
  }
  ```

---

### 2.6 Cập nhật dữ liệu Workflow (Patch Workflow Booking Data)

* **Method / Endpoint**: `PATCH /api/v1/internal/workflow/:bookingId`
* **Vị trí Route Handler**: `src/app/api/v1/internal/workflow/[bookingId]/route.ts`
* **Thiết kế thực hiện**:
  * **Application**: Lọc và cập nhật các trường linh hoạt trong luồng làm việc (`receive_date`, `expected_date`, `notes`, `booking_status`,...).
  * **Infrastructure**: [`BookingPgRepository.update`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/bookings/infrastructure/booking.pg.repository.ts).

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
      "booking_id": 1,
      "booking_status": "MATCHED",
      "booking_date": "2026-07-30T16:03:52.636Z",
      "receive_date": "2026-08-02T16:03:52.636Z",
      "expected_date": "2026-08-06T16:03:52.636Z",
      "expired_date": "2026-08-11T16:03:52.636Z",
      "cargo_type": "Lúa gạo",
      "cargo_capacity": "150.00",
      "route_id": 1,
      "notes": "Cập nhật ghi chú thông qua Internal Workflow API"
    }
  }
  ```

---

### 2.7 Đăng sự kiện (Publish Event Bus)

* **Method / Endpoint**: `POST /api/v1/internal/events`
* **Vị trí Route Handler**: `src/app/api/v1/internal/events/route.ts`
* **Thiết kế thực hiện**:
  * **Application**: [`publishEvent`](file:///d:/Develop/River_Management/RTMS_BE/src/modules/events/application/publish-event.ts) (phát sinh `event_id` độc nhất, log thông tin sự kiện ra hệ thống).

* **Request Body (JSON)**:
  ```json
  {
    "event_name": "vessel.selection_confirmed",
    "entity_ids": { "booking_id": 1, "vessel_id": 1 },
    "payload": { "confirm_source": "customer_mobile_app" },
    "source_service": "workflow_engine",
    "timestamp": "2026-08-17T15:08:20.000Z"
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
      "timestamp": "2026-08-17T08:08:20.013Z"
    }
  }
  ```

---

### 2.8 Job: Booking Quá Hạn (Booking Expired Job)

* **Method / Endpoint**: `POST /api/v1/internal/jobs/booking-expired`
* **Vị trí Route Handler**: `src/app/api/v1/internal/jobs/booking-expired/route.ts`
* **Thiết kế thực hiện**:
  * **Infrastructure**: Quét SQL Postgres cập nhật `booking_status = 'EXPIRED'` đối với các booking `PENDING` có `expired_date < CURRENT_TIMESTAMP`.

* **Request Body**: `{}`

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "expired_booking_ids": [2, 11, 12, 27],
      "processed_count": 4,
      "job_status": "COMPLETED",
      "message": "Expired 4 pending bookings passing their expired date."
    }
  }
  ```

---

### 2.9 Job: Yêu cầu Tàu Timeout (Vessel Request Timeout Job)

* **Method / Endpoint**: `POST /api/v1/internal/jobs/vessel-request-timeout`
* **Vị trí Route Handler**: `src/app/api/v1/internal/jobs/vessel-request-timeout/route.ts`
* **Thiết kế thực hiện**:
  * **Infrastructure**: Quét SQL Postgres cập nhật `match_status = 'TIMEOUT'` đối với các ghép tàu `PENDING` tạo cách đây hơn 24 giờ.

* **Request Body**: `{}`

* **Response Example (`200 OK`)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "timed_out_match_ids": [1, 2, 3, 4, 5],
      "processed_count": 5,
      "job_status": "COMPLETED",
      "message": "Timed out 5 pending vessel matches after 24 hours."
    }
  }
  ```

---

### 2.10 Job: Gửi Nhắc nhở (Send Reminder Job)

* **Method / Endpoint**: `POST /api/v1/internal/jobs/send-reminder`
* **Vị trí Route Handler**: `src/app/api/v1/internal/jobs/send-reminder/route.ts`
* **Thiết kế thực hiện**:
  * **Application**: Lấy thông tin chủ hàng của các `booking_ids` chỉ định và phát thông báo nhắc nhở theo ngữ cảnh `reminder_target_context`.

* **Request Body (JSON)**:
  ```json
  {
    "booking_ids": [1],
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
          "booking_id": 1,
          "user_id": 2
        }
      ],
      "processed_count": 1,
      "job_status": "COMPLETED"
    }
  }
  ```
