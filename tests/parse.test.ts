import { test, expect, describe } from 'bun:test';
import { parseDuration } from '../src/parse.ts';

describe('parseDuration', () => {
  describe('basic units', () => {
    test('parses seconds', () => {
      expect(parseDuration('1s')).toBe(1000);
      expect(parseDuration('1sec')).toBe(1000);
      expect(parseDuration('1secs')).toBe(1000);
      expect(parseDuration('1second')).toBe(1000);
      expect(parseDuration('1seconds')).toBe(1000);
    });

    test('parses minutes', () => {
      expect(parseDuration('1m')).toBe(60000);
      expect(parseDuration('1min')).toBe(60000);
      expect(parseDuration('1mins')).toBe(60000);
      expect(parseDuration('1minute')).toBe(60000);
      expect(parseDuration('1minutes')).toBe(60000);
    });

    test('parses hours', () => {
      expect(parseDuration('1h')).toBe(3600000);
      expect(parseDuration('1hr')).toBe(3600000);
      expect(parseDuration('1hrs')).toBe(3600000);
      expect(parseDuration('1hour')).toBe(3600000);
      expect(parseDuration('1hours')).toBe(3600000);
    });

    test('parses days', () => {
      expect(parseDuration('1d')).toBe(86400000);
      expect(parseDuration('1day')).toBe(86400000);
      expect(parseDuration('1days')).toBe(86400000);
    });

    test('parses weeks', () => {
      expect(parseDuration('1w')).toBe(604800000);
      expect(parseDuration('1week')).toBe(604800000);
      expect(parseDuration('1weeks')).toBe(604800000);
    });

    test('parses months (approximate)', () => {
      const expectedMonth = (365.25 / 12) * 24 * 60 * 60 * 1000;
      expect(parseDuration('1mo')).toBe(expectedMonth);
      expect(parseDuration('1month')).toBe(expectedMonth);
      expect(parseDuration('1months')).toBe(expectedMonth);
    });

    test('parses years (approximate)', () => {
      const expectedYear = 365.25 * 24 * 60 * 60 * 1000;
      expect(parseDuration('1y')).toBe(expectedYear);
      expect(parseDuration('1yr')).toBe(expectedYear);
      expect(parseDuration('1yrs')).toBe(expectedYear);
      expect(parseDuration('1year')).toBe(expectedYear);
      expect(parseDuration('1years')).toBe(expectedYear);
    });

    test('parses milliseconds', () => {
      expect(parseDuration('1ms')).toBe(1);
      expect(parseDuration('1msec')).toBe(1);
      expect(parseDuration('1msecs')).toBe(1);
      expect(parseDuration('1millisecond')).toBe(1);
      expect(parseDuration('1milliseconds')).toBe(1);
    });
  });

  describe('numbers and decimals', () => {
    test('parses decimal values', () => {
      expect(parseDuration('1.5h')).toBe(5400000);
      expect(parseDuration('2.5d')).toBe(216000000);
      expect(parseDuration('0.5s')).toBe(500);
    });

    test('parses bare numbers as milliseconds', () => {
      expect(parseDuration('100')).toBe(100);
      expect(parseDuration('1000')).toBe(1000);
      expect(parseDuration('0')).toBe(0);
    });

    test('parses large numbers', () => {
      expect(parseDuration('100h')).toBe(360000000);
      expect(parseDuration('365d')).toBe(31536000000);
    });
  });

  describe('negative values', () => {
    test('parses negative durations', () => {
      expect(parseDuration('-5m')).toBe(-300000);
      expect(parseDuration('-1h')).toBe(-3600000);
      expect(parseDuration('-100')).toBe(-100);
    });

    test('parses positive sign', () => {
      expect(parseDuration('+5m')).toBe(300000);
      expect(parseDuration('+1h')).toBe(3600000);
    });
  });

  describe('compound durations', () => {
    test('parses compound duration without spaces', () => {
      expect(parseDuration('1h30m')).toBe(5400000);
      expect(parseDuration('1w2d')).toBe(777600000);
      expect(parseDuration('2h30m15s')).toBe(9015000);
    });

    test('parses multi-unit combinations', () => {
      expect(parseDuration('1d12h')).toBe(129600000);
      expect(parseDuration('1y6mo')).toBe(365.25 * 24 * 60 * 60 * 1000 * 1.5);
    });
  });

  describe('whitespace handling', () => {
    test('parses with space between number and unit', () => {
      expect(parseDuration('1 hour')).toBe(3600000);
      expect(parseDuration('2 days')).toBe(172800000);
      expect(parseDuration('30 minutes')).toBe(1800000);
    });

    test('trims leading/trailing whitespace', () => {
      expect(parseDuration('  1h  ')).toBe(3600000);
      expect(parseDuration('\t5m\n')).toBe(300000);
    });
  });

  describe('case insensitivity', () => {
    test('parses uppercase units', () => {
      expect(parseDuration('1H')).toBe(3600000);
      expect(parseDuration('1HOUR')).toBe(3600000);
      expect(parseDuration('1D')).toBe(86400000);
    });

    test('parses mixed case units', () => {
      expect(parseDuration('1Hour')).toBe(3600000);
      expect(parseDuration('1Minutes')).toBe(60000);
      expect(parseDuration('1Day')).toBe(86400000);
    });
  });

  describe('error handling', () => {
    test('throws on empty string', () => {
      expect(() => parseDuration('')).toThrow('Invalid duration: empty string');
    });

    test('throws on invalid unit', () => {
      expect(() => parseDuration('1x')).toThrow(/unknown unit/);
      expect(() => parseDuration('1foo')).toThrow(/unknown unit/);
    });

    test('throws on invalid format', () => {
      expect(() => parseDuration('abc')).toThrow(/unexpected characters|could not parse/);
      expect(() => parseDuration('h1')).toThrow(/unexpected characters|could not parse/);
    });

    test('throws on non-string input', () => {
      // @ts-expect-error - testing runtime behavior
      expect(() => parseDuration(123)).toThrow(/expected string/);
      // @ts-expect-error - testing runtime behavior
      expect(() => parseDuration(null)).toThrow(/expected string/);
    });
  });
});
