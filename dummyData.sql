-- DUMMY DATA SCRIPT - FIXED VERSION
-- Tạo dữ liệu mẫu cho hệ thống đặt vé xe khách

-- ========================================
-- XÓA DỮ LIỆU CŨ (AN TOÀN)
-- ========================================
-- Xóa theo thứ tự để tránh lỗi foreign key constraint

-- Xóa bảng con trước
IF OBJECT_ID('booking_seats', 'U') IS NOT NULL DELETE FROM booking_seats;
IF OBJECT_ID('payments', 'U') IS NOT NULL DELETE FROM payments;
IF OBJECT_ID('feedbacks', 'U') IS NOT NULL DELETE FROM feedbacks;
IF OBJECT_ID('bookings', 'U') IS NOT NULL DELETE FROM bookings;
IF OBJECT_ID('seats', 'U') IS NOT NULL DELETE FROM seats;
IF OBJECT_ID('schedule_management', 'U') IS NOT NULL DELETE FROM schedule_management;
IF OBJECT_ID('schedules', 'U') IS NOT NULL DELETE FROM schedules;
IF OBJECT_ID('schedule_patterns', 'U') IS NOT NULL DELETE FROM schedule_patterns;
IF OBJECT_ID('drivers', 'U') IS NOT NULL DELETE FROM drivers;
IF OBJECT_ID('buses', 'U') IS NOT NULL DELETE FROM buses;
IF OBJECT_ID('bus_types', 'U') IS NOT NULL DELETE FROM bus_types;
IF OBJECT_ID('routes', 'U') IS NOT NULL DELETE FROM routes;
IF OBJECT_ID('stops', 'U') IS NOT NULL DELETE FROM stops;
IF OBJECT_ID('provinces', 'U') IS NOT NULL DELETE FROM provinces;
IF OBJECT_ID('users', 'U') IS NOT NULL DELETE FROM users;
IF OBJECT_ID('staff_accounts', 'U') IS NOT NULL DELETE FROM staff_accounts;

-- ========================================
-- RESET IDENTITY COLUMNS (AN TOÀN)
-- ========================================
-- Chỉ reset nếu bảng tồn tại
IF OBJECT_ID('booking_seats', 'U') IS NOT NULL DBCC CHECKIDENT ('booking_seats', RESEED, 0);
IF OBJECT_ID('payments', 'U') IS NOT NULL DBCC CHECKIDENT ('payments', RESEED, 0);
IF OBJECT_ID('feedbacks', 'U') IS NOT NULL DBCC CHECKIDENT ('feedbacks', RESEED, 0);
IF OBJECT_ID('bookings', 'U') IS NOT NULL DBCC CHECKIDENT ('bookings', RESEED, 0);
IF OBJECT_ID('seats', 'U') IS NOT NULL DBCC CHECKIDENT ('seats', RESEED, 0);
IF OBJECT_ID('schedule_management', 'U') IS NOT NULL DBCC CHECKIDENT ('schedule_management', RESEED, 0);
IF OBJECT_ID('schedules', 'U') IS NOT NULL DBCC CHECKIDENT ('schedules', RESEED, 0);
IF OBJECT_ID('schedule_patterns', 'U') IS NOT NULL DBCC CHECKIDENT ('schedule_patterns', RESEED, 0);
IF OBJECT_ID('drivers', 'U') IS NOT NULL DBCC CHECKIDENT ('drivers', RESEED, 0);
IF OBJECT_ID('buses', 'U') IS NOT NULL DBCC CHECKIDENT ('buses', RESEED, 0);
IF OBJECT_ID('bus_types', 'U') IS NOT NULL DBCC CHECKIDENT ('bus_types', RESEED, 0);
IF OBJECT_ID('routes', 'U') IS NOT NULL DBCC CHECKIDENT ('routes', RESEED, 0);
IF OBJECT_ID('stops', 'U') IS NOT NULL DBCC CHECKIDENT ('stops', RESEED, 0);
IF OBJECT_ID('provinces', 'U') IS NOT NULL DBCC CHECKIDENT ('provinces', RESEED, 0);
IF OBJECT_ID('users', 'U') IS NOT NULL DBCC CHECKIDENT ('users', RESEED, 0);
IF OBJECT_ID('staff_accounts', 'U') IS NOT NULL DBCC CHECKIDENT ('staff_accounts', RESEED, 0);

