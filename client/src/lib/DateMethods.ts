/**
 * Helper functions for working with dates.
 *
 * @since ticketmaster-api--JP
 */
export function getDateSegments(date: Date): { month: string, day: number, weekday: string, time: string } {
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: date.getDate(),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
  };
}