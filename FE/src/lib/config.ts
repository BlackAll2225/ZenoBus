/**
 * Application Configuration
 */

// Timezone Configuration
export const TIMEZONE_CONFIG = {
  // Server timezone (UTC)
  SERVER_TIMEZONE: 'UTC',
  
  // Application display timezone (Vietnam)
  APP_TIMEZONE: 'Asia/Ho_Chi_Minh',
  
  // Offset hours (Vietnam is UTC+7)
  TIMEZONE_OFFSET_HOURS: 7,
  
  // Locale for date formatting
  LOCALE: 'vi-VN',
  
  // Date format patterns
  DATE_FORMATS: {
    SHORT_DATE: 'dd/MM/yyyy',
    LONG_DATE: 'EEEE, dd/MM/yyyy', 
    TIME: 'HH:mm',
    DATETIME: 'dd/MM/yyyy HH:mm',
    FULL_DATETIME: 'dd/MM/yyyy HH:mm:ss'
  }
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://14.225.255.72:5000/api',
  TIMEOUT: 10000
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'ZentroBus',
  VERSION: '1.0.0',
  TIMEZONE: TIMEZONE_CONFIG.APP_TIMEZONE,
  LOCALE: TIMEZONE_CONFIG.LOCALE
}; 