PRINT 'Data cleanup completed successfully!';

-- ========================================
-- 1. PROVINCES (TỈNH/THÀNH PHỐ)
-- ========================================
INSERT INTO provinces (name, code) VALUES 
(N'Hà Nội', 'HN'),
(N'Hồ Chí Minh', 'HCM'),
(N'Đà Nẵng', 'DN'),
(N'Hải Phòng', 'HP'),
(N'Cần Thơ', 'CT'),
(N'An Giang', 'AG'),
(N'Bà Rịa - Vũng Tàu', 'BR-VT'),
(N'Bình Dương', 'BD'),
(N'Bình Phước', 'BP'),
(N'Bình Thuận', 'BT'),
(N'Bình Định', 'BĐ'),
(N'Bến Tre', 'BT'),
(N'Cà Mau', 'CM'),
(N'Đắk Lắk', 'ĐL'),
(N'Đồng Nai', 'ĐN'),
(N'Gia Lai', 'GL'),
(N'Hậu Giang', 'HG'),
(N'Khánh Hòa', 'KH'),
(N'Kiên Giang', 'KG'),
(N'Lâm Đồng', 'LĐ'),
(N'Long An', 'LA'),
(N'Nghệ An', 'NA'),
(N'Phú Yên', 'PY'),
(N'Quảng Nam', 'QN'),
(N'Quảng Ngãi', 'QNg'),
(N'Sóc Trăng', 'ST'),
(N'Tây Ninh', 'TN'),
(N'Thừa Thiên Huế', 'TTH'),
(N'Tiền Giang', 'TG'),
(N'Trà Vinh', 'TV'),
(N'Vĩnh Long', 'VL');

PRINT 'Provinces inserted successfully!';

-- ========================================
-- 2. STOPS (ĐIỂM ĐÓN/TRẢ)
-- ========================================
INSERT INTO stops (province_id, name, address, type) VALUES 
-- Hà Nội
(1, N'Bến xe Mỹ Đình', N'Số 20 Phạm Hùng, Nam Từ Liêm, Hà Nội', 'pickup'),
(1, N'Bến xe Giáp Bát', N'Giải Phóng, Hoàng Mai, Hà Nội', 'pickup'),
(1, N'Bến xe Nước Ngầm', N'Phố Nước Ngầm, Hoàng Mai, Hà Nội', 'pickup'),
(1, N'Văn phòng Quận Cầu Giấy', N'Phố Trần Thái Tông, Cầu Giấy, Hà Nội', 'dropoff'),
(1, N'Văn phòng Quận Đống Đa', N'Phố Lê Duẩn, Đống Đa, Hà Nội', 'dropoff'),

-- Hồ Chí Minh
(2, N'Bến xe Miền Đông', N'292 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM', 'pickup'),
(2, N'Bến xe Miền Tây', N'395 Kinh Dương Vương, Bình Tân, TP.HCM', 'pickup'),
(2, N'Bến xe An Sương', N'QL22, Hóc Môn, TP.HCM', 'pickup'),
(2, N'Văn phòng Quận 1', N'Đường Lê Lai, Quận 1, TP.HCM', 'dropoff'),
(2, N'Văn phòng Quận 3', N'Đường Võ Văn Tần, Quận 3, TP.HCM', 'dropoff'),

-- Đà Nẵng
(3, N'Bến xe Đà Nẵng', N'Đường Tôn Đức Thắng, Hải Châu, Đà Nẵng', 'pickup'),
(3, N'Văn phòng Quận Sơn Trà', N'Đường Ngô Quyền, Sơn Trà, Đà Nẵng', 'dropoff'),

-- Hải Phòng
(4, N'Bến xe Hải Phòng', N'Đường Lạch Tray, Ngô Quyền, Hải Phòng', 'pickup'),
(4, N'Văn phòng Quận Hồng Bàng', N'Đường Minh Khai, Hồng Bàng, Hải Phòng', 'dropoff'),

-- Cần Thơ
(5, N'Bến xe Cần Thơ', N'Đường 3/2, Ninh Kiều, Cần Thơ', 'pickup'),
(5, N'Văn phòng Quận Ninh Kiều', N'Đường Nguyễn Trãi, Ninh Kiều, Cần Thơ', 'dropoff');

