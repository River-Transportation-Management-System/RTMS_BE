# Database Migrations & Initial Schema Documentation

## Single Source of Truth: Baseline Schema & Seed

To ensure absolute consistency across development, staging, and production environments, all table structures, indexes, foreign keys, and check constraints have been consolidated into the canonical initialization scripts:

- **[`database/init/01-schema.sql`](file:///d:/Develop/River_Management/RTMS_BE/database/init/01-schema.sql)**: Complete DDL schema creation script (PostGIS enabled, 12 tables, constraints, default values).
- **[`database/init/02-seed.sql`](file:///d:/Develop/River_Management/RTMS_BE/database/init/02-seed.sql)**: Baseline seed data script populating roles, users, ports, vessels, routes, bookings (15 statuses), reviews, matches, selections, final confirmations, and shipments.

## Database Tables Overview (12 Tables)

1. `role` - Hệ thống vai trò & phân quyền (ADMIN, CUSTOMER, PORT_MANAGER, VESSEL_OWNER)
2. `user` - Thông tin tài khoản người dùng
3. `port` - Danh sách bến cảng & tọa độ địa lý PostGIS GeoJSON (`port_geo`)
4. `vessel` - Phương tiện vận tải thủy (`vessel_status`: `ACTIVE` / `INACTIVE`)
5. `route` - Tuyến đường vận tải thủy
6. `route_port` - Liên kết tuyến đường và bến cảng
7. `booking` - Đơn chuyến vận tải (15 trạng thái quy chuẩn)
8. `booking_review` - Kết quả kiểm duyệt điều kiện bốc xếp từ phía Cảng
9. `vessel_match` - Danh sách tàu ứng viên ghép nối chuyến (`match_status`)
10. `booking_vessel_selection` - Lựa chọn tàu của khách hàng (`FINALIZED`)
11. `shipment` - Chuyến vận chuyển thực tế
12. `booking_final_confirmation` - Xác nhận chốt hợp đồng chuyến cuối cùng

## Applying Database Schema & Seed

### Quick Apply with Node.js Script
```bash
node scratch/reset-db.js
```

### Direct PostgreSQL Execution
```bash
psql -U postgres -d rtms -f database/init/01-schema.sql
psql -U postgres -d rtms -f database/init/02-seed.sql
```
