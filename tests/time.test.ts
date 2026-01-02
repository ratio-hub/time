import { test, expect, describe, beforeEach, afterEach, setSystemTime } from 'bun:test';
import { Time } from '../src/time.ts';
import { dur, Duration } from '../src/duration.ts';

describe('Time', () => {
  describe('factory methods', () => {
    test('now() returns current time', () => {
      const before = Date.now();
      const time = Time.now();
      const after = Date.now();

      const ms = time.toMillis();
      expect(ms).toBeGreaterThanOrEqual(before);
      expect(ms).toBeLessThanOrEqual(after);
    });

    test('seconds() creates from unix seconds', () => {
      const time = Time.seconds(1704067200);
      expect(time.toMillis() as number).toBe(1704067200000);
    });

    test('millis() creates from unix milliseconds', () => {
      const time = Time.millis(1704067200000);
      expect(time.toSeconds() as number).toBe(1704067200);
    });

    test('date() creates from Date object', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const time = Time.date(date);
      expect(time.toDate().getTime()).toBe(date.getTime());
    });

    test('iso() creates from ISO string', () => {
      const isoStr = '2024-01-01T00:00:00Z';
      const time = Time.iso(isoStr);
      expect(time.toISO()).toBe(new Date(isoStr).toISOString());
    });

    test('iso() throws on invalid string', () => {
      expect(() => Time.iso('not a date')).toThrow(/Invalid ISO date string/);
    });
  });

  describe('convenience shortcuts', () => {
    beforeEach(() => {
      setSystemTime(new Date('2024-06-15T12:00:00Z'));
    });

    afterEach(() => {
      setSystemTime();
    });

    test('in() creates future time', () => {
      const future = Time.in('1h');
      const now = Date.now();

      expect(future.toMillis() - now).toBe(3600000);
    });

    test('ago() creates past time', () => {
      const past = Time.ago('1h');
      const now = Date.now();

      expect(now - past.toMillis()).toBe(3600000);
    });
  });

  describe('arithmetic operations', () => {
    test('add() adds duration', () => {
      const time = Time.seconds(1000);
      const result = time.add('1h');

      expect(result.toSeconds() as number).toBe(4600);
    });

    test('add() accepts Duration instance', () => {
      const time = Time.seconds(1000);
      const result = time.add(dur('30m'));

      expect(result.toSeconds() as number).toBe(2800);
    });

    test('subtract() subtracts duration', () => {
      const time = Time.seconds(4600);
      const result = time.subtract('1h');

      expect(result.toSeconds() as number).toBe(1000);
    });

    test('diff() returns Duration', () => {
      const t1 = Time.seconds(2000);
      const t2 = Time.seconds(1000);
      const diff = t1.diff(t2);

      expect(diff).toBeInstanceOf(Duration);
      expect(diff.toMillis()).toBe(1000000);
    });

    test('diff() works with Date', () => {
      const time = Time.millis(2000);
      const date = new Date(1000);
      const diff = time.diff(date);

      expect(diff.toMillis()).toBe(1000);
    });
  });

  describe('comparison operations', () => {
    test('isBefore()', () => {
      const t1 = Time.seconds(1000);
      const t2 = Time.seconds(2000);

      expect(t1.isBefore(t2)).toBe(true);
      expect(t2.isBefore(t1)).toBe(false);
      expect(t1.isBefore(t1)).toBe(false);
    });

    test('isAfter()', () => {
      const t1 = Time.seconds(2000);
      const t2 = Time.seconds(1000);

      expect(t1.isAfter(t2)).toBe(true);
      expect(t2.isAfter(t1)).toBe(false);
      expect(t1.isAfter(t1)).toBe(false);
    });

    test('equals()', () => {
      const t1 = Time.seconds(1000);
      const t2 = Time.millis(1000000);
      const t3 = Time.seconds(2000);

      expect(t1.equals(t2)).toBe(true);
      expect(t1.equals(t3)).toBe(false);
    });

    test('equals() works with Date', () => {
      const time = Time.millis(1000);
      const date = new Date(1000);

      expect(time.equals(date)).toBe(true);
    });
  });

  describe('relative to now', () => {
    beforeEach(() => {
      setSystemTime(new Date('2024-06-15T12:00:00Z'));
    });

    afterEach(() => {
      setSystemTime();
    });

    test('isPast() for past time', () => {
      const past = Time.ago('1h');
      expect(past.isPast()).toBe(true);
    });

    test('isPast() for future time', () => {
      const future = Time.in('1h');
      expect(future.isPast()).toBe(false);
    });

    test('isFuture() for future time', () => {
      const future = Time.in('1h');
      expect(future.isFuture()).toBe(true);
    });

    test('isFuture() for past time', () => {
      const past = Time.ago('1h');
      expect(past.isFuture()).toBe(false);
    });
  });

  describe('window checks', () => {
    beforeEach(() => {
      setSystemTime(new Date('2024-06-15T12:00:00Z'));
    });

    afterEach(() => {
      setSystemTime();
    });

    test('isWithin() - now is within window of now', () => {
      const now = Time.now();
      expect(now.isWithin('10m')).toBe(true);
    });

    test('isWithin() - past time within window', () => {
      const past = Time.ago('5m');
      expect(past.isWithin('10m')).toBe(true);
    });

    test('isWithin() - past time outside window', () => {
      const past = Time.ago('15m');
      expect(past.isWithin('10m')).toBe(false);
    });

    test('isWithin() - future time within window', () => {
      const future = Time.in('5m');
      expect(future.isWithin('10m')).toBe(true);
    });

    test('isWithin() - future time outside window', () => {
      const future = Time.in('15m');
      expect(future.isWithin('10m')).toBe(false);
    });

    test('isWithin() - with custom anchor', () => {
      const anchor = Time.seconds(1000);
      const close = Time.seconds(1050);
      const far = Time.seconds(2000);

      expect(close.isWithin('100s', anchor)).toBe(true);
      expect(far.isWithin('100s', anchor)).toBe(false);
    });

    test('isWithin() - with Duration instance', () => {
      const past = Time.ago('5m');
      expect(past.isWithin(dur('10m'))).toBe(true);
    });
  });

  describe('expiration helpers', () => {
    beforeEach(() => {
      setSystemTime(new Date('2024-06-15T12:00:00Z'));
    });

    afterEach(() => {
      setSystemTime();
    });

    test('hasExpired() - same as isPast()', () => {
      const past = Time.ago('1h');
      const future = Time.in('1h');

      expect(past.hasExpired()).toBe(true);
      expect(future.hasExpired()).toBe(false);
    });

    test('expiresWithin() - future time expiring soon', () => {
      const soonExpiry = Time.in('5m');
      expect(soonExpiry.expiresWithin('10m')).toBe(true);
    });

    test('expiresWithin() - future time not expiring soon', () => {
      const laterExpiry = Time.in('15m');
      expect(laterExpiry.expiresWithin('10m')).toBe(false);
    });

    test('expiresWithin() - past time returns false', () => {
      const past = Time.ago('5m');
      expect(past.expiresWithin('10m')).toBe(false);
    });

    test('expiredWithin() - recently expired', () => {
      const recentlyExpired = Time.ago('5m');
      expect(recentlyExpired.expiredWithin('10m')).toBe(true);
    });

    test('expiredWithin() - expired long ago', () => {
      const longExpired = Time.ago('15m');
      expect(longExpired.expiredWithin('10m')).toBe(false);
    });

    test('expiredWithin() - future time returns false', () => {
      const future = Time.in('5m');
      expect(future.expiredWithin('10m')).toBe(false);
    });
  });

  describe('output methods', () => {
    test('toSeconds() returns branded Seconds', () => {
      const time = Time.millis(1704067200000);
      const seconds = time.toSeconds();

      expect(seconds as number).toBe(1704067200);
      // Type check: this should compile
      const _typeCheck: number = seconds;
    });

    test('toMillis() returns branded Milliseconds', () => {
      const time = Time.seconds(1704067200);
      const millis = time.toMillis();

      expect(millis as number).toBe(1704067200000);
      // Type check: this should compile
      const _typeCheck: number = millis;
    });

    test('toDate() returns Date', () => {
      const time = Time.millis(1704067200000);
      const date = time.toDate();

      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBe(1704067200000);
    });

    test('toISO() returns valid ISO string', () => {
      const time = Time.iso('2024-01-01T00:00:00.000Z');
      expect(time.toISO()).toBe('2024-01-01T00:00:00.000Z');
    });

    test('toString() returns ISO format', () => {
      const time = Time.iso('2024-01-01T00:00:00.000Z');
      expect(time.toString()).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('toRelative()', () => {
    beforeEach(() => {
      setSystemTime(new Date('2024-06-15T12:00:00Z'));
    });

    afterEach(() => {
      setSystemTime();
    });

    test('formats future time', () => {
      const future = Time.in('5m');
      expect(future.toRelative()).toBe('in 5m');
    });

    test('formats past time', () => {
      const past = Time.ago('5m');
      expect(past.toRelative()).toBe('5m ago');
    });

    test('formats with long option', () => {
      const future = Time.in('2h');
      expect(future.toRelative({ long: true })).toBe('in 2 hours');
    });

    test('handles just now', () => {
      const now = Time.now();
      const result = now.toRelative();
      expect(result).toMatch(/just now|in a moment/);
    });
  });

  describe('immutability', () => {
    test('add() returns new instance', () => {
      const original = Time.seconds(1000);
      const added = original.add('1h');

      expect(original.toSeconds() as number).toBe(1000);
      expect(added.toSeconds() as number).toBe(4600);
      expect(original).not.toBe(added);
    });

    test('subtract() returns new instance', () => {
      const original = Time.seconds(4600);
      const subtracted = original.subtract('1h');

      expect(original.toSeconds() as number).toBe(4600);
      expect(subtracted.toSeconds() as number).toBe(1000);
    });
  });

  describe('Symbol.toStringTag', () => {
    test('has correct tag', () => {
      expect(Object.prototype.toString.call(Time.now())).toBe('[object Time]');
    });
  });
});
