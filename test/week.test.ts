import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isoWeek } from '../src/week.ts';

test('ordinary dates', () => {
  assert.deepEqual(isoWeek('2026-10-24'), { year: 2026, week: 43 });
  assert.deepEqual(isoWeek('2026-01-05'), { year: 2026, week: 2 });
});

test('year boundaries', () => {
  assert.deepEqual(isoWeek('2024-12-30'), { year: 2025, week: 1 });
  assert.deepEqual(isoWeek('2021-01-03'), { year: 2020, week: 53 });
  assert.deepEqual(isoWeek('2023-01-01'), { year: 2022, week: 52 });
  assert.deepEqual(isoWeek('2026-12-31'), { year: 2026, week: 53 });
  assert.deepEqual(isoWeek('2025-12-28'), { year: 2025, week: 52 });
});

test('refuses what is not a date', () => {
  assert.throws(() => isoWeek('2026-02-30'), RangeError);
  assert.throws(() => isoWeek('nope'), RangeError);
});
