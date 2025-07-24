import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TIMEZONE_CONFIG } from './config';

/**
 * Convert UTC date from API to Vietnam timezone for display
 * @param utcDateString - UTC date string from API
 * @returns Date object adjusted to Vietnam timezone (UTC+7)
 */
export const convertUTCToVNTime = (utcDateString: string): Date => {
  if (!utcDateString) return new Date();
  
  try {
    const utcDate = new Date(utcDateString);
    // Add timezone offset hours to convert UTC to Vietnam time
    return new Date(utcDate.getTime() + (TIMEZONE_CONFIG.TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000));
  } catch (error) {
    console.error('Error converting UTC to VN time:', error);
    return new Date();
  }
};

/**
 * Convert Vietnam time to UTC for sending to API
 * @param vnDate - Date object in Vietnam timezone
 * @returns Date object in UTC
 */
export const convertVNTimeToUTC = (vnDate: Date): Date => {
  // Subtract timezone offset hours to convert Vietnam time to UTC
  return new Date(vnDate.getTime() - (TIMEZONE_CONFIG.TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000));
};

/**
 * Convert Vietnam datetime input to UTC ISO string for API
 * @param vnDateTimeString - DateTime string in Vietnam timezone (YYYY-MM-DDTHH:mm format)
 * @returns UTC ISO string for API submission
 */
export const convertVNDateTimeToUTCString = (vnDateTimeString: string): string => {
  if (!vnDateTimeString) return '';
  
  try {
    // Parse the datetime string as if it's in Vietnam timezone
    const vnDate = new Date(vnDateTimeString);
    // Convert to UTC
    const utcDate = convertVNTimeToUTC(vnDate);
    // Return ISO string (which is always in UTC)
    return utcDate.toISOString();
  } catch (error) {
    console.error('Error converting VN datetime to UTC string:', error);
    return '';
  }
};

/**
 * Convert UTC ISO string to Vietnam datetime input format
 * @param utcISOString - UTC ISO string from API
 * @returns DateTime string in YYYY-MM-DDTHH:mm format (Vietnam timezone) for form inputs
 */
