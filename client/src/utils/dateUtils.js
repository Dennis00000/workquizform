import { format, formatDistance, parseISO } from 'date-fns';
import { enUS, es, fr } from 'date-fns/locale';
import i18next from 'i18next';

// Map of supported locales
const locales = {
  en: enUS,
  es: es,
  fr: fr
};

/**
 * Get the current locale for date formatting
 * @returns {Object} - date-fns locale object
 */
const getCurrentLocale = () => {
  const language = i18next.language || 'en';
  return locales[language.split('-')[0]] || enUS;
};

/**
 * Format a date string
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string
 * @returns {string} - Formatted date
 */
export const formatDate = (date, formatStr = 'PPP') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: getCurrentLocale() });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Format a date as relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} - Relative time
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(dateObj, new Date(), { 
      addSuffix: true,
      locale: getCurrentLocale()
    });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * Format a date for input fields (YYYY-MM-DD)
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date for input
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Get the current date as ISO string
 * @returns {string} - Current date as ISO string
 */
export const getCurrentDateISO = () => {
  return new Date().toISOString();
};

export default {
  formatDate,
  formatRelativeTime,
  formatDateForInput,
  getCurrentDateISO
}; 