import { test, expect, describe, beforeEach, afterEach, setSystemTime } from 'bun:test';
import { Time, Duration, dur } from '../src/index.ts';

describe('Integration Tests', () => {
  beforeEach(() => {
    setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    setSystemTime();
  });

  describe('JWT expiration check', () => {
    test('token not expired, not expiring soon', () => {
      // JWT payload with exp in 2 hours
      const jwtPayload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
      };

      const exp = Time.seconds(jwtPayload.exp);

      expect(exp.hasExpired()).toBe(false);
      expect(exp.expiresWithin('5m')).toBe(false);
      expect(exp.expiresWithin('3h')).toBe(true);
    });

    test('token expiring soon - needs refresh', () => {
      // JWT expiring in 3 minutes
      const jwtPayload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) + 180, // 3 minutes from now
      };

      const exp = Time.seconds(jwtPayload.exp);

      expect(exp.hasExpired()).toBe(false);
      expect(exp.expiresWithin('5m')).toBe(true);
    });

    test('token already expired', () => {
      // JWT expired 10 minutes ago
      const jwtPayload = {
        sub: 'user123',
        exp: Math.floor(Date.now() / 1000) - 600,
      };

      const exp = Time.seconds(jwtPayload.exp);

      expect(exp.hasExpired()).toBe(true);
      expect(exp.expiredWithin('15m')).toBe(true);
      expect(exp.expiredWithin('5m')).toBe(false);
    });
  });

  describe('Rate limiting', () => {
    test('check if enough time has passed since last request', () => {
      // Last request was 2 seconds ago
      const lastRequestTimestamp = Date.now() - 2000;
      const lastRequest = Time.millis(lastRequestTimestamp);

      // Rate limit: 1 request per second
      const canMakeRequest = !lastRequest.isWithin('1s');
      expect(canMakeRequest).toBe(true);
    });

    test('request too soon - rate limited', () => {
      // Last request was 500ms ago
      const lastRequestTimestamp = Date.now() - 500;
      const lastRequest = Time.millis(lastRequestTimestamp);

      // Rate limit: 1 request per second
      const canMakeRequest = !lastRequest.isWithin('1s');
      expect(canMakeRequest).toBe(false);
    });

    test('calculate time until next allowed request', () => {
      // Last request was 600ms ago
      const lastRequestTimestamp = Date.now() - 600;
      const lastRequest = Time.millis(lastRequestTimestamp);

      // Rate limit window
      const rateLimitWindow = dur('1s');
      const nextAllowed = lastRequest.add(rateLimitWindow);
      const timeUntilAllowed = nextAllowed.diff(Time.now());

      expect(timeUntilAllowed.toMillis()).toBeCloseTo(400, -2);
    });
  });

  describe('Session token creation', () => {
    test('create session expiring in 1 year', () => {
      const expiresAt = Time.in('1y').toDate();
      const expectedYear = new Date().getFullYear() + 1;

      // Should be approximately 1 year from now
      expect(expiresAt.getFullYear()).toBe(expectedYear);
    });

    test('create short-lived session (1 hour)', () => {
      const expiresAt = Time.in('1h');
      const expiresAtSeconds = expiresAt.toSeconds();

      // Store in database as unix timestamp
      expect(typeof expiresAtSeconds).toBe('number');

      // Verify it's in the future
      expect(expiresAt.isFuture()).toBe(true);

      // Verify duration
      const timeLeft = expiresAt.diff(Time.now());
      expect(timeLeft.toHours()).toBeCloseTo(1, 0);
    });
  });

  describe('Cache staleness', () => {
    test('cache entry is fresh', () => {
      // Cache entry from 5 minutes ago
      const entry = {
        data: { value: 'cached' },
        timestamp: Date.now() - 300000, // 5 minutes ago
      };

      const cached = Time.millis(entry.timestamp);
      const cacheTTL = dur('15m');
      const expiresAt = cached.add(cacheTTL);

      expect(expiresAt.isFuture()).toBe(true);

      // Alternative: check if cached time + TTL is still in the future
      const isStale = cached.add('15m').isPast();
      expect(isStale).toBe(false);
    });

    test('cache entry is stale', () => {
      // Cache entry from 20 minutes ago
      const entry = {
        data: { value: 'cached' },
        timestamp: Date.now() - 1200000, // 20 minutes ago
      };

      const cached = Time.millis(entry.timestamp);
      const isStale = cached.add('15m').isPast();

      expect(isStale).toBe(true);
    });

    test('calculate remaining TTL', () => {
      // Cache entry from 10 minutes ago with 15 minute TTL
      const entry = { timestamp: Date.now() - 600000 }; // 10 minutes ago

      const cached = Time.millis(entry.timestamp);
      const expiresAt = cached.add('15m');
      const remainingTTL = expiresAt.diff(Time.now());

      expect(remainingTTL.toMinutes()).toBeCloseTo(5, 0);
    });
  });

  describe('Scheduled task execution', () => {
    test('check if scheduled time has arrived', () => {
      const scheduledFor = Time.in('30m');

      // Not time yet
      expect(scheduledFor.isPast()).toBe(false);

      // Calculate wait time
      const waitDuration = scheduledFor.diff(Time.now());
      expect(waitDuration.toMinutes()).toBeCloseTo(30, 0);
    });

    test('check if within execution window', () => {
      // Task scheduled for "around now" with 5 minute tolerance
      const scheduledFor = Time.ago('2m'); // 2 minutes ago
      const isWithinWindow = scheduledFor.isWithin('5m');

      expect(isWithinWindow).toBe(true);
    });
  });

  describe('Duration arithmetic for billing', () => {
    test('calculate total usage duration', () => {
      const sessions = [
        { duration: dur('30m') },
        { duration: dur('1h15m') },
        { duration: dur('45m') },
      ];

      const total = sessions.reduce(
        (acc, session) => acc.add(session.duration),
        Duration.zero()
      );

      expect(total.toHours()).toBeCloseTo(2.5, 1);
    });

    test('calculate remaining quota', () => {
      const monthlyQuota = dur('100h');
      const used = dur('75h').add('30m');
      const remaining = monthlyQuota.subtract(used);

      expect(remaining.toHours()).toBeCloseTo(24.5, 1);
      expect(remaining.humanize()).toBe('1d');
    });

    test('check if over quota', () => {
      const quota = dur('10h');
      const used = dur('12h');

      const isOverQuota = used.greaterThan(quota);
      const overBy = used.subtract(quota);

      expect(isOverQuota).toBe(true);
      expect(overBy.toHours()).toBe(2);
    });
  });

  describe('Time zone independent operations', () => {
    test('unix timestamps are timezone independent', () => {
      // This timestamp represents 2024-01-01 00:00:00 UTC
      const utcTimestamp = 1704067200;

      const time = Time.seconds(utcTimestamp);

      // toSeconds should return the same timestamp regardless of local timezone
      expect(time.toSeconds() as number).toBe(utcTimestamp);

      // ISO string should always be in UTC
      expect(time.toISO()).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('Chaining operations', () => {
    test('chain multiple operations fluently', () => {
      const result = Time.now()
        .add('1d')
        .add('2h')
        .subtract('30m')
        .toRelative();

      expect(result).toContain('in');
    });

    test('chain duration operations', () => {
      const result = dur('1h')
        .add('30m')
        .multiply(2)
        .subtract('15m')
        .toHours();

      // (1h + 30m) * 2 - 15m = 3h - 15m = 2h 45m = 2.75h
      expect(result).toBe(2.75);
    });
  });
});
