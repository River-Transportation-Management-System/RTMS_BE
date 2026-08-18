-- ==============================================================================
-- PROJECT: vesse_app
-- SEED DATA SCRIPT (02-seed.sql)
-- Note: Cột ID không được insert để tương thích với AUTO INCREMENT / IDENTITY.
-- Phụ thuộc mở rộng: Extension PostGIS cho kiểu dữ liệu GEOGRAPHY (port_geo).
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS postgis;
-- ------------------------------------------------------------------------------
-- 1. SEED DATA: Role (4 records)
-- ------------------------------------------------------------------------------
INSERT INTO role (role_name, role_code)
VALUES ('Quản trị viên', 'ADMIN'),
    ('Khách hàng', 'CUSTOMER'),
    ('Quản lý cảng', 'PORT_MANAGER'),
    ('Chủ tàu', 'VESSEL_OWNER');
-- ------------------------------------------------------------------------------
-- 2. SEED DATA: User (~35 records)
-- Mật khẩu mặc định: 123456
-- Role allocation: 1 Admin (1), 9 Customers (2), 5 Port Managers (3), 20 Vessel Owners (4)
-- ------------------------------------------------------------------------------
INSERT INTO "user" (
        user_name,
        user_pwd,
        user_phone,
        user_email,
        user_status,
        created_at,
        updated_at,
        deleted_at,
        role_id
    )
