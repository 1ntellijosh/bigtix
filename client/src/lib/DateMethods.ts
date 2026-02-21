/**
 * Helper functions for working with dates.
 *
 * @since ticketmaster-api--JP
 */

/**
 * Gets date segments from a date object, used to show date segments (month, day, weekday, time)
 * @param date
 *
 * @returns {Object} - date segments
 */
export function getDateSegments(date: Date): { month: string, day: number, weekday: string, time: string } {
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: date.getDate(),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  };
}

/**
 * Converts ISO date string to readable time format, used to show readable time
 * @param isoString
 *
 * @returns {string} - readable time format
 */
export function formatReadableTime(isoString: string | Date | null | undefined): string {
  if (isoString == null) return '--:-- --';
  const d = new Date(isoString);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const m = minutes < 10 ? `0${minutes}` : String(minutes);
  return `${h}:${m} ${ampm}`;
}