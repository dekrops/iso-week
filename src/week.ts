// Week numbers for the calendar export.
import { parseDate, weekday } from './calendar.ts';

const DAY = 86_400_000;

/** The ISO 8601 week a "YYYY-MM-DD" date belongs to; throws a RangeError for anything else. */
export function isoWeek(date: string): { year: number; week: number } {
  const d = parseDate(date);
  // The Thursday of this date's week decides the ISO year.
  const thursday = new Date(d.getTime() + (4 - weekday(d)) * DAY);
  const year = thursday.getUTCFullYear();
  const jan1 = new Date(0);
  jan1.setUTCFullYear(year, 0, 1); // not Date.UTC, which maps years 0-99 to 1900-1999
  const dayOfYear = Math.floor((thursday.getTime() - jan1.getTime()) / DAY);
  return { year, week: Math.floor(dayOfYear / 7) + 1 };
}
