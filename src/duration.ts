/**
 * Duration class for representing lengths of time
 */

import type { DurationInput, DurationLike, StringValue } from './types.ts';
import {
  normalizeToMillis,
  MS_PER_SECOND,
  MS_PER_MINUTE,
  MS_PER_HOUR,
  MS_PER_DAY,
  MS_PER_WEEK,
  MS_PER_MONTH,
  MS_PER_YEAR,
} from './parse.ts';
import { humanize as formatHumanize } from './format.ts';

/**
 * Immutable Duration class representing a length of time
 */
export class Duration implements DurationLike {
  readonly #ms: number;

  private constructor(ms: number) {
    this.#ms = ms;
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /** Create a Duration from milliseconds */
  static milliseconds(n: number): Duration {
    return new Duration(n);
  }

  /** Create a Duration from seconds */
  static seconds(n: number): Duration {
    return new Duration(n * MS_PER_SECOND);
  }

  /** Create a Duration from minutes */
  static minutes(n: number): Duration {
    return new Duration(n * MS_PER_MINUTE);
  }

  /** Create a Duration from hours */
  static hours(n: number): Duration {
    return new Duration(n * MS_PER_HOUR);
  }

  /** Create a Duration from days */
  static days(n: number): Duration {
    return new Duration(n * MS_PER_DAY);
  }

  /** Create a Duration from weeks */
  static weeks(n: number): Duration {
    return new Duration(n * MS_PER_WEEK);
  }

  /** Create a Duration from months (approximate: year/12) */
  static months(n: number): Duration {
    return new Duration(n * MS_PER_MONTH);
  }

  /** Create a Duration from years (approximate: 365.25 days) */
  static years(n: number): Duration {
    return new Duration(n * MS_PER_YEAR);
  }

  /** Create a Duration of zero length */
  static zero(): Duration {
    return new Duration(0);
  }

  // ============================================
  // Arithmetic Operations (immutable)
  // ============================================

  /** Add another duration to this one */
  add(other: DurationInput): Duration {
    return new Duration(this.#ms + normalizeToMillis(other));
  }

  /** Subtract another duration from this one */
  subtract(other: DurationInput): Duration {
    return new Duration(this.#ms - normalizeToMillis(other));
  }

  /** Multiply this duration by a scalar */
  multiply(n: number): Duration {
    return new Duration(this.#ms * n);
  }

  /** Divide this duration by a scalar */
  divide(n: number): Duration {
    if (n === 0) {
      throw new Error('Cannot divide duration by zero');
    }
    return new Duration(this.#ms / n);
  }

  /** Get the absolute value of this duration */
  abs(): Duration {
    return new Duration(Math.abs(this.#ms));
  }

  /** Negate this duration */
  negate(): Duration {
    return new Duration(-this.#ms);
  }

  // ============================================
  // Comparison Operations
  // ============================================

  /** Check if this duration equals another */
  equals(other: DurationInput): boolean {
    return this.#ms === normalizeToMillis(other);
  }

  /** Check if this duration is greater than another */
  greaterThan(other: DurationInput): boolean {
    return this.#ms > normalizeToMillis(other);
  }

  /** Check if this duration is less than another */
  lessThan(other: DurationInput): boolean {
    return this.#ms < normalizeToMillis(other);
  }

  /** Check if this duration is greater than or equal to another */
  greaterThanOrEqual(other: DurationInput): boolean {
    return this.#ms >= normalizeToMillis(other);
  }

  /** Check if this duration is less than or equal to another */
  lessThanOrEqual(other: DurationInput): boolean {
    return this.#ms <= normalizeToMillis(other);
  }

  /** Check if this duration is zero */
  isZero(): boolean {
    return this.#ms === 0;
  }

  /** Check if this duration is negative */
  isNegative(): boolean {
    return this.#ms < 0;
  }

  /** Check if this duration is positive */
  isPositive(): boolean {
    return this.#ms > 0;
  }

  // ============================================
  // Output Methods
  // ============================================

  /** Get the duration in milliseconds (raw number) */
  toMillis(): number {
    return this.#ms;
  }

  /** Get the duration in seconds (raw number) */
  toSeconds(): number {
    return this.#ms / MS_PER_SECOND;
  }

  /** Get the duration in minutes (raw number) */
  toMinutes(): number {
    return this.#ms / MS_PER_MINUTE;
  }

  /** Get the duration in hours (raw number) */
  toHours(): number {
    return this.#ms / MS_PER_HOUR;
  }

  /** Get the duration in days (raw number) */
  toDays(): number {
    return this.#ms / MS_PER_DAY;
  }

  /** Get the duration in weeks (raw number) */
  toWeeks(): number {
    return this.#ms / MS_PER_WEEK;
  }

  // ============================================
  // Formatting Methods
  // ============================================

  /** Get a human-readable representation of this duration */
  humanize(options?: { long?: boolean }): string {
    return formatHumanize(this.#ms, options);
  }

  /** String representation (same as humanize) */
  toString(): string {
    return this.humanize();
  }

  /** Custom inspection for debugging */
  get [Symbol.toStringTag](): string {
    return 'Duration';
  }
}

/**
 * Convenience factory function for creating Duration from a string
 * @param input Duration string like '1h', '30m', '1h30m'
 */
export function dur(input: StringValue): Duration {
  const ms = normalizeToMillis(input);
  return Duration.milliseconds(ms);
}
