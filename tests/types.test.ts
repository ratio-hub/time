import { test, expect, describe } from 'bun:test';
import { Time, dur } from '../src/index.ts';
import type { Seconds, Milliseconds } from '../src/index.ts';

/**
 * Type safety tests
 *
 * These tests verify that the branded types work correctly at compile time.
 * The @ts-expect-error comments ensure that TypeScript correctly rejects
 * invalid type assignments.
 */

describe('Type Safety', () => {
  describe('Branded types prevent mixing units', () => {
    test('toSeconds returns branded Seconds type', () => {
      const time = Time.now();
      const seconds: Seconds = time.toSeconds();

      // Should compile - Seconds is assignable to number
      const asNumber: number = seconds;
      expect(typeof asNumber).toBe('number');
    });

    test('toMillis returns branded Milliseconds type', () => {
      const time = Time.now();
      const millis: Milliseconds = time.toMillis();

      // Should compile - Milliseconds is assignable to number
      const asNumber: number = millis;
      expect(typeof asNumber).toBe('number');
    });

    test('raw numbers cannot be assigned to Seconds', () => {
      // @ts-expect-error: number is not assignable to Seconds
      const bad: Seconds = 1000;

      // This line is here to use the variable and prevent unused variable warning
      // In actual code, this would be a type error caught at compile time
      expect(bad).toBeDefined();
    });

    test('raw numbers cannot be assigned to Milliseconds', () => {
      // @ts-expect-error: number is not assignable to Milliseconds
      const bad: Milliseconds = 1000;

      expect(bad).toBeDefined();
    });

    test('Milliseconds cannot be assigned to Seconds', () => {
      const millis = Time.now().toMillis();

      // @ts-expect-error: Milliseconds is not assignable to Seconds
      const bad: Seconds = millis;

      expect(bad).toBeDefined();
    });

    test('Seconds cannot be assigned to Milliseconds', () => {
      const seconds = Time.now().toSeconds();

      // @ts-expect-error: Seconds is not assignable to Milliseconds
      const bad: Milliseconds = seconds;

      expect(bad).toBeDefined();
    });
  });

  describe('Correct type assignments work', () => {
    test('Seconds from toSeconds() can be assigned to Seconds', () => {
      const seconds: Seconds = Time.now().toSeconds();
      expect(typeof seconds).toBe('number');
    });

    test('Milliseconds from toMillis() can be assigned to Milliseconds', () => {
      const millis: Milliseconds = Time.now().toMillis();
      expect(typeof millis).toBe('number');
    });

    test('branded types work in arithmetic', () => {
      const seconds: Seconds = Time.now().toSeconds();
      // Arithmetic still works because branded types extend number
      const doubled = seconds * 2;
      expect(typeof doubled).toBe('number');
    });
  });

  describe('StringValue type for duration strings', () => {
    test('dur() accepts valid string formats', () => {
      // These should all compile without errors
      expect(dur('1s').toMillis()).toBe(1000);
      expect(dur('1m').toMillis()).toBe(60000);
      expect(dur('1h').toMillis()).toBe(3600000);
      expect(dur('1d').toMillis()).toBe(86400000);
      expect(dur('1w').toMillis()).toBe(604800000);
      expect(dur('100').toMillis()).toBe(100);
      expect(dur('1.5h').toMillis()).toBe(5400000);
    });

    test('dur() accepts spaced formats', () => {
      expect(dur('1 hour').toMillis()).toBe(3600000);
      expect(dur('2 days').toMillis()).toBe(172800000);
    });

    test('dur() accepts case variations', () => {
      expect(dur('1H').toMillis()).toBe(3600000);
      expect(dur('1Hour').toMillis()).toBe(3600000);
      expect(dur('1HOUR').toMillis()).toBe(3600000);
    });
  });

  describe('DurationInput type accepts both strings and Duration', () => {
    test('Time.add() accepts string', () => {
      const time = Time.seconds(1000);
      const result = time.add('1h');
      expect(result.toSeconds() as number).toBe(4600);
    });

    test('Time.add() accepts Duration instance', () => {
      const time = Time.seconds(1000);
      const duration = dur('1h');
      const result = time.add(duration);
      expect(result.toSeconds() as number).toBe(4600);
    });

    test('Duration.add() accepts string', () => {
      const duration = dur('1h');
      const result = duration.add('30m');
      expect(result.toMillis()).toBe(5400000);
    });

    test('Duration.add() accepts Duration instance', () => {
      const d1 = dur('1h');
      const d2 = dur('30m');
      const result = d1.add(d2);
      expect(result.toMillis()).toBe(5400000);
    });

    test('Time.isWithin() accepts string', () => {
      const time = Time.now();
      expect(time.isWithin('10m')).toBe(true);
    });

    test('Time.isWithin() accepts Duration instance', () => {
      const time = Time.now();
      const window = dur('10m');
      expect(time.isWithin(window)).toBe(true);
    });
  });

  describe('Return type inference', () => {
    test('diff() returns Duration', () => {
      const t1 = Time.seconds(2000);
      const t2 = Time.seconds(1000);
      const diff = t1.diff(t2);

      // Type should be inferred as Duration
      expect(diff.toMillis()).toBe(1000000);
      expect(diff.humanize()).toBeDefined();
    });

    test('toDate() returns Date', () => {
      const time = Time.now();
      const date = time.toDate();

      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBeDefined();
    });
  });
});