PRINT 'Stops inserted successfully!';

-- ========================================
-- 3. BUS TYPES (LOẠI XE)
-- ========================================
INSERT INTO bus_types (name, description) VALUES
(N'Ghế ngồi', N'Xe ghế ngồi thông thường, điều hòa'),
(N'Giường nằm', N'Xe giường nằm 2 tầng, cao cấp'),
(N'Limousine', N'Xe limousine cao cấp, ít ghế'),
(N'Ghế VIP', N'Xe ghế VIP, rộng rãi, tiện nghi'),
(N'Xe giường đơn', N'Xe giường đơn, thoải mái'),
(N'Xe giường đôi', N'Xe giường đôi, tiết kiệm');

PRINT 'Bus types inserted successfully!';

-- ========================================
-- 4. BUSES (XE)
-- ========================================
INSERT INTO buses (license_plate, seat_count, bus_type_id, description, is_active) VALUES 
-- Ghế ngồi
('29B-12345', 40, 1, N'Xe đời mới, điều hòa, wifi', 1),
('29B-12346', 45, 1, N'Xe cao cấp, điều hòa, wifi, ổ cắm', 1),
('29B-12347', 35, 1, N'Xe thông thường, điều hòa', 1),

-- Giường nằm
('51B-67890', 34, 2, N'Xe giường nằm cao cấp, 2 tầng', 1),
('51B-67891', 38, 2, N'Xe giường nằm thông thường', 1),
('51B-67892', 32, 2, N'Xe giường nằm VIP', 1),

-- Limousine
('30B-11111', 16, 3, N'Xe limousine cao cấp, ít ghế', 1),
('30B-11112', 20, 3, N'Xe limousine thương hiệu', 1),

-- Ghế VIP
('92B-22222', 25, 4, N'Xe ghế VIP, rộng rãi', 1),
('92B-22223', 30, 4, N'Xe ghế VIP cao cấp', 1),

-- Giường đơn
('95B-33333', 28, 5, N'Xe giường đơn, thoải mái', 1),
('95B-33334', 32, 5, N'Xe giường đơn cao cấp', 1),

-- Giường đôi
('83B-44444', 40, 6, N'Xe giường đôi, tiết kiệm', 1),
('83B-44445', 36, 6, N'Xe giường đôi thông thường', 1);

PRINT 'Buses inserted successfully!';

-- ========================================
-- 5. DRIVERS (TÀI XẾ)
-- ========================================
INSERT INTO drivers (full_name, phone_number, license_number, hire_date, is_active) VALUES 
(N'Lê Văn Tài', '0901234567', 'GPLX123456', '2021-03-15', 1),
(N'Phạm Minh Tuấn', '0937654321', 'GPLX789012', '2022-07-01', 1),
(N'Nguyễn Văn Hùng', '0912345678', 'GPLX345678', '2020-11-20', 1),
(N'Trần Thị Lan', '0987654321', 'GPLX901234', '2023-01-10', 1),
(N'Hoàng Văn Nam', '0976543210', 'GPLX567890', '2021-09-05', 1),
(N'Vũ Thị Hoa', '0965432109', 'GPLX234567', '2022-12-15', 1),
(N'Đỗ Văn Sơn', '0954321098', 'GPLX890123', '2020-06-30', 1),
(N'Lý Thị Mai', '0943210987', 'GPLX456789', '2023-03-22', 1),
(N'Bùi Văn Dũng', '0932109876', 'GPLX012345', '2021-12-08', 1),
(N'Đặng Thị Nga', '0921098765', 'GPLX678901', '2022-05-14', 1);

PRINT 'Drivers inserted successfully!';

-- ========================================
-- 6. ROUTES (TUYẾN ĐƯỜNG)
-- ========================================
INSERT INTO routes (departure_province_id, arrival_province_id, distance_km, estimated_time, is_active) VALUES 
-- Hà Nội - Hồ Chí Minh
(1, 2, 1720, 1800, 1),
(2, 1, 1720, 1800, 1),

-- Hà Nội - Đà Nẵng
(1, 3, 780, 900, 1),
(3, 1, 780, 900, 1),

