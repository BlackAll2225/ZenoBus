-- Add payment-related columns to bookings table (Safe version)
-- Check and add payment_request_id column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'bookings' AND COLUMN_NAME = 'payment_request_id')
BEGIN
    ALTER TABLE bookings ADD payment_request_id NVARCHAR(100) NULL;
END

-- Check and add payment_url column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'bookings' AND COLUMN_NAME = 'payment_url')
BEGIN
    ALTER TABLE bookings ADD payment_url NVARCHAR(500) NULL;
END

-- Check and add order_code column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'bookings' AND COLUMN_NAME = 'order_code')
BEGIN
    ALTER TABLE bookings ADD order_code NVARCHAR(100) NULL;
END

-- Check and add payment_status column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'bookings' AND COLUMN_NAME = 'payment_status')
BEGIN
    ALTER TABLE bookings ADD payment_status NVARCHAR(50) DEFAULT 'pending';
END

-- Check and add payment_completed_at column
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'bookings' AND COLUMN_NAME = 'payment_completed_at')
BEGIN
    ALTER TABLE bookings ADD payment_completed_at DATETIME NULL;
END

-- Add indexes (only if they don't exist)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_bookings_order_code')
BEGIN
    CREATE INDEX IX_bookings_order_code ON bookings(order_code);
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_bookings_payment_request_id')
BEGIN
    CREATE INDEX IX_bookings_payment_request_id ON bookings(payment_request_id);
END

PRINT 'Payment columns added successfully!'; 