import { test, expect, describe } from 'bun:test';
import { humanize, formatRelative } from '../src/format.ts';

describe('humanize', () => {
  describe('short format (default)', () => {
    test('formats milliseconds', () => {
      expect(humanize(500)).toBe('500ms');
      expect(humanize(1)).toBe('1ms');
    });

    test('formats seconds', () => {
      expect(humanize(1000)).toBe('1s');
      expect(humanize(5000)).toBe('5s');
      expect(humanize(30000)).toBe('30s');
    });

    test('formats minutes', () => {
      expect(humanize(60000)).toBe('1m');
      expect(humanize(300000)).toBe('5m');
      expect(humanize(1800000)).toBe('30m');
    });

    test('formats hours', () => {
      expect(humanize(3600000)).toBe('1h');
      expect(humanize(7200000)).toBe('2h');
    });

    test('formats days', () => {
      expect(humanize(86400000)).toBe('1d');
      expect(humanize(172800000)).toBe('2d');
    });

    test('formats weeks', () => {
      expect(humanize(604800000)).toBe('1w');
      expect(humanize(1209600000)).toBe('2w');
    });

    test('formats months', () => {
      const monthMs = (365.25 / 12) * 24 * 60 * 60 * 1000;
      expect(humanize(monthMs)).toBe('1mo');
      expect(humanize(monthMs * 6)).toBe('6mo');
    });

    test('formats years', () => {
      const yearMs = 365.25 * 24 * 60 * 60 * 1000;
      expect(humanize(yearMs)).toBe('1y');
      expect(humanize(yearMs * 2)).toBe('2y');
    });

    test('rounds to largest unit', () => {
      // 90 minutes -> 2 hours (rounded)
      expect(humanize(5400000)).toBe('2h');
      // 36 hours -> 2 days (rounded)
      expect(humanize(129600000)).toBe('2d');
    });

    test('handles zero', () => {
      expect(humanize(0)).toBe('0ms');
    });

    test('handles negative values', () => {
      expect(humanize(-300000)).toBe('-5m');
      expect(humanize(-3600000)).toBe('-1h');
    });
  });

  describe('long format', () => {
    test('formats singular units', () => {
      expect(humanize(1000, { long: true })).toBe('1 second');
      expect(humanize(60000, { long: true })).toBe('1 minute');
      expect(humanize(3600000, { long: true })).toBe('1 hour');
      expect(humanize(86400000, { long: true })).toBe('1 day');
      expect(humanize(604800000, { long: true })).toBe('1 week');
    });

    test('formats plural units', () => {
      expect(humanize(2000, { long: true })).toBe('2 seconds');
      expect(humanize(120000, { long: true })).toBe('2 minutes');
      expect(humanize(7200000, { long: true })).toBe('2 hours');
      expect(humanize(172800000, { long: true })).toBe('2 days');
      expect(humanize(1209600000, { long: true })).toBe('2 weeks');
    });

    test('handles zero', () => {
      expect(humanize(0, { long: true })).toBe('0 milliseconds');
    });

    test('handles negative values', () => {
      expect(humanize(-60000, { long: true })).toBe('-1 minute');
      expect(humanize(-120000, { long: true })).toBe('-2 minutes');
    });
  });
});

describe('formatRelative', () => {
  describe('future times', () => {
    test('formats future time', () => {
      expect(formatRelative(300000)).toBe('in 5m');
      expect(formatRelative(3600000)).toBe('in 1h');
      expect(formatRelative(86400000)).toBe('in 1d');
    });

    test('formats with long option', () => {
      expect(formatRelative(300000, { long: true })).toBe('in 5 minutes');
      expect(formatRelative(3600000, { long: true })).toBe('in 1 hour');
    });

    test('handles "in a moment" for very small future', () => {
      expect(formatRelative(5000)).toBe('in a moment');
      expect(formatRelative(1000)).toBe('in a moment');
    });
  });

  describe('past times', () => {
    test('formats past time', () => {
      expect(formatRelative(-300000)).toBe('5m ago');
      expect(formatRelative(-3600000)).toBe('1h ago');
      expect(formatRelative(-86400000)).toBe('1d ago');
    });

    test('formats with long option', () => {
      expect(formatRelative(-300000, { long: true })).toBe('5 minutes ago');
      expect(formatRelative(-3600000, { long: true })).toBe('1 hour ago');
    });

    test('handles "just now" for very small past', () => {
      expect(formatRelative(-5000)).toBe('just now');
      expect(formatRelative(-1000)).toBe('just now');
    });
  });

  describe('edge cases', () => {
    test('handles zero', () => {
      const result = formatRelative(0);
      expect(result).toMatch(/just now|in a moment/);
    });

    test('handles threshold boundary (10 seconds)', () => {
      // Just under threshold
      expect(formatRelative(9999)).toBe('in a moment');
      // At or over threshold
      expect(formatRelative(11000)).toBe('in 11s');
    });
  });
});
