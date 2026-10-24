import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseDate, weekday } from '../src/calendar.ts';

test('parses calendar dates', () => {
  assert.equal(parseDate('2026-10-24').toISOString(), '2026-10-24T00:00:00.000Z');
});

test('refuses what is not a date', () => {
  assert.throws(() => parseDate('2026-02-30'), RangeError);
  assert.throws(() => parseDate('24.10.2026'), RangeError);
});

test('Monday is 1, Sunday is 7', () => {
  assert.equal(weekday(parseDate('2026-10-19')), 1);
  assert.equal(weekday(parseDate('2026-10-25')), 7);
});