-- Hà Nội - Hải Phòng
(1, 4, 120, 150, 1),
(4, 1, 120, 150, 1),

-- Hồ Chí Minh - Đà Nẵng
(2, 3, 940, 1200, 1),
(3, 2, 940, 1200, 1),

-- Hồ Chí Minh - Cần Thơ
(2, 5, 170, 240, 1),
(5, 2, 170, 240, 1),

-- Hồ Chí Minh - An Giang
(2, 6, 250, 300, 1),
(6, 2, 250, 300, 1),

-- Hồ Chí Minh - Bà Rịa - Vũng Tàu
(2, 7, 125, 180, 1),
(7, 2, 125, 180, 1),

-- Hồ Chí Minh - Bình Dương
(2, 8, 30, 60, 1),
(8, 2, 30, 60, 1),

-- Đà Nẵng - Quảng Nam
(3, 25, 60, 90, 1),
(25, 3, 60, 90, 1),

-- Đà Nẵng - Thừa Thiên Huế
(3, 30, 100, 120, 1),
(30, 3, 100, 120, 1),

-- Hà Nội - Nghệ An
(1, 22, 300, 360, 1),
(22, 1, 300, 360, 1),

-- Hồ Chí Minh - Khánh Hòa
(2, 18, 450, 540, 1),
(18, 2, 450, 540, 1),

-- Hồ Chí Minh - Lâm Đồng
(2, 20, 320, 420, 1),
(20, 2, 320, 420, 1);

PRINT 'Routes inserted successfully!';

-- ========================================
-- 7. STAFF ACCOUNTS (TÀI KHOẢN NHÂN VIÊN) - ĐƯA LÊN TRƯỚC
-- ========================================
INSERT INTO staff_accounts (full_name, username, password_hash, role, is_active, created_at) VALUES 
(N'Quản trị viên hệ thống', 'admin', 'admin_hashed_password', 'admin', 1, DATEADD(DAY, -100, GETDATE())),
(N'Quản lý vận hành', 'manager', 'manager_hashed_password', 'manager', 1, DATEADD(DAY, -90, GETDATE())),
(N'Nhân viên hỗ trợ 1', 'support1', 'support1_hashed_password', 'support', 1, DATEADD(DAY, -80, GETDATE())),
(N'Nhân viên hỗ trợ 2', 'support2', 'support2_hashed_password', 'support', 1, DATEADD(DAY, -70, GETDATE())),
(N'Nhân viên xem báo cáo', 'viewer1', 'viewer1_hashed_password', 'viewer', 1, DATEADD(DAY, -60, GETDATE())),
(N'Quản lý tài chính', 'finance', 'finance_hashed_password', 'manager', 1, DATEADD(DAY, -50, GETDATE())),
(N'Nhân viên bán vé', 'ticket1', 'ticket1_hashed_password', 'support', 1, DATEADD(DAY, -40, GETDATE())),
(N'Nhân viên bán vé 2', 'ticket2', 'ticket2_hashed_password', 'support', 1, DATEADD(DAY, -30, GETDATE()));

PRINT 'Staff accounts inserted successfully!';

-- ========================================
-- 8. SCHEDULE PATTERNS (MẪU LỊCH TRÌNH TỰ ĐỘNG)
-- ========================================
INSERT INTO schedule_patterns (name, description, route_id, bus_type_id, departure_times, days_of_week, base_price, is_active) VALUES 
-- Hà Nội - Hồ Chí Minh (Ghế ngồi)
(N'Hà Nội - HCM (Ghế ngồi)', N'Lịch trình hàng ngày Hà Nội - HCM bằng xe ghế ngồi', 1, 1, '["06:00", "08:00", "10:00", "14:00", "16:00", "18:00"]', '1,2,3,4,5,6,7', 350000, 1),

-- Hồ Chí Minh - Hà Nội (Ghế ngồi)
(N'HCM - Hà Nội (Ghế ngồi)', N'Lịch trình hàng ngày HCM - Hà Nội bằng xe ghế ngồi', 2, 1, '["06:00", "08:00", "10:00", "14:00", "16:00", "18:00"]', '1,2,3,4,5,6,7', 350000, 1),

