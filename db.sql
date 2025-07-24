-- ========================================
-- XÓA TẤT CẢ BẢNG CŨ (NẾU CÓ)
-- ========================================
-- Xóa theo thứ tự để tránh lỗi foreign key constraint

-- Xóa bảng con trước
IF OBJECT_ID('booking_seats', 'U') IS NOT NULL DROP TABLE booking_seats;
IF OBJECT_ID('payments', 'U') IS NOT NULL DROP TABLE payments;
IF OBJECT_ID('feedbacks', 'U') IS NOT NULL DROP TABLE feedbacks;
IF OBJECT_ID('bookings', 'U') IS NOT NULL DROP TABLE bookings;
IF OBJECT_ID('seats', 'U') IS NOT NULL DROP TABLE seats;
IF OBJECT_ID('schedule_management', 'U') IS NOT NULL DROP TABLE schedule_management;
IF OBJECT_ID('schedules', 'U') IS NOT NULL DROP TABLE schedules;
IF OBJECT_ID('schedule_patterns', 'U') IS NOT NULL DROP TABLE schedule_patterns;
IF OBJECT_ID('drivers', 'U') IS NOT NULL DROP TABLE drivers;
IF OBJECT_ID('buses', 'U') IS NOT NULL DROP TABLE buses;
IF OBJECT_ID('bus_types', 'U') IS NOT NULL DROP TABLE bus_types;
IF OBJECT_ID('routes', 'U') IS NOT NULL DROP TABLE routes;
IF OBJECT_ID('stops', 'U') IS NOT NULL DROP TABLE stops;
IF OBJECT_ID('provinces', 'U') IS NOT NULL DROP TABLE provinces;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
IF OBJECT_ID('staff_accounts', 'U') IS NOT NULL DROP TABLE staff_accounts;

PRINT 'All existing tables dropped successfully!';

-- ========================================
-- TẠO BẢNG MỚI (THỨ TỰ ĐÚNG)
-- ========================================

-- BẢNG NGƯỜI DÙNG
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    phone_number NVARCHAR(20) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE() NOT NULL
);

-- BẢNG TỈNH/THÀNH PHỐ
CREATE TABLE provinces (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100),
    code NVARCHAR(20)
);

-- BẢNG ĐIỂM ĐÓN/TRẢ
CREATE TABLE stops (
    id INT IDENTITY(1,1) PRIMARY KEY,
    province_id INT,
    name NVARCHAR(255),
    address NVARCHAR(255),
    type NVARCHAR(10) CHECK (type IN ('pickup', 'dropoff')),
    FOREIGN KEY (province_id) REFERENCES provinces(id)
);

-- BẢNG TUYẾN ĐƯỜNG
CREATE TABLE routes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    departure_province_id INT,
    arrival_province_id INT,
    distance_km INT,
    estimated_time INT,
    is_active BIT DEFAULT 1,
    FOREIGN KEY (departure_province_id) REFERENCES provinces(id),
    FOREIGN KEY (arrival_province_id) REFERENCES provinces(id)
);

-- BẢNG LOẠI XE
CREATE TABLE bus_types (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    description NVARCHAR(255)
);

-- BẢNG XE
CREATE TABLE buses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    license_plate NVARCHAR(20),
    seat_count INT,
    bus_type_id INT,
    description NVARCHAR(MAX),
    is_active BIT DEFAULT 1,
    FOREIGN KEY (bus_type_id) REFERENCES bus_types(id)
);

-- BẢNG TÀI XẾ
CREATE TABLE drivers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100),
    phone_number NVARCHAR(20),
    license_number NVARCHAR(50),
    hire_date DATE,
    is_active BIT DEFAULT 1
);

-- BẢNG TÀI KHOẢN NHÂN VIÊN / ADMIN (ĐƯA LÊN TRƯỚC)
CREATE TABLE staff_accounts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100),
    username NVARCHAR(50) UNIQUE,
    password_hash NVARCHAR(255),
    role NVARCHAR(20) CHECK (role IN ('admin', 'manager', 'support', 'viewer')),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    last_login_at DATETIME NULL
);

-- BẢNG SCHEDULE PATTERNS (Mẫu lịch trình tự động)
CREATE TABLE schedule_patterns (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500),
    route_id INT NOT NULL,
    bus_type_id INT NOT NULL,
    departure_times NVARCHAR(MAX) NOT NULL,  -- JSON: ["06:00", "08:00", "10:00"]
    days_of_week NVARCHAR(20) NOT NULL,      -- "1,2,3,4,5,6,7" (Thứ 2-7)
    base_price DECIMAL(10,2) NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (route_id) REFERENCES routes(id),
    FOREIGN KEY (bus_type_id) REFERENCES bus_types(id)
);

