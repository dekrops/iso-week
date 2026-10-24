// Calendar helpers for the export: dates are ISO 8601 calendar dates ("2026-10-24"), in UTC.

/** Parses "YYYY-MM-DD" into a UTC date; throws a RangeError for anything else. */
export function parseDate(text: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!m) throw new RangeError(`not a date: ${text}`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d)
    throw new RangeError(`not a date: ${text}`);
  return date;
}

/** Monday = 1 … Sunday = 7. */
export function weekday(date: Date): number {
  return date.getUTCDay() || 7;
}