-- Hà Nội - Đà Nẵng (Ghế ngồi)
(N'Hà Nội - Đà Nẵng (Ghế ngồi)', N'Lịch trình hàng ngày Hà Nội - Đà Nẵng bằng xe ghế ngồi', 3, 1, '["07:00", "09:00", "11:00", "15:00", "17:00"]', '1,2,3,4,5,6,7', 180000, 1),

-- Hồ Chí Minh - Đà Nẵng (Giường nằm)
(N'HCM - Đà Nẵng (Giường nằm)', N'Lịch trình hàng ngày HCM - Đà Nẵng bằng xe giường nằm', 7, 2, '["19:00", "21:00"]', '1,2,3,4,5,6,7', 220000, 1),

-- Hồ Chí Minh - Cần Thơ (Ghế ngồi)
(N'HCM - Cần Thơ (Ghế ngồi)', N'Lịch trình hàng ngày HCM - Cần Thơ bằng xe ghế ngồi', 9, 1, '["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00"]', '1,2,3,4,5,6,7', 120000, 1),

-- Hà Nội - Hải Phòng (Ghế ngồi)
(N'Hà Nội - Hải Phòng (Ghế ngồi)', N'Lịch trình hàng ngày Hà Nội - Hải Phòng bằng xe ghế ngồi', 5, 1, '["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]', '1,2,3,4,5,6,7', 80000, 1),

-- Hồ Chí Minh - Bà Rịa Vũng Tàu (Limousine)
(N'HCM - Vũng Tàu (Limousine)', N'Lịch trình hàng ngày HCM - Vũng Tàu bằng xe limousine', 13, 3, '["07:00", "09:00", "11:00", "13:00", "15:00", "17:00"]', '1,2,3,4,5,6,7', 150000, 1),

-- Hồ Chí Minh - Lâm Đồng (Ghế VIP)
(N'HCM - Lâm Đồng (Ghế VIP)', N'Lịch trình hàng ngày HCM - Lâm Đồng bằng xe ghế VIP', 15, 4, '["07:00", "09:00", "11:00", "13:00", "15:00"]', '1,2,3,4,5,6,7', 200000, 1);

PRINT 'Schedule patterns inserted successfully!';

-- ========================================
-- 9. SCHEDULES (LỊCH TRÌNH)
-- ========================================
-- Tạo lịch trình cho tháng hiện tại và các tháng tiếp theo
DECLARE @CurrentDate DATETIME  = GETDATE();
DECLARE @StartDate DATETIME  = DATEADD(MONTH, DATEDIFF(MONTH, 0, @CurrentDate), 0); -- Đầu tháng hiện tại
DECLARE @EndDate DATETIME  = DATEADD(MONTH, 6, @CurrentDate); -- 6 tháng tới

-- Hà Nội - Hồ Chí Minh (Route 1) - Auto-generated
INSERT INTO schedules (bus_id, route_id, driver_id, departure_time, price, status, is_auto_generated, pattern_id) VALUES 
(1, 1, 1, DATEADD(MINUTE, 390, DATEADD(DAY, 1, @StartDate)), 350000, 'scheduled', 1, 1),
(2, 1, 2, DATEADD(MINUTE, 480, DATEADD(DAY, 1, @StartDate)), 350000, 'scheduled', 1, 1),
(3, 1, 3, DATEADD(MINUTE, 600, DATEADD(DAY, 1, @StartDate)), 350000, 'scheduled', 1, 1),
(4, 1, 4, DATEADD(MINUTE, 840, DATEADD(DAY, 1, @StartDate)), 350000, 'scheduled', 1, 1),
(5, 1, 5, DATEADD(MINUTE, 960, DATEADD(DAY, 1, @StartDate)), 350000, 'scheduled', 1, 1),
(6, 1, 6, DATEADD(MINUTE, 1080, DATEADD(DAY, 1, @StartDate)), 350000, 'scheduled', 1, 1);

