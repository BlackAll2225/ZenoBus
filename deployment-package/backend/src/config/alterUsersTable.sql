-- -- Sửa cấu trúc bảng users
-- ALTER TABLE users
-- ALTER COLUMN full_name NVARCHAR(100) NOT NULL;

-- ALTER TABLE users
-- ALTER COLUMN email NVARCHAR(100) NOT NULL;

-- ALTER TABLE users
-- ALTER COLUMN phone_number NVARCHAR(20) NOT NULL;

-- ALTER TABLE users
-- ALTER COLUMN password_hash NVARCHAR(255) NOT NULL;

-- -- Thêm default value cho created_at nếu chưa có
-- IF NOT EXISTS (
--     SELECT 1 
--     FROM sys.default_constraints 
--     WHERE parent_object_id = OBJECT_ID('users')
--     AND name = 'DF_users_created_at'
-- )
-- BEGIN
--     ALTER TABLE users
--     ADD CONSTRAINT DF_users_created_at DEFAULT GETDATE() FOR created_at;
-- END

-- -- Đảm bảo created_at là NOT NULL
-- ALTER TABLE users
-- ALTER COLUMN created_at DATETIME NOT NULL;

-- -- Add payment-related columns to bookings table
-- ALTER TABLE bookings 
-- ADD payment_request_id NVARCHAR(100) NULL,
-- ADD payment_url NVARCHAR(500) NULL,
-- ADD order_code NVARCHAR(100) NULL,
-- ADD payment_status NVARCHAR(50) DEFAULT 'pending',
-- ADD payment_completed_at DATETIME NULL;

-- -- Add index for order_code for faster lookups
-- CREATE INDEX IX_bookings_order_code ON bookings(order_code);

-- -- Add index for payment_request_id
-- CREATE INDEX IX_bookings_payment_request_id ON bookings(payment_request_id); 