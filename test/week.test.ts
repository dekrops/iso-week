import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isoWeek } from '../src/week.ts';

const w = (year: number, week: number) => ({ year, week });

test('ordinary dates', () => {
  assert.deepEqual(isoWeek('2026-10-24'), w(2026, 43));
  assert.deepEqual(isoWeek('2026-10-19'), w(2026, 43)); // Monday
  assert.deepEqual(isoWeek('2026-10-25'), w(2026, 43)); // Sunday
  assert.deepEqual(isoWeek('2026-10-26'), w(2026, 44)); // next Monday
  assert.deepEqual(isoWeek('2024-02-29'), w(2024, 9));
});

test('week 1 is the week with the first Thursday; weeks start on Monday', () => {
  assert.deepEqual(isoWeek('2026-01-01'), w(2026, 1)); // Thursday
  assert.deepEqual(isoWeek('2015-01-01'), w(2015, 1)); // Thursday
  assert.deepEqual(isoWeek('2024-01-01'), w(2024, 1)); // Monday
  assert.deepEqual(isoWeek('2018-01-01'), w(2018, 1)); // Monday
  assert.deepEqual(isoWeek('2020-01-01'), w(2020, 1)); // Wednesday
  assert.deepEqual(isoWeek('2025-01-05'), w(2025, 1)); // Sunday closes week 1
  assert.deepEqual(isoWeek('2025-01-06'), w(2025, 2));
});

test('late December can be week 1 of the next year', () => {
  assert.deepEqual(isoWeek('2024-12-30'), w(2025, 1));
  assert.deepEqual(isoWeek('2024-12-31'), w(2025, 1));
  assert.deepEqual(isoWeek('2024-12-29'), w(2024, 52));
  assert.deepEqual(isoWeek('2019-12-30'), w(2020, 1));
  assert.deepEqual(isoWeek('2013-12-30'), w(2014, 1));
  assert.deepEqual(isoWeek('2014-12-29'), w(2015, 1));
  assert.deepEqual(isoWeek('2025-12-29'), w(2026, 1));
  assert.deepEqual(isoWeek('2025-12-31'), w(2026, 1));
});

test('early January can be week 52 or 53 of the previous year', () => {
  assert.deepEqual(isoWeek('2021-01-01'), w(2020, 53));
  assert.deepEqual(isoWeek('2021-01-03'), w(2020, 53));
  assert.deepEqual(isoWeek('2021-01-04'), w(2021, 1));
  assert.deepEqual(isoWeek('2016-01-01'), w(2015, 53));
  assert.deepEqual(isoWeek('2016-01-03'), w(2015, 53));
  assert.deepEqual(isoWeek('2010-01-03'), w(2009, 53));
  assert.deepEqual(isoWeek('2022-01-01'), w(2021, 52));
  assert.deepEqual(isoWeek('2022-01-02'), w(2021, 52));
  assert.deepEqual(isoWeek('2023-01-01'), w(2022, 52));
  assert.deepEqual(isoWeek('2027-01-03'), w(2026, 53));
});

test('week 53 exists exactly in years with 53 Thursdays', () => {
  for (let year = 1600; year <= 2400; year++) {
    let thursdays = 0;
    for (let d = new Date(Date.UTC(year, 0, 1)); d.getUTCFullYear() === year; d.setUTCDate(d.getUTCDate() + 1))
      if (d.getUTCDay() === 4) thursdays++;
    const dec28 = isoWeek(`${year}-12-28`); // always in the year's last ISO week
    assert.equal(dec28.year, year);
    assert.equal(dec28.week, thursdays, `year ${year}`);
  }
  assert.deepEqual(isoWeek('2026-12-31'), w(2026, 53)); // 2026 starts on Thursday
  assert.deepEqual(isoWeek('2020-12-31'), w(2020, 53)); // leap year starting on Wednesday
  assert.deepEqual(isoWeek('2025-12-28'), w(2025, 52));
});

test('agrees with an independent Date-based reference over many years', () => {
  const reference = (d: Date) => {
    const t = new Date(d);
    t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
    const start = Date.UTC(t.getUTCFullYear(), 0, 1);
    return w(t.getUTCFullYear(), Math.floor((t.getTime() - start) / 86_400_000 / 7) + 1);
  };
  const d = new Date(Date.UTC(1900, 0, 1));
  const end = Date.UTC(2101, 0, 1);
  for (; d.getTime() < end; d.setUTCDate(d.getUTCDate() + 1)) {
    const text = d.toISOString().slice(0, 10);
    assert.deepEqual(isoWeek(text), reference(d), text);
  }
});

test('works across the whole four-digit range', () => {
  assert.deepEqual(isoWeek('0001-01-01'), w(1, 1)); // a Monday (proleptic Gregorian)
  assert.deepEqual(isoWeek('0000-01-01'), w(-1, 52)); // a Saturday
  assert.equal(isoWeek('0050-06-15').year, 50);
  assert.deepEqual(isoWeek('1600-02-29'), w(1600, 9));
  assert.deepEqual(isoWeek('9999-12-31'), w(9999, 52)); // a Friday
});

test('refuses anything that is not a valid date with a RangeError', () => {
  const bad: unknown[] = [
    '', '2026-02-29', '2025-02-29', '1900-02-29', '2026-02-30', '2026-04-31', '2026-13-01', '2026-00-10',
    '2026-01-00', '2026-01-32', '2026-1-5', '26-01-05', '20260105', '2026/01/05', '24.10.2026',
    ' 2026-01-05', '2026-01-05 ', '2026-01-05\n', '2026-01-05T00:00:00Z', '+2026-01-05', '-2026-01-05',
    '２０２６-01-05', 'abcd-ef-gh', 'not a date',
    undefined, null, 20260105, new Date('2026-01-05'), {}, ['2026-01-05'],
  ];
  for (const input of bad)
    assert.throws(() => isoWeek(input as string), RangeError, `input ${String(input)}`);
  assert.deepEqual(isoWeek('2000-02-29'), w(2000, 9));
});