-- Hồ Chí Minh - Hà Nội (Route 2) - Auto-generated
INSERT INTO schedules (bus_id, route_id, driver_id, departure_time, price, status, is_auto_generated, pattern_id) VALUES 
(7, 2, 7, DATEADD(MINUTE, 360, DATEADD(DAY, 1, @StartDate)), 350000, 'scheduled', 1, 2),
(8, 2, 8, DATEADD(MINUTE, 480, DATEADD(DAY, 1, @StartDate)), 350000, 'scheduled', 1, 2),
(9, 2, 9, DATEADD(MINUTE, 600, DATEADD(DAY, 1, @StartDate)), 350000, 'scheduled', 1, 2),
(10, 2, 10, DATEADD(MINUTE, 840, DATEADD(DAY, 1, @StartDate)), 350000, 'scheduled', 1, 2),
(11, 2, 1, DATEADD(MINUTE, 960, DATEADD(DAY, 1, @StartDate)), 350000, 'scheduled', 1, 2),
(12, 2, 2, DATEADD(MINUTE, 1080, DATEADD(DAY, 1, @StartDate)), 350000, 'scheduled', 1, 2);

-- Hà Nội - Đà Nẵng (Route 3) - Auto-generated
INSERT INTO schedules (bus_id, route_id, driver_id, departure_time, price, status, is_auto_generated, pattern_id) VALUES 
(1, 3, 3, DATEADD(MINUTE, 420, DATEADD(DAY, 1, @StartDate)), 180000, 'scheduled', 1, 3),
(2, 3, 4, DATEADD(MINUTE, 540, DATEADD(DAY, 1, @StartDate)), 180000, 'scheduled', 1, 3),
(3, 3, 5, DATEADD(MINUTE, 660, DATEADD(DAY, 1, @StartDate)), 180000, 'scheduled', 1, 3),
(4, 3, 6, DATEADD(MINUTE, 900, DATEADD(DAY, 1, @StartDate)), 180000, 'scheduled', 1, 3),
(5, 3, 7, DATEADD(MINUTE, 1020, DATEADD(DAY, 1, @StartDate)), 180000, 'scheduled', 1, 3);

-- Hồ Chí Minh - Đà Nẵng (Route 7) - Auto-generated (Giường nằm)
INSERT INTO schedules (bus_id, route_id, driver_id, departure_time, price, status, is_auto_generated, pattern_id) VALUES 
(6, 7, 8, DATEADD(MINUTE, 1140, DATEADD(DAY, 1, @StartDate)), 220000, 'scheduled', 1, 4),
(7, 7, 9, DATEADD(MINUTE, 1260, DATEADD(DAY, 1, @StartDate)), 220000, 'scheduled', 1, 4);

-- Hồ Chí Minh - Cần Thơ (Route 9) - Auto-generated
INSERT INTO schedules (bus_id, route_id, driver_id, departure_time, price, status, is_auto_generated, pattern_id) VALUES 
(8, 9, 10, DATEADD(MINUTE, 360, DATEADD(DAY, 1, @StartDate)), 120000, 'scheduled', 1, 5),
(9, 9, 1, DATEADD(MINUTE, 480, DATEADD(DAY, 1, @StartDate)), 120000, 'scheduled', 1, 5),
(10, 9, 2, DATEADD(MINUTE, 600, DATEADD(DAY, 1, @StartDate)), 120000, 'scheduled', 1, 5),
(11, 9, 3, DATEADD(MINUTE, 720, DATEADD(DAY, 1, @StartDate)), 120000, 'scheduled', 1, 5),
(12, 9, 4, DATEADD(MINUTE, 840, DATEADD(DAY, 1, @StartDate)), 120000, 'scheduled', 1, 5),
(1, 9, 5, DATEADD(MINUTE, 960, DATEADD(DAY, 1, @StartDate)), 120000, 'scheduled', 1, 5),
(2, 9, 6, DATEADD(MINUTE, 1080, DATEADD(DAY, 1, @StartDate)), 120000, 'scheduled', 1, 5);

PRINT 'Schedules inserted successfully!';

-- ========================================
-- 10. SCHEDULE MANAGEMENT (QUẢN LÝ LỊCH TRÌNH)
-- ========================================
-- Tạo schedule management cho tất cả lịch trình
INSERT INTO schedule_management (schedule_id, is_enabled, is_seat_enabled, admin_note, modified_by)
SELECT 
    s.id,
    1, -- is_enabled
    1, -- is_seat_enabled
    CASE 
        WHEN s.is_auto_generated = 1 THEN N'Lịch trình tự động tạo từ pattern'
        ELSE N'Lịch trình thủ công'
    END,
    1 -- modified_by (admin)
