/**
 * Test script to verify timezone handling in backend
 * Run: node test-timezone.js
 */

// Set timezone to UTC like in server.js
process.env.TZ = 'UTC';

console.log('=== TIMEZONE TEST SCRIPT ===\n');

// Test 1: Server timezone
console.log('1. Server Timezone Check:');
console.log('   process.env.TZ:', process.env.TZ);
console.log('   Date.now() timezone:', new Date().getTimezoneOffset(), 'minutes offset');
console.log('   Current UTC time:', new Date().toISOString());
console.log('   Current server local time:', new Date().toString());
console.log();

// Test 2: Date creation scenarios
console.log('2. Date Creation Scenarios:');

// VN time input: 2025-01-15 14:30:00 (2:30 PM VN time)
const vnTimeString = '2025-01-15T14:30:00';
console.log('   VN Time Input:', vnTimeString);

// Method 1: new Date() - interprets as local timezone
const date1 = new Date(vnTimeString);
console.log('   new Date(vnTimeString):', date1.toISOString(), '(interpreted as UTC)');

// Method 2: Manual parsing with UTC conversion (like our scheduleService fix)
const match = vnTimeString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
if (match) {
  const [, year, month, day, hour, minute, second] = match;
  // Convert VN time to UTC by subtracting 7 hours
  const utcDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour) - 7, parseInt(minute), parseInt(second)));
  console.log('   Manual UTC conversion:', utcDate.toISOString(), '(VN time converted to UTC)');
}
console.log();

// Test 3: Date filtering scenarios
console.log('3. Date Filtering Scenarios:');

const filterDate = '2025-01-15'; // User picks this date in VN timezone
console.log('   Filter Date (VN):', filterDate);

// Start of day in VN time
const startOfDay = new Date(filterDate);
startOfDay.setHours(0, 0, 0, 0);
console.log('   Start of day (VN):', startOfDay.toISOString());

// Convert to UTC for database query
const startOfDayUTC = new Date(startOfDay.getTime() - (7 * 60 * 60 * 1000));
console.log('   Start of day (UTC):', startOfDayUTC.toISOString());

// End of day in VN time  
const endOfDay = new Date(filterDate);
endOfDay.setHours(23, 59, 59, 999);
console.log('   End of day (VN):', endOfDay.toISOString());

// Convert to UTC for database query
const endOfDayUTC = new Date(endOfDay.getTime() - (7 * 60 * 60 * 1000));
console.log('   End of day (UTC):', endOfDayUTC.toISOString());
console.log();

// Test 4: Database storage simulation
console.log('4. Database Storage Simulation:');

// Simulate saving a schedule with departure time
const departureTimeVN = '2025-01-15T14:30:00'; // 2:30 PM VN time
console.log('   Input (VN time):', departureTimeVN);

// Convert to UTC before saving to DB
const departureTimeUTC = new Date(new Date(departureTimeVN).getTime() - (7 * 60 * 60 * 1000));
console.log('   Stored in DB (UTC):', departureTimeUTC.toISOString());

// When API returns this data, it will be in UTC
console.log('   API Response (UTC):', departureTimeUTC.toISOString());

// Frontend should convert back to VN time for display
const displayTimeVN = new Date(departureTimeUTC.getTime() + (7 * 60 * 60 * 1000));
console.log('   Frontend Display (VN):', displayTimeVN.toISOString(), '-> Show as 14:30');
console.log();

// Test 5: Current timestamp scenarios
console.log('5. Current Timestamp Scenarios:');

const now = new Date();
console.log('   new Date() (UTC):', now.toISOString());
console.log('   For VN display add 7hrs:', new Date(now.getTime() + (7 * 60 * 60 * 1000)).toISOString());

// For createdAt, updatedAt fields
console.log('   createdAt/updatedAt should be:', now.toISOString());
console.log();

console.log('=== TEST COMPLETE ===');
console.log('✅ Backend should always store/return UTC times');
console.log('✅ Frontend should convert UTC to VN time for display');
console.log('✅ User inputs in VN time should be converted to UTC before sending to API'); 