export const convertUTCStringToVNDateTime = (utcISOString: string): string => {
  if (!utcISOString) return '';
  
  try {
    const vnDate = convertUTCToVNTime(utcISOString);
    // Format for datetime-local input: YYYY-MM-DDTHH:mm
    const year = vnDate.getFullYear();
    const month = String(vnDate.getMonth() + 1).padStart(2, '0');
    const day = String(vnDate.getDate()).padStart(2, '0');
    const hours = String(vnDate.getHours()).padStart(2, '0');
    const minutes = String(vnDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error converting UTC string to VN datetime:', error);
    return '';
  }
};

/**
 * Convert date input to UTC ISO date string for API
 * @param vnDateString - Date string in Vietnam timezone (YYYY-MM-DD format)
 * @returns UTC ISO date string for API submission
 */
export const convertVNDateToUTCString = (vnDateString: string): string => {
  if (!vnDateString) return '';
  
  try {
    // Create date at start of day in Vietnam timezone
    const vnDate = new Date(vnDateString + 'T00:00:00');
    // Convert to UTC
    const utcDate = convertVNTimeToUTC(vnDate);
    // Return just the date part
    return utcDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error converting VN date to UTC string:', error);
    return '';
  }
};

/**
 * Convert VN date range to UTC date range for filtering
 * @param vnDateString - Date string in Vietnam timezone (YYYY-MM-DD format)
 * @returns Object with startUTC and endUTC for filtering
 */
export const convertVNDateRangeToUTC = (vnDateString: string): { startUTC: string; endUTC: string } => {
  if (!vnDateString) return { startUTC: '', endUTC: '' };
  
  try {
    // Start of VN day: 00:00:00 VN time
    const vnStart = new Date(vnDateString + 'T00:00:00');
    const utcStart = convertVNTimeToUTC(vnStart);
    
    // End of VN day: 23:59:59 VN time  
    const vnEnd = new Date(vnDateString + 'T23:59:59');
    const utcEnd = convertVNTimeToUTC(vnEnd);
    
    return {
      startUTC: utcStart.toISOString(),
      endUTC: utcEnd.toISOString()
    };
  } catch (error) {
    console.error('Error converting VN date range to UTC:', error);
    return { startUTC: '', endUTC: '' };
  }
};

/**
 * Get current Vietnam time as datetime-local input format
 * @returns Current time in YYYY-MM-DDTHH:mm format (Vietnam timezone)
 */
export const getCurrentVNDateTime = (): string => {
  const now = new Date();
  // Get current UTC time and convert to Vietnam time
  const vnTime = new Date(now.getTime() + (TIMEZONE_CONFIG.TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000));
  
  const year = vnTime.getFullYear();
  const month = String(vnTime.getMonth() + 1).padStart(2, '0');
  const day = String(vnTime.getDate()).padStart(2, '0');
  const hours = String(vnTime.getHours()).padStart(2, '0');
  const minutes = String(vnTime.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Get current Vietnam date as date input format
 * @returns Current date in YYYY-MM-DD format (Vietnam timezone)
 */
export const getCurrentVNDate = (): string => {
  return getCurrentVNDateTime().split('T')[0];
};

/**
 * Validate that a Vietnam datetime is not in the past
 * @param vnDateTimeString - DateTime string in Vietnam timezone
 * @returns true if valid (future), false if in the past
 */
export const isVNDateTimeInFuture = (vnDateTimeString: string): boolean => {
  if (!vnDateTimeString) return false;
  
  try {
    const inputDate = new Date(vnDateTimeString);
    const now = new Date();
    const vnNow = new Date(now.getTime() + (TIMEZONE_CONFIG.TIMEZONE_OFFSET_HOURS * 60 * 60 * 1000));
    
    return inputDate > vnNow;
  } catch (error) {
    console.error('Error validating VN datetime:', error);
    return false;
  }
};

/**
 * Format UTC date string to Vietnam time format
 * @param utcDateString - UTC date string from API
 * @param formatString - date-fns format string
 * @returns Formatted date string in Vietnam timezone
 */
export const formatUTCToVNTime = (utcDateString: string, formatString: string = TIMEZONE_CONFIG.DATE_FORMATS.DATETIME): string => {
  try {
    const vnDate = convertUTCToVNTime(utcDateString);
    return format(vnDate, formatString, { locale: vi });
  } catch (error) {
    console.error('Error formatting UTC to VN time:', error);
    return 'N/A';
  }
};

/**
 * Format time only from UTC date string
 * @param utcDateString - UTC date string from API
 * @returns Time string in HH:mm format (Vietnam timezone)
 */
export const formatTimeFromUTC = (utcDateString: string): string => {
  return formatUTCToVNTime(utcDateString, TIMEZONE_CONFIG.DATE_FORMATS.TIME);
};

/**
 * Format date only from UTC date string
 * @param utcDateString - UTC date string from API
 * @returns Date string in full format (Vietnam timezone)
 */
export const formatDateFromUTC = (utcDateString: string): string => {
  return formatUTCToVNTime(utcDateString, TIMEZONE_CONFIG.DATE_FORMATS.LONG_DATE);
};

/**
 * Format date to Vietnamese locale for display
 * @param utcDateString - UTC date string from API
 * @returns Date string in Vietnamese locale (Vietnam timezone)
 */
export const formatDateToVietnamese = (utcDateString: string): string => {
  try {
    const vnDate = convertUTCToVNTime(utcDateString);
    return vnDate.toLocaleDateString(TIMEZONE_CONFIG.LOCALE, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: TIMEZONE_CONFIG.APP_TIMEZONE
    });
  } catch (error) {
    console.error('Error formatting date to Vietnamese:', error);
    return 'N/A';
  }
};

/**
 * Format short date for tables and lists
 * @param utcDateString - UTC date string from API
 * @returns Short date string in dd/MM/yyyy format (Vietnam timezone)
 */
export const formatShortDate = (utcDateString: string): string => {
  return formatUTCToVNTime(utcDateString, TIMEZONE_CONFIG.DATE_FORMATS.SHORT_DATE);
}; 