FROM schedules s;

PRINT 'Schedule management inserted successfully!';

-- ========================================
-- 11. SEATS (GHẾ)
-- ========================================
-- Tạo ghế cho tất cả lịch trình
DECLARE @ScheduleId INT;
DECLARE @SeatCount INT;
DECLARE @SeatNumber NVARCHAR(10);
DECLARE @Floor NVARCHAR(10);

DECLARE schedule_cursor CURSOR FOR 
SELECT s.id, b.seat_count 
FROM schedules s 
JOIN buses b ON s.bus_id = b.id;

OPEN schedule_cursor;
FETCH NEXT FROM schedule_cursor INTO @ScheduleId, @SeatCount;

WHILE @@FETCH_STATUS = 0
BEGIN
    -- Tạo ghế cho mỗi lịch trình
    DECLARE @i INT = 1;
    WHILE @i <= @SeatCount
    BEGIN
        -- Xác định tầng (floor) dựa trên loại xe
        SELECT @Floor = 
            CASE bt.name
                WHEN N'Giường nằm' THEN 
                    CASE 
                        WHEN @i <= @SeatCount/2 THEN N'lower'
                        ELSE N'upper'
                    END
                WHEN N'Limousine' THEN N'lower'
                WHEN N'Ghế VIP' THEN N'lower'
                ELSE N'lower'
            END
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        JOIN bus_types bt ON b.bus_type_id = bt.id
        WHERE s.id = @ScheduleId;
        
        SET @SeatNumber = CAST(@i AS NVARCHAR(10));
        
        INSERT INTO seats (schedule_id, seat_number, status, floor, is_enabled) VALUES 
        (@ScheduleId, @SeatNumber, 'available', @Floor, 1);
        
        SET @i = @i + 1;
    END;
    
    FETCH NEXT FROM schedule_cursor INTO @ScheduleId, @SeatCount;
END;

CLOSE schedule_cursor;
DEALLOCATE schedule_cursor;

PRINT 'Seats inserted successfully!';

-- ========================================
-- 12. USERS (NGƯỜI DÙNG)
-- ========================================
INSERT INTO users (full_name, email, phone_number, password_hash, created_at) VALUES 
(N'Nguyễn Văn An', 'an1.nguyen@email.com', '0901234567', 'hashed_password_1', DATEADD(DAY, -30, GETDATE())),
(N'Trần Thị Bình', 'binh.tran@email.com', '0912345678', 'hashed_password_2', DATEADD(DAY, -25, GETDATE())),
(N'Lê Văn Cường', 'cuong.le@email.com', '0923456789', 'hashed_password_3', DATEADD(DAY, -20, GETDATE())),
(N'Phạm Thị Dung', 'dung.pham@email.com', '0934567890', 'hashed_password_4', DATEADD(DAY, -15, GETDATE())),
(N'Hoàng Văn Em', 'em.hoang@email.com', '0945678901', 'hashed_password_5', DATEADD(DAY, -10, GETDATE())),
(N'Vũ Thị Phương', 'phuong.vu@email.com', '0956789012', 'hashed_password_6', DATEADD(DAY, -5, GETDATE())),
(N'Đỗ Văn Giang', 'giang.do@email.com', '0967890123', 'hashed_password_7', DATEADD(DAY, -3, GETDATE())),
(N'Lý Thị Hoa', 'hoa.ly@email.com', '0978901234', 'hashed_password_8', DATEADD(DAY, -2, GETDATE())),
(N'Bùi Văn Inh', 'inh.bui@email.com', '0989012345', 'hashed_password_9', DATEADD(DAY, -1, GETDATE())),
(N'Đặng Thị Kim', 'kim.dang@email.com', '0990123456', 'hashed_password_10', GETDATE());

PRINT 'Users inserted successfully!';

