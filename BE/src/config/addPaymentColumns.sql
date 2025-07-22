-- Add payment-related columns to bookings table (Step by step)
-- Step 1: Add payment_request_id column
ALTER TABLE bookings ADD payment_request_id NVARCHAR(100) NULL;
GO

-- Step 2: Add payment_url column  
ALTER TABLE bookings ADD payment_url NVARCHAR(500) NULL;
GO

-- Step 3: Add order_code column
ALTER TABLE bookings ADD order_code NVARCHAR(100) NULL;
GO

-- Step 4: Add payment_status column
ALTER TABLE bookings ADD payment_status NVARCHAR(50) DEFAULT 'pending';
GO

-- Step 5: Add payment_completed_at column
ALTER TABLE bookings ADD payment_completed_at DATETIME NULL;
GO

-- Step 6: Create index for order_code
CREATE INDEX IX_bookings_order_code ON bookings(order_code);
GO

-- Step 7: Create index for payment_request_id
CREATE INDEX IX_bookings_payment_request_id ON bookings(payment_request_id);
GO

PRINT 'All payment columns and indexes added successfully!'; 