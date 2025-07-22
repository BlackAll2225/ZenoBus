# Timezone Strategy - Putiee Project

## 📅 Overview

This document outlines the timezone handling strategy for the Putiee bus ticket booking system to ensure consistent date/time handling between backend and frontend.

## 🎯 Goals

- **Consistency**: All time data stored and transmitted in UTC
- **User Experience**: Display times in Vietnam timezone (UTC+7) 
- **Data Integrity**: No timezone-related bugs or data corruption
- **Maintainability**: Clear conventions for developers

## 🏗️ Architecture

```
┌─────────────────┐    UTC     ┌──────────────────┐    UTC     ┌─────────────────┐
│    Frontend     │ ◄──────── │     Backend      │ ◄──────── │    Database     │
│   (VN Display)  │  Convert  │  (UTC Storage)   │   Store   │  (UTC Storage)  │
└─────────────────┘    to VN   └──────────────────┘    UTC    └─────────────────┘
```

## 🔧 Implementation

### Backend (BE)

#### 1. Server Configuration
```javascript
// src/server.js
process.env.TZ = 'UTC';
```

#### 2. Date Storage
- **Always store UTC in database**
- **Convert VN time inputs to UTC before saving**
- **Return UTC in API responses**

#### 3. Date Conversion Examples
```javascript
// Converting VN time input to UTC for storage
const vnTimeInput = '2025-01-15T14:30:00'; // 2:30 PM VN time
const utcTime = new Date(new Date(vnTimeInput).getTime() - (7 * 60 * 60 * 1000));

// Date filtering - convert VN date range to UTC
const startOfDayUTC = new Date(startOfDay.getTime() - (7 * 60 * 60 * 1000));
const endOfDayUTC = new Date(endOfDay.getTime() - (7 * 60 * 60 * 1000));
```

#### 4. Modified Services
- `scheduleService.js` - Convert VN departure times to UTC
- `bookingService.js` - Convert date filters to UTC
- `userService.js` - Convert date filters to UTC
- `feedbackService.js` - Convert date filters to UTC
- `statisticsService.js` - Use UTC with proper timezone display

### Frontend (FE)

#### 1. Utility Functions
```typescript
// src/lib/dateUtils.ts

// Convert UTC from API to VN time for display
export const convertUTCToVNTime = (utcDateString: string): Date => {
  const utcDate = new Date(utcDateString);
  return new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
};

// Convert VN time to UTC for sending to API
export const convertVNTimeToUTC = (vnDate: Date): Date => {
  return new Date(vnDate.getTime() - (7 * 60 * 60 * 1000));
};
```

#### 2. Configuration
```typescript
// src/lib/config.ts
export const TIMEZONE_CONFIG = {
  SERVER_TIMEZONE: 'UTC',
  APP_TIMEZONE: 'Asia/Ho_Chi_Minh',
  TIMEZONE_OFFSET_HOURS: 7,
  LOCALE: 'vi-VN'
};
```

#### 3. Component Usage
```typescript
// Instead of: new Date(dateString).toLocaleDateString('vi-VN')
// Use: formatShortDate(dateString) // Handles UTC to VN conversion
```

## 📋 Rules & Conventions

### Backend Rules
1. ✅ **Always set** `process.env.TZ = 'UTC'`
2. ✅ **Store all timestamps in UTC** in database
3. ✅ **Convert VN input to UTC** before database operations
4. ✅ **Return UTC timestamps** in API responses
5. ✅ **Use UTC for date filtering** and queries

### Frontend Rules
1. ✅ **Convert UTC to VN time** for display
2. ✅ **Convert VN time to UTC** before sending to API
3. ✅ **Use dateUtils functions** instead of direct Date operations
4. ✅ **Display times in Vietnamese locale** with proper timezone
5. ✅ **Handle timezone in user inputs** (datetime pickers, filters)

### Database Rules
1. ✅ **All datetime columns store UTC**
2. ✅ **Use DATETIME or TIMESTAMP types**
3. ✅ **No timezone-specific columns** (let app handle conversion)

## 🧪 Testing

### Backend Testing
```bash
node test-timezone.js
```
Verifies:
- Server timezone is UTC
- Date conversion logic
- Database storage simulation
- API response format

### Frontend Testing
```bash
open test-timezone.html
```
Verifies:
- UTC to VN conversion
- VN to UTC conversion
- Date formatting
- API response handling

## 🚨 Common Pitfalls to Avoid

### ❌ DON'T DO
```javascript
// Backend - DON'T store local time
const departureTime = new Date(); // Stores in server local time

// Frontend - DON'T use raw Date() for display
const displayTime = new Date(apiResponse.departureTime).toLocaleString();

// DON'T mix timezone approaches
const sometimes_utc = new Date().toISOString();
const sometimes_local = new Date().toString();
```

### ✅ DO THIS
```javascript
// Backend - Store UTC
const departureTime = new Date(); // Server is UTC, so this is UTC

// Frontend - Convert for display
const displayTime = formatTimeFromUTC(apiResponse.departureTime);

// Consistent timezone handling
const alwaysUTC = new Date().toISOString(); // Backend
const alwaysConverted = convertUTCToVNTime(utcString); // Frontend
```

## 📝 Migration Checklist

- [x] ✅ Backend timezone audit completed
- [x] ✅ Frontend timezone audit completed
- [x] ✅ Database storage check completed
- [x] ✅ API response format verified
- [x] ✅ Backend standardization implemented
- [x] ✅ Frontend utility functions created
- [x] ✅ Configuration files added
- [x] ✅ Test scenarios created
- [x] ✅ Documentation completed

## 🔍 Verification

### Expected Behavior
1. **Database**: All timestamps in UTC
2. **API Responses**: All timestamps in UTC ISO format
3. **Frontend Display**: All times shown in VN timezone (UTC+7)
4. **User Input**: VN times converted to UTC before API calls
5. **Filtering**: Date ranges converted to UTC for accurate database queries

### Test Scenarios
- ✅ Schedule creation: VN time → UTC storage
- ✅ Schedule display: UTC → VN time display  
- ✅ Date filtering: VN date range → UTC query range
- ✅ Booking timestamps: UTC storage and VN display
- ✅ User registration: UTC createdAt, VN display

## 📞 Support

For questions about timezone handling:
1. Check this documentation first
2. Run test scripts to verify behavior
3. Review `dateUtils.ts` for available functions
4. Ensure configuration is properly set

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: ✅ Implemented 