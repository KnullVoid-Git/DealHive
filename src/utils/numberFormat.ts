/**
 * Centralized Number Formatting Utility
 * Respects user settings preference: 'US' (International) vs 'IN' (Indian lakh system)
 */

export const formatNumber = (num: number): string => {
  const format = localStorage.getItem('dealhive_number_format') || 'US';
  if (format === 'IN') {
    return num.toLocaleString('en-IN');
  }
  return num.toLocaleString('en-US');
};
