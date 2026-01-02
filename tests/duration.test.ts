import { test, expect, describe } from 'bun:test';
import { Duration, dur } from '../src/duration.ts';

describe('Duration', () => {
  describe('factory methods', () => {
    test('creates from milliseconds', () => {
      expect(Duration.milliseconds(1000).toMillis()).toBe(1000);
    });

    test('creates from seconds', () => {
      expect(Duration.seconds(1).toMillis()).toBe(1000);
      expect(Duration.seconds(60).toMillis()).toBe(60000);
    });

    test('creates from minutes', () => {
      expect(Duration.minutes(1).toMillis()).toBe(60000);
      expect(Duration.minutes(30).toMillis()).toBe(1800000);
    });

    test('creates from hours', () => {
      expect(Duration.hours(1).toMillis()).toBe(3600000);
      expect(Duration.hours(24).toMillis()).toBe(86400000);
    });

    test('creates from days', () => {
      expect(Duration.days(1).toMillis()).toBe(86400000);
      expect(Duration.days(7).toMillis()).toBe(604800000);
    });

    test('creates from weeks', () => {
      expect(Duration.weeks(1).toMillis()).toBe(604800000);
      expect(Duration.weeks(2).toMillis()).toBe(1209600000);
    });

    test('creates from months', () => {
      const monthMs = (365.25 / 12) * 24 * 60 * 60 * 1000;
      expect(Duration.months(1).toMillis()).toBe(monthMs);
    });

    test('creates from years', () => {
      const yearMs = 365.25 * 24 * 60 * 60 * 1000;
      expect(Duration.years(1).toMillis()).toBe(yearMs);
    });

    test('creates zero duration', () => {
      expect(Duration.zero().toMillis()).toBe(0);
      expect(Duration.zero().isZero()).toBe(true);
    });
  });

  describe('dur() factory function', () => {
    test('parses string durations', () => {
      expect(dur('1s').toMillis()).toBe(1000);
      expect(dur('1m').toMillis()).toBe(60000);
      expect(dur('1h').toMillis()).toBe(3600000);
      expect(dur('1d').toMillis()).toBe(86400000);
      expect(dur('1w').toMillis()).toBe(604800000);
    });

    test('parses decimal durations', () => {
      expect(dur('1.5h').toMillis()).toBe(5400000);
    });

    test('parses compound durations', () => {
      expect(dur('1h30m').toMillis()).toBe(5400000);
      expect(dur('1w2d').toMillis()).toBe(777600000);
    });

    test('parses negative durations', () => {
      expect(dur('-5m').toMillis()).toBe(-300000);
    });

    test('parses bare numbers as milliseconds', () => {
      expect(dur('100').toMillis()).toBe(100);
    });
  });

  describe('arithmetic operations', () => {
    test('adds durations', () => {
      expect(dur('1h').add('30m').equals(dur('1h30m'))).toBe(true);
      expect(dur('1h').add(dur('30m')).toMillis()).toBe(5400000);
    });

    test('subtracts durations', () => {
      expect(dur('2h').subtract('30m').equals(dur('1h30m'))).toBe(true);
      expect(dur('1h').subtract('30m').toMillis()).toBe(1800000);
    });

    test('multiplies by scalar', () => {
      expect(dur('1h').multiply(2).equals(dur('2h'))).toBe(true);
      expect(dur('30m').multiply(3).toMillis()).toBe(5400000);
    });

    test('divides by scalar', () => {
      expect(dur('1h').divide(2).equals(dur('30m'))).toBe(true);
      expect(dur('2h').divide(4).toMillis()).toBe(1800000);
    });

    test('throws on divide by zero', () => {
      expect(() => dur('1h').divide(0)).toThrow(/divide.*zero/i);
    });

    test('gets absolute value', () => {
      expect(dur('-1h').abs().equals(dur('1h'))).toBe(true);
      expect(dur('1h').abs().equals(dur('1h'))).toBe(true);
    });

    test('negates duration', () => {
      expect(dur('1h').negate().equals(dur('-1h'))).toBe(true);
      expect(dur('-1h').negate().equals(dur('1h'))).toBe(true);
    });
  });

  describe('comparison operations', () => {
    test('equals', () => {
      expect(dur('1h').equals('60m')).toBe(true);
      expect(dur('1h').equals(dur('60m'))).toBe(true);
      expect(dur('1h').equals('59m')).toBe(false);
    });

    test('greaterThan', () => {
      expect(dur('2h').greaterThan('1h')).toBe(true);
      expect(dur('1h').greaterThan('2h')).toBe(false);
      expect(dur('1h').greaterThan('1h')).toBe(false);
    });

    test('lessThan', () => {
      expect(dur('30m').lessThan('1h')).toBe(true);
      expect(dur('2h').lessThan('1h')).toBe(false);
      expect(dur('1h').lessThan('1h')).toBe(false);
    });

    test('greaterThanOrEqual', () => {
      expect(dur('2h').greaterThanOrEqual('1h')).toBe(true);
      expect(dur('1h').greaterThanOrEqual('1h')).toBe(true);
      expect(dur('30m').greaterThanOrEqual('1h')).toBe(false);
    });

    test('lessThanOrEqual', () => {
      expect(dur('30m').lessThanOrEqual('1h')).toBe(true);
      expect(dur('1h').lessThanOrEqual('1h')).toBe(true);
      expect(dur('2h').lessThanOrEqual('1h')).toBe(false);
    });

    test('isZero', () => {
      expect(dur('0s').isZero()).toBe(true);
      expect(Duration.zero().isZero()).toBe(true);
      expect(dur('1s').isZero()).toBe(false);
    });

    test('isNegative', () => {
      expect(dur('-1h').isNegative()).toBe(true);
      expect(dur('1h').isNegative()).toBe(false);
      expect(dur('0s').isNegative()).toBe(false);
    });

    test('isPositive', () => {
      expect(dur('1h').isPositive()).toBe(true);
      expect(dur('-1h').isPositive()).toBe(false);
      expect(dur('0s').isPositive()).toBe(false);
    });
  });

  describe('output methods', () => {
    test('toMillis', () => {
      expect(dur('1s').toMillis()).toBe(1000);
      expect(dur('1h').toMillis()).toBe(3600000);
    });

    test('toSeconds', () => {
      expect(dur('1m').toSeconds()).toBe(60);
      expect(dur('1h').toSeconds()).toBe(3600);
    });

    test('toMinutes', () => {
      expect(dur('1h').toMinutes()).toBe(60);
      expect(dur('90m').toMinutes()).toBe(90);
    });

    test('toHours', () => {
      expect(dur('90m').toHours()).toBe(1.5);
      expect(dur('2h').toHours()).toBe(2);
    });

    test('toDays', () => {
      expect(dur('48h').toDays()).toBe(2);
      expect(dur('36h').toDays()).toBe(1.5);
    });

    test('toWeeks', () => {
      expect(dur('14d').toWeeks()).toBe(2);
    });
  });

  describe('formatting', () => {
    test('humanize short format', () => {
      expect(dur('5m').humanize()).toBe('5m');
      expect(dur('2h').humanize()).toBe('2h');
      expect(dur('3d').humanize()).toBe('3d');
    });

    test('humanize long format', () => {
      expect(dur('1m').humanize({ long: true })).toBe('1 minute');
      expect(dur('2m').humanize({ long: true })).toBe('2 minutes');
      expect(dur('1h').humanize({ long: true })).toBe('1 hour');
      expect(dur('2h').humanize({ long: true })).toBe('2 hours');
    });

    test('humanize rounds to largest unit', () => {
      // 90 minutes rounds to 2 hours
      expect(dur('90m').humanize()).toBe('2h');
      expect(dur('90m').humanize({ long: true })).toBe('2 hours');
    });

    test('humanize handles zero', () => {
      expect(dur('0s').humanize()).toBe('0ms');
      expect(dur('0s').humanize({ long: true })).toBe('0 milliseconds');
    });

    test('humanize handles negative', () => {
      expect(dur('-5m').humanize()).toBe('-5m');
      expect(dur('-1h').humanize({ long: true })).toBe('-1 hour');
    });

    test('toString returns humanized', () => {
      expect(dur('1h').toString()).toBe('1h');
    });
  });

  describe('immutability', () => {
    test('arithmetic operations return new instances', () => {
      const original = dur('1h');
      const added = original.add('30m');

      expect(original.toMillis()).toBe(3600000);
      expect(added.toMillis()).toBe(5400000);
      expect(original).not.toBe(added);
    });

    test('negate returns new instance', () => {
      const original = dur('1h');
      const negated = original.negate();

      expect(original.toMillis()).toBe(3600000);
      expect(negated.toMillis()).toBe(-3600000);
    });
  });

  describe('Symbol.toStringTag', () => {
    test('has correct tag', () => {
      expect(Object.prototype.toString.call(dur('1h'))).toBe('[object Duration]');
    });
  });
});
