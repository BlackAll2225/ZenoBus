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