-- BẢNG LỊCH TRÌNH
CREATE TABLE schedules (
    id INT IDENTITY(1,1) PRIMARY KEY,
    bus_id INT,
    route_id INT,
    driver_id INT,
    departure_time DATETIME,
    actual_departure_time DATETIME NULL,
    actual_arrival_time DATETIME NULL,
    price DECIMAL(10,2),
    status NVARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'cancelled', 'delayed')) DEFAULT 'scheduled',
    is_auto_generated BIT DEFAULT 0,  -- Đánh dấu lịch trình tự động tạo
    pattern_id INT NULL,              -- Tham chiếu đến pattern nếu là auto-generated
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (bus_id) REFERENCES buses(id),
    FOREIGN KEY (route_id) REFERENCES routes(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (pattern_id) REFERENCES schedule_patterns(id)
);

-- BẢNG QUẢN LÝ SCHEDULE (Bật/tắt lịch trình) - ĐƯA XUỐNG SAU
CREATE TABLE schedule_management (
    id INT IDENTITY(1,1) PRIMARY KEY,
    schedule_id INT NOT NULL,
    is_enabled BIT DEFAULT 1,        -- Bật/tắt lịch trình
    is_seat_enabled BIT DEFAULT 1,   -- Bật/tắt ghế
    admin_note NVARCHAR(500),        -- Ghi chú của admin
    modified_by INT,                 -- ID staff account
    modified_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (modified_by) REFERENCES staff_accounts(id)
);

-- BẢNG GHẾ
CREATE TABLE seats (
    id INT IDENTITY(1,1) PRIMARY KEY,
    schedule_id INT,
    seat_number NVARCHAR(10),
    status NVARCHAR(20) CHECK (status IN ('available', 'booked', 'blocked')) DEFAULT 'available',
    floor NVARCHAR(10) NULL,
    is_enabled BIT DEFAULT 1,        -- Bật/tắt ghế
    FOREIGN KEY (schedule_id) REFERENCES schedules(id)
);

-- BẢNG ĐƠN ĐẶT VÉ
CREATE TABLE bookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    schedule_id INT,
    total_price DECIMAL(10,2),
    status NVARCHAR(20) CHECK (status IN ('pending', 'paid', 'cancelled', 'completed')) DEFAULT 'pending',
    booked_at DATETIME DEFAULT GETDATE(),
    payment_method NVARCHAR(50),
    pickup_stop_id INT NULL,
    dropoff_stop_id INT NULL,
    payment_request_id NVARCHAR(100) NULL,
    payment_url NVARCHAR(500) NULL,
    order_code NVARCHAR(100) NULL,
    payment_status NVARCHAR(50) DEFAULT 'pending',
    payment_completed_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (pickup_stop_id) REFERENCES stops(id),
    FOREIGN KEY (dropoff_stop_id) REFERENCES stops(id)
);

-- BẢNG TRUNG GIAN GHẾ CỦA ĐƠN ĐẶT
CREATE TABLE booking_seats (
    id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT,
    seat_id INT,
    price DECIMAL(10,2),
    created_at DATETIME DEFAULT GETDATE(),
    pickup_stop_id INT NULL,
    dropoff_stop_id INT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (seat_id) REFERENCES seats(id),
    FOREIGN KEY (pickup_stop_id) REFERENCES stops(id),
    FOREIGN KEY (dropoff_stop_id) REFERENCES stops(id)
);

-- BẢNG THANH TOÁN
CREATE TABLE payments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT,
    provider NVARCHAR(50),
    amount DECIMAL(10,2),
    status NVARCHAR(20) CHECK (status IN ('success', 'failed', 'pending')),
    payment_time DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- BẢNG PHẢN HỒI
CREATE TABLE feedbacks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    booking_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Tạo indexes cho performance
CREATE INDEX IX_bookings_order_code ON bookings(order_code);
CREATE INDEX IX_bookings_payment_request_id ON bookings(payment_request_id);
CREATE INDEX IX_schedules_auto_generated ON schedules(is_auto_generated);
CREATE INDEX IX_schedules_pattern_id ON schedules(pattern_id);
CREATE INDEX IX_schedule_management_schedule_id ON schedule_management(schedule_id);
CREATE INDEX IX_seats_schedule_id ON seats(schedule_id);
CREATE INDEX IX_seats_enabled ON seats(is_enabled);

PRINT 'Database schema created successfully with Schedule Automation support!';