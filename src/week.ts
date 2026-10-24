// Week numbers for the calendar export.
//
// Dates are ISO 8601 calendar dates ("YYYY-MM-DD") in the proleptic Gregorian calendar.
// The arithmetic is done on day counts rather than through `Date`, so every four-digit
// year (0000-9999) is handled the same way: `Date.UTC` maps years 0-99 onto 1900-1999.

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/** Days since 1970-01-01 for a valid Gregorian date (Howard Hinnant's days_from_civil). */
function daysFromCivil(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const mp = (month + 9) % 12;
  const doy = Math.floor((153 * mp + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** Monday = 1 … Sunday = 7, for a day count since 1970-01-01 (a Thursday). */
function weekdayOf(days: number): number {
  return ((((days + 3) % 7) + 7) % 7) + 1;
}

/**
 * The ISO 8601 week a calendar date belongs to.
 *
 * Weeks start on Monday, and a week belongs to the year that holds its Thursday, so week 1
 * is the week with the year's first Thursday. `year` is that ISO week-numbering year, which
 * differs from the calendar year for some days at the start of January and end of December.
 *
 * @param date a calendar date as "YYYY-MM-DD"
 * @throws {RangeError} when `date` is not a valid calendar date in that form
 */
export function isoWeek(date: string): { year: number; week: number } {
  const m = typeof date === 'string' ? DATE.exec(date) : null;
  if (!m) throw new RangeError(`not a date: ${String(date)}`);
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month))
    throw new RangeError(`not a date: ${date}`);

  const days = daysFromCivil(year, month, day);
  const thursday = days + 4 - weekdayOf(days);
  // The Thursday is at most three days away, so its calendar year is year - 1, year or year + 1.
  const isoYear =
    thursday < daysFromCivil(year, 1, 1) ? year - 1
    : thursday > daysFromCivil(year, 12, 31) ? year + 1
    : year;
  const week = Math.floor((thursday - daysFromCivil(isoYear, 1, 1)) / 7) + 1;
  return { year: isoYear, week };
}