VALUES -- Admin (1)
    (
        'admin_system',
        '123456',
        '0901000001',
        'admin@vesseapp.vn',
        'ACTIVE',
        NOW() - INTERVAL '60 days',
        NOW(),
        NULL,
        1
    ),
    -- Customers (9)
    (
        'nguyen_van_a',
        '123456',
        '0912345671',
        'nguyenvana@gmail.com',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        2
    ),
    (
        'tran_thi_b',
        '123456',
        '0912345672',
        'tranthib@gmail.com',
        'ACTIVE',
        NOW() - INTERVAL '48 days',
        NOW(),
        NULL,
        2
    ),
    (
        'le_hoang_c',
        '123456',
        '0912345673',
        'lehoangc@gmail.com',
        'ACTIVE',
        NOW() - INTERVAL '45 days',
        NOW(),
        NULL,
        2
    ),
    (
        'pham_minh_d',
        '123456',
        '0912345674',
        'phamminhd@gmail.com',
        'ACTIVE',
        NOW() - INTERVAL '40 days',
        NOW(),
        NULL,
        2
    ),
    (
        'hoang_anh_e',
        '123456',
        '0912345675',
        'hoanganhe@gmail.com',
        'ACTIVE',
        NOW() - INTERVAL '38 days',
        NOW(),
        NULL,
        2
    ),
    (
        'vu_thi_f',
        '123456',
        '0912345676',
        'vuthif@gmail.com',
        'ACTIVE',
        NOW() - INTERVAL '35 days',
        NOW(),
        NULL,
        2
    ),
    (
        'dang_van_g',
        '123456',
        '0912345677',
        'dangvang@gmail.com',
        'ACTIVE',
        NOW() - INTERVAL '30 days',
        NOW(),
        NULL,
        2
    ),
    (
        'bui_thi_h',
        '123456',
        '0912345678',
        'buithih@gmail.com',
        'ACTIVE',
        NOW() - INTERVAL '25 days',
        NOW(),
        NULL,
        2
    ),
    (
        'doan_van_i',
        '123456',
        '0912345679',
        'doanvani@gmail.com',
        'INACTIVE',
        NOW() - INTERVAL '20 days',
        NOW(),
        NULL,
        2
    ),
    -- Port Managers (5) -> Liên kết 1:1 tới 5 Cảng bên dưới
    (
        'pm_catlai',
        '123456',
        '0988000001',
        'manager.catlai@port.vn',
        'ACTIVE',
        NOW() - INTERVAL '55 days',
        NOW(),
        NULL,
        3
    ),
    (
        'pm_hiepphuoc',
        '123456',
        '0988000002',
        'manager.hiepphuoc@port.vn',
        'ACTIVE',
        NOW() - INTERVAL '55 days',
        NOW(),
        NULL,
        3
    ),
    (
        'pm_cantho',
        '123456',
        '0988000003',
        'manager.cantho@port.vn',
        'ACTIVE',
        NOW() - INTERVAL '55 days',
        NOW(),
        NULL,
        3
    ),
    (
        'pm_mytho',
        '123456',
        '0988000004',
        'manager.mytho@port.vn',
        'ACTIVE',
        NOW() - INTERVAL '55 days',
        NOW(),
        NULL,
        3
    ),
    (
        'pm_longan',
        '123456',
        '0988000005',
        'manager.longan@port.vn',
        'ACTIVE',
        NOW() - INTERVAL '55 days',
        NOW(),
        NULL,
        3
    ),
    -- Vessel Owners (20) -> Liên kết 1:1 tới 20 Tàu bên dưới
    (
        'vo_nguyen_01',
        '123456',
        '0977000001',
        'owner01@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_tran_02',
        '123456',
        '0977000002',
        'owner02@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_le_03',
        '123456',
        '0977000003',
        'owner03@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_pham_04',
        '123456',
        '0977000004',
        'owner04@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_hoang_05',
        '123456',
        '0977000005',
        'owner05@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_phan_06',
        '123456',
        '0977000006',
        'owner06@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_vu_07',
        '123456',
        '0977000007',
        'owner07@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_dang_08',
        '123456',
        '0977000008',
        'owner08@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_bui_09',
        '123456',
        '0977000009',
        'owner09@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_do_10',
        '123456',
        '0977000010',
        'owner10@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_ho_11',
        '123456',
        '0977000011',
        'owner11@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_ngo_12',
        '123456',
        '0977000012',
        'owner12@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_duong_13',
        '123456',
        '0977000013',
        'owner13@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_ly_14',
        '123456',
        '0977000014',
        'owner14@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_doan_15',
        '123456',
        '0977000015',
        'owner15@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_dinh_16',
        '123456',
        '0977000016',
        'owner16@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_trinh_17',
        '123456',
        '0977000017',
        'owner17@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_lam_18',
        '123456',
        '0977000018',
        'owner18@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_mai_19',
        '123456',
        '0977000019',
        'owner19@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    ),
    (
        'vo_cao_20',
        '123456',
        '0977000020',
        'owner20@shipping.vn',
        'ACTIVE',
        NOW() - INTERVAL '50 days',
        NOW(),
        NULL,
        4
    );
-- ------------------------------------------------------------------------------
-- 3. SEED DATA: Port (5 cảng miền Nam Việt Nam)
-- Gắn user_id tương ứng từ 11 tới 15
-- ------------------------------------------------------------------------------
INSERT INTO port (port_name, port_geo, user_id)
VALUES (
        'Cảng Cát Lái',
        ST_GeogFromText('SRID=4326;POINT(106.7801 10.7563)'),
        11
    ),
    (
        'Cảng Hiệp Phước',
        ST_GeogFromText('SRID=4326;POINT(106.7511 10.6358)'),
        12
    ),
    (
        'Cảng Cần Thơ',
        ST_GeogFromText('SRID=4326;POINT(105.7872 10.0452)'),
        13
    ),
    (
        'Cảng Mỹ Tho',
        ST_GeogFromText('SRID=4326;POINT(106.3571 10.3524)'),
        14
    ),
    (
        'Cảng Long An',
        ST_GeogFromText('SRID=4326;POINT(106.5312 10.5341)'),
        15
    );
-- ------------------------------------------------------------------------------
-- 4. SEED DATA: Vessel (20 tàu)
-- Gắn user_id tương ứng từ 16 tới 35
-- ------------------------------------------------------------------------------
INSERT INTO vessel (
        vessel_owner_name,
        vessel_status,
        vessel_capacity,
        vessel_cargo_type,
        user_id
    )
VALUES (
        'Công ty Vận tải Sông Việt 01',
        'ACTIVE',
        500.00,
        'Container',
        16
    ),
    (
        'Công ty Vận tải Sông Việt 02',
        'ACTIVE',
        350.00,
        'Lúa gạo',
        17
    ),
    (
        'Công ty Vận tải Sông Việt 03',
        'INACTIVE',
        600.00,
        'Than đá',
        18
    ),
    (
        'Công ty Vận tải Sông Việt 04',
        'INACTIVE',
        400.00,
        'Cát xây dựng',
        19
    ),
    (
        'Công ty Vận tải Sông Việt 05',
        'INACTIVE',
        300.00,
        'Thép cuộn',
        20
    ),
    (
        'Vận tải Miền Tây 06',
        'ACTIVE',
        500.00,
        'Vật liệu xây dựng',
        21
    ),
    (
        'Vận tải Miền Tây 07',
        'INACTIVE',
        450.00,
        'Phân bón',
        22
    ),
    (
        'Vận tải Miền Tây 08',
        'INACTIVE',
        700.00,
        'Container',
        23
    ),
    (
        'Vận tải Miền Tây 09',
        'INACTIVE',
        250.00,
        'Lúa gạo',
        24
    ),
    (
        'Vận tải Miền Tây 10',
        'ACTIVE',
        550.00,
        'Nông sản',
        25
    ),
    (
        'Tập đoàn Tân Cảng 11',
        'ACTIVE',
        800.00,
        'Container',
        26
    ),
    (
        'Tập đoàn Tân Cảng 12',
        'ACTIVE',
        650.00,
        'Thép cuộn',
        27
    ),
    (
        'Tập đoàn Tân Cảng 13',
        'ACTIVE',
        400.00,
        'Gỗ cây',
        28
    ),
    (
        'Tập đoàn Tân Cảng 14',
        'INACTIVE',
        300.00,
        'Lúa gạo',
        29
    ),
    (
        'Tập đoàn Tân Cảng 15',
        'INACTIVE',
        500.00,
        'Cát xây dựng',
        30
    ),
    (
        'Chủ tàu Nguyễn Văn Nam 16',
        'INACTIVE',
        200.00,
        'Nông sản',
        31
    ),
    (
        'Chủ tàu Trần Văn Hải 17',
        'INACTIVE',
        350.00,
        'Lúa gạo',
        32
    ),
    (
        'Chủ tàu Lê Hoàng Minh 18',
        'INACTIVE',
        450.00,
        'Phân bón',
        33
    ),
    (
        'Chủ tàu Phạm Quốc Tuấn 19',
        'ACTIVE',
        600.00,
        'Container',
        34
    ),
    (
        'Chủ tàu Võ Văn Linh 20',
        'ACTIVE',
        500.00,
        'Vật liệu xây dựng',
        35
    );
-- ------------------------------------------------------------------------------
-- 5. SEED DATA: Route (Tuyến đi A -> B trực tiếp)
-- ------------------------------------------------------------------------------
INSERT INTO route (route_code, updated_at, deleted_at)
VALUES ('ROUTE_CATLAI_CANTHO', NOW(), NULL),
    ('ROUTE_CATLAI_LONGAN', NOW(), NULL),
    ('ROUTE_CATLAI_MYTHO', NOW(), NULL),
    ('ROUTE_HIEPPHUOC_CANTHO', NOW(), NULL),
    ('ROUTE_CANTHO_MYTHO', NOW(), NULL),
    ('ROUTE_LONGAN_MYTHO', NOW(), NULL);
-- ------------------------------------------------------------------------------
-- 6. SEED DATA: RoutePort (Liên kết Route với Cảng Đi và Cảng Đến)
-- Route 1: Cát Lái (1) -> Cần Thơ (3)
-- Route 2: Cát Lái (1) -> Long An (5)
-- Route 3: Cát Lái (1) -> Mỹ Tho (4)
-- Route 4: Hiệp Phước (2) -> Cần Thơ (3)
-- Route 5: Cần Thơ (3) -> Mỹ Tho (4)
-- Route 6: Long An (5) -> Mỹ Tho (4)
-- ------------------------------------------------------------------------------
INSERT INTO route_port (route_id, port_id)
VALUES (1, 1),
    (1, 3),
    (2, 1),
    (2, 5),
    (3, 1),
    (3, 4),
    (4, 2),
    (4, 3),
    (5, 3),
    (5, 4),
    (6, 5),
    (6, 4);
-- ------------------------------------------------------------------------------
-- 7. SEED DATA: Booking (30 Bookings)
-- Gắn với User Customer (id: 2..10) và Route (id: 1..6)
-- Trạng thái phân bổ: PENDING, APPROVED, MATCHED, IN_PROGRESS, COMPLETED, CANCELLED
-- ------------------------------------------------------------------------------
INSERT INTO booking (
        booking_date,
        receive_date,
        expected_date,
        expired_date,
        booking_status,
        cargo_type,
        cargo_capacity,
        user_id,
        route_id
    )
VALUES -- Standard Workflow States
    (
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '5 days',
        NOW() + INTERVAL '10 days',
        'PENDING_PORT_REVIEW',
        'Lúa gạo',
        150.00,
        2,
        1
    ),
    (
        NOW() - INTERVAL '3 days',
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '6 days',
        NOW() + INTERVAL '10 days',
        'PENDING_PORT_REVIEW',
        'Container',
        200.00,
        3,
        2
    ),
    (
        NOW() - INTERVAL '4 days',
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '4 days',
        NOW() + INTERVAL '8 days',
        'WAITING_VESSEL_RESPONSE',
        'Thép cuộn',
        250.00,
        5,
        1
    ),
    (
        NOW() - INTERVAL '5 days',
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '9 days',
        'VESSEL_CANDIDATES_READY',
        'Phân bón',
        180.00,
        6,
        4
    ),
    (
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '4 days',
        NOW() + INTERVAL '8 days',
        'WAITING_CUSTOMER_SELECTION',
        'Nông sản',
        180.00,
        9,
        5
    ),
    (
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '3 days',
        NOW() + INTERVAL '7 days',
        'WAITING_FINAL_CONFIRMATION',
        'Thép cuộn',
        270.00,
        6,
        3
    ),
    (
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '4 days',
        NOW() + INTERVAL '8 days',
        'CONFIRMED',
        'Lúa gạo',
        230.00,
        4,
        4
    ),
    (
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '4 days',
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '6 days',
        'IN_PROGRESS',
        'Thép cuộn',
        350.00,
        7,
        3
    ),
    (
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '3 days',
        NOW() + INTERVAL '3 days',
        NOW() + INTERVAL '7 days',
        'IN_PROGRESS',
        'Phân bón',
        220.00,
        8,
        4
    ),
    (
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '5 days',
        'COMPLETED',
        'Lúa gạo',
        300.00,
        2,
        1
    ),
    (
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '5 days',
        'COMPLETED',
        'Container',
        400.00,
        3,
        2
    ),
    -- Exception & Failure States
    (
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '12 days',
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '5 days',
        'REJECTED_BY_PORT',
        'Cát xây dựng',
        300.00,
        4,
        3
    ),
    (
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '6 days',
        NOW() + INTERVAL '10 days',
        'INVALID_ROUTE',
        'Container',
        120.00,
        2,
        6
    ),
    (
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '3 days',
        NOW() + INTERVAL '7 days',
        NOW() + INTERVAL '11 days',
        'NO_VESSEL_AVAILABLE',
        'Gỗ cây',
        210.00,
        3,
        1
    ),
    (
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '5 days',
        NOW() + INTERVAL '9 days',
        'NO_VESSEL_ACCEPTED',
        'Than đá',
        500.00,
        4,
        2
    ),
    (
        NOW() - INTERVAL '12 days',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '1 day',
        'EXPIRED',
        'Lúa gạo',
        280.00,
        5,
        3
    ),
    (
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '12 days',
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '5 days',
        'CANCELLED',
        'Cát xây dựng',
        300.00,
        4,
        3
    ),
    (
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '3 days',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '2 days',
        'FAILED',
        'Than đá',
        450.00,
        8,
        2
    ),
    -- Additional Seed Data covering full pipeline
    (
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '6 days',
        NOW() + INTERVAL '10 days',
        'PENDING_PORT_REVIEW',
        'Nông sản',
        160.00,
        3,
        6
    ),
    (
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '5 days',
        NOW() + INTERVAL '9 days',
        'WAITING_VESSEL_RESPONSE',
        'Thép cuộn',
        340.00,
        5,
        5
    ),
    (
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '6 days',
        NOW() + INTERVAL '10 days',
        'VESSEL_CANDIDATES_READY',
        'Vật liệu xây dựng',
        290.00,
        2,
        5
    ),
    (
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '3 days',
        NOW() + INTERVAL '7 days',
        'WAITING_CUSTOMER_SELECTION',
        'Nông sản',
        190.00,
        2,
        2
    ),
    (
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '2 days',
        NOW() + INTERVAL '6 days',
        'WAITING_FINAL_CONFIRMATION',
        'Phân bón',
        310.00,
        3,
        3
    ),
    (
        NOW() - INTERVAL '6 days',
        NOW() - INTERVAL '4 days',
        NOW() + INTERVAL '1 day',
        NOW() + INTERVAL '5 days',
        'CONFIRMED',
        'Cát xây dựng',
        380.00,
        9,
        4
    ),
    (
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '4 days',
        'IN_PROGRESS',
        'Vật liệu xây dựng',
        320.00,
        6,
        4
    ),
    (
        NOW() - INTERVAL '9 days',
        NOW() - INTERVAL '7 days',
        NOW() - INTERVAL '2 days',
        NOW() + INTERVAL '3 days',
        'COMPLETED',
        'Container',
        450.00,
        7,
        5
    ),
    (
        NOW() - INTERVAL '12 days',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '2 days',
        'EXPIRED',
        'Cát xây dựng',
        260.00,
        8,
        6
    ),
    (
        NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '18 days',
        NOW() - INTERVAL '14 days',
        NOW() - INTERVAL '10 days',
        'CANCELLED',
        'Lúa gạo',
        200.00,
        4,
        1
    ),
    (
        NOW() - INTERVAL '18 days',
        NOW() - INTERVAL '16 days',
        NOW() - INTERVAL '12 days',
        NOW() - INTERVAL '8 days',
        'FAILED',
        'Container',
        300.00,
        5,
        2
    ),
    (
        NOW() - INTERVAL '11 days',
        NOW() - INTERVAL '9 days',
        NOW() - INTERVAL '3 days',
        NOW() + INTERVAL '2 days',
        'CONFIRMED',
        'Container',
        500.00,
        6,
        1
    );
-- ------------------------------------------------------------------------------
-- 8. SEED DATA: BookingReview
-- Mỗi booking sẽ được xét duyệt bởi Cảng xuất phát / Cảng đích thuộc Tuyến đường
-- ------------------------------------------------------------------------------
INSERT INTO booking_review (booking_id, port_id, review_status, review_date)
VALUES -- Reviews cho Booking 1..10
    (1, 1, 'PENDING', NOW() - INTERVAL '1 day'),
    (2, 1, 'PENDING', NOW() - INTERVAL '2 days'),
    (3, 1, 'REJECTED', NOW() - INTERVAL '14 days'),
    (4, 1, 'APPROVED', NOW() - INTERVAL '3 days'),
    (4, 3, 'APPROVED', NOW() - INTERVAL '3 days'),
    (5, 2, 'APPROVED', NOW() - INTERVAL '4 days'),
    (6, 1, 'APPROVED', NOW() - INTERVAL '9 days'),
    (7, 1, 'APPROVED', NOW() - INTERVAL '7 days'),
    (8, 1, 'APPROVED', NOW() - INTERVAL '5 days'),
    (9, 2, 'APPROVED', NOW() - INTERVAL '4 days'),
    (10, 3, 'APPROVED', NOW() - INTERVAL '3 days'),
    -- Reviews cho Booking 11..30
    (13, 1, 'APPROVED', NOW() - INTERVAL '1 day'),
    (14, 1, 'APPROVED', NOW() - INTERVAL '2 days'),
    (15, 2, 'APPROVED', NOW() - INTERVAL '6 days'),
    (16, 3, 'APPROVED', NOW() - INTERVAL '8 days'),
    (17, 5, 'APPROVED', NOW() - INTERVAL '11 days'),
    (18, 1, 'APPROVED', NOW() - INTERVAL '3 days'),
    (19, 1, 'APPROVED', NOW() - INTERVAL '4 days'),
    (20, 2, 'APPROVED', NOW() - INTERVAL '2 days'),
    (21, 3, 'APPROVED', NOW() - INTERVAL '1 day'),
    (22, 1, 'APPROVED', NOW() - INTERVAL '10 days'),
    (23, 1, 'APPROVED', NOW() - INTERVAL '13 days'),
    (24, 1, 'APPROVED', NOW() - INTERVAL '12 days'),
    (25, 2, 'APPROVED', NOW() - INTERVAL '5 days'),
    (26, 3, 'APPROVED', NOW() - INTERVAL '1 day'),
    (30, 1, 'APPROVED', NOW() - INTERVAL '2 days');
-- ------------------------------------------------------------------------------
-- 9. SEED DATA: VesselMatch
-- Ghép 1 hoặc nhiều tàu ứng viên phù hợp với sức chứa của Booking đã được APPROVED/MATCHED/IN_PROGRESS/COMPLETED
-- ------------------------------------------------------------------------------
INSERT INTO vessel_match (vessel_id, booking_id)
VALUES -- Booking 6 (Tải trọng 300) -> Tàu 1 (Capacity 500) & Tàu 2 (Capacity 350)
    (1, 6),
    (2, 6),
    -- Booking 7 (Tải trọng 400) -> Tàu 3 (Capacity 600)
    (3, 7),
    -- Booking 8 (Tải trọng 350) -> Tàu 4 (Capacity 400)
    (4, 8),
    -- Booking 9 (Tải trọng 220) -> Tàu 6 (Capacity 500) & Tàu 7 (Capacity 450)
    (6, 9),
    (7, 9),
    -- Booking 10 (Tải trọng 180) -> Tàu 9 (Capacity 250)
    (9, 10),
    -- Booking 15..25
    (11, 15),
    (12, 16),
    (13, 17),
    (14, 18),
    (16, 19),
    (17, 20),
    (18, 21),
    (19, 22),
    (20, 23),
    (1, 24),
    (3, 25),
    (8, 30);
-- ------------------------------------------------------------------------------
-- 10. SEED DATA: Shipment
-- Tạo các chuyến vận chuyển thực tế từ BookingReview đã APPROVED và VesselMatch thành công
-- ------------------------------------------------------------------------------
INSERT INTO shipment (
        shipment_status,
        shipment_date,
        vessel_id,
        review_id
    )
VALUES -- Booking 6 (Review 7, Vessel 1) -> Completed
    ('DELIVERED', NOW() - INTERVAL '8 days', 1, 7),
    -- Booking 7 (Review 8, Vessel 3) -> Completed
    ('DELIVERED', NOW() - INTERVAL '6 days', 3, 8),
    -- Booking 8 (Review 9, Vessel 4) -> In Transit
    ('IN_TRANSIT', NOW() - INTERVAL '4 days', 4, 9),
    -- Booking 9 (Review 10, Vessel 7) -> In Transit
    ('IN_TRANSIT', NOW() - INTERVAL '3 days', 7, 10),
    -- Booking 10 (Review 11, Vessel 9) -> Planned
    ('PLANNED', NOW() - INTERVAL '1 day', 9, 11),
    -- Các shipment khác
    ('DELIVERED', NOW() - INTERVAL '5 days', 11, 14),
    ('DELIVERED', NOW() - INTERVAL '7 days', 12, 15),
    ('DELIVERED', NOW() - INTERVAL '10 days', 13, 16),
    ('IN_TRANSIT', NOW() - INTERVAL '2 days', 14, 17),
    ('IN_TRANSIT', NOW() - INTERVAL '3 days', 16, 18),
    ('PLANNED', NOW() - INTERVAL '1 day', 17, 19),
    ('PLANNED', NOW() - INTERVAL '1 day', 18, 20),
    ('DELIVERED', NOW() - INTERVAL '9 days', 19, 21),
    ('DELIVERED', NOW() - INTERVAL '12 days', 20, 22),
    ('DELIVERED', NOW() - INTERVAL '11 days', 1, 23),
    ('IN_TRANSIT', NOW() - INTERVAL '3 days', 3, 24),
    ('PLANNED', NOW() - INTERVAL '1 day', 8, 25);