-- ========================================
-- 13. BOOKINGS (ĐƠN ĐẶT VÉ) - Một số đơn mẫu
-- ========================================
INSERT INTO bookings (user_id, schedule_id, total_price, status, booked_at, payment_method, pickup_stop_id, dropoff_stop_id) VALUES 
(1, 1, 350000, 'paid', DATEADD(DAY, -5, GETDATE()), 'momo', 1, 9),
(2, 2, 350000, 'paid', DATEADD(DAY, -4, GETDATE()), 'zalo_pay', 1, 9),
(3, 3, 350000, 'pending', DATEADD(DAY, -3, GETDATE()), 'bank_transfer', 1, 9),
(4, 4, 350000, 'paid', DATEADD(DAY, -2, GETDATE()), 'cash', 1, 9),
(5, 5, 350000, 'cancelled', DATEADD(DAY, -1, GETDATE()), 'momo', 1, 9),
(6, 6, 350000, 'paid', GETDATE(), 'zalo_pay', 6, 4),
(7, 7, 350000, 'pending', GETDATE(), 'bank_transfer', 6, 4),
(8, 8, 350000, 'paid', GETDATE(), 'cash', 6, 4);

PRINT 'Bookings inserted successfully!';

-- Lấy booking IDs để sử dụng trong payments
DECLARE @Booking1 INT = (SELECT id FROM bookings WHERE user_id = 1 AND schedule_id = 1);
DECLARE @Booking2 INT = (SELECT id FROM bookings WHERE user_id = 2 AND schedule_id = 2);
DECLARE @Booking4 INT = (SELECT id FROM bookings WHERE user_id = 4 AND schedule_id = 4);
DECLARE @Booking6 INT = (SELECT id FROM bookings WHERE user_id = 6 AND schedule_id = 6);
DECLARE @Booking8 INT = (SELECT id FROM bookings WHERE user_id = 8 AND schedule_id = 8);

-- ========================================
-- 14. BOOKING_SEATS (GHẾ CỦA ĐƠN ĐẶT)
-- ========================================
-- Lấy một số ghế đã được đặt
INSERT INTO booking_seats (booking_id, seat_id, price, created_at, pickup_stop_id, dropoff_stop_id) VALUES 
(@Booking1, 1, 350000, DATEADD(DAY, -5, GETDATE()), 1, 9),
(@Booking1, 2, 350000, DATEADD(DAY, -5, GETDATE()), 1, 9),
(@Booking2, 15, 350000, DATEADD(DAY, -4, GETDATE()), 1, 9),
(3, 25, 350000, DATEADD(DAY, -3, GETDATE()), 1, 9),
(@Booking4, 35, 350000, DATEADD(DAY, -2, GETDATE()), 1, 9),
(@Booking6, 120, 350000, GETDATE(), 6, 4),
(7, 130, 350000, GETDATE(), 6, 4),
(@Booking8, 140, 350000, GETDATE(), 6, 4);

-- Cập nhật trạng thái ghế đã được đặt
UPDATE seats SET status = 'booked' WHERE id IN (1, 2, 15, 25, 35, 120, 130, 140);

PRINT 'Booking seats inserted successfully!';

-- ========================================
-- 15. PAYMENTS (THANH TOÁN)
-- ========================================
INSERT INTO payments (booking_id, provider, amount, status, payment_time) VALUES 
(@Booking1, 'momo', 350000, 'success', DATEADD(DAY, -5, GETDATE())),
(@Booking2, 'zalo_pay', 350000, 'success', DATEADD(DAY, -4, GETDATE())),
(@Booking4, 'cash', 350000, 'success', DATEADD(DAY, -2, GETDATE())),
(@Booking6, 'zalo_pay', 350000, 'success', GETDATE()),
(@Booking8, 'cash', 350000, 'success', GETDATE());

PRINT 'Payments inserted successfully!';

-- ========================================
-- 16. FEEDBACKS (PHẢN HỒI)
-- ========================================
INSERT INTO feedbacks (user_id, booking_id, rating, comment, created_at) VALUES 
(1, @Booking1, 5, N'Chuyến đi rất tốt, tài xế thân thiện, xe sạch sẽ', DATEADD(DAY, -3, GETDATE())),
(2, @Booking2, 4, N'Chuyến đi ổn, nhưng hơi muộn 15 phút', DATEADD(DAY, -2, GETDATE())),
(4, @Booking4, 5, N'Dịch vụ tuyệt vời, sẽ sử dụng lại', DATEADD(DAY, -1, GETDATE())),
(6, @Booking6, 4, N'Xe đẹp, điều hòa mát, nhưng wifi hơi chậm', GETDATE());
