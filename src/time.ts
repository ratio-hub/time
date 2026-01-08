/**
 * Time class for representing instants in time
 */

import type { DurationInput, Seconds, Milliseconds } from './types.ts';
import { asSeconds, asMillis } from './types.ts';
import { normalizeToMillis, MS_PER_SECOND } from './parse.ts';
import { formatRelative } from './format.ts';
import { Duration } from './duration.ts';

/**
 * Immutable Time class representing an instant in time
 */
export class Time {
  readonly #ms: number; // Unix timestamp in milliseconds

  private constructor(ms: number) {
    this.#ms = Math.floor(ms);
  }

  // ============================================
  // Static Factory Methods - ALWAYS EXPLICIT about units
  // ============================================

  /** Create a Time representing the current moment */
  static now(): Time {
    return new Time(Date.now());
  }

  /** Create a Time from a Unix timestamp in seconds */
  static seconds(unix: number): Time {
    return new Time(unix * MS_PER_SECOND);
  }

  /** Create a Time from a Unix timestamp in milliseconds */
  static millis(unix: number): Time {
    return new Time(unix);
  }

  /** Create a Time from a Date object */
  static date(d: Date): Time {
    return new Time(d.getTime());
  }

  /** Create a Time from an ISO 8601 string */
  static iso(s: string): Time {
    const date = new Date(s);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid ISO date string: '${s}'`);
    }
    return new Time(date.getTime());
  }

  // ============================================
  // Convenience Shortcuts
  // ============================================

  /** Create a Time that is duration from now (in the future) */
  static in(d: DurationInput): Time {
    const ms = normalizeToMillis(d);
    return new Time(Date.now() + ms);
  }

  /** Create a Time that is duration before now (in the past) */
  static ago(d: DurationInput): Time {
    const ms = normalizeToMillis(d);
    return new Time(Date.now() - ms);
  }

  // ============================================
  // Arithmetic Operations (immutable)
  // ============================================

  /** Add a duration to this time */
  add(d: DurationInput): Time {
    const ms = normalizeToMillis(d);
    return new Time(this.#ms + ms);
  }

  /** Subtract a duration from this time */
  subtract(d: DurationInput): Time {
    const ms = normalizeToMillis(d);
    return new Time(this.#ms - ms);
  }

  /** Get the difference between this time and another as a Duration */
  diff(other: Time | Date): Duration {
    const otherMs = other instanceof Time ? other.#ms : other.getTime();
    return Duration.milliseconds(this.#ms - otherMs);
  }

  // ============================================
  // Comparison Operations
  // ============================================

  /** Check if this time is before another */
  isBefore(other: Time | Date): boolean {
    const otherMs = other instanceof Time ? other.#ms : other.getTime();
    return this.#ms < otherMs;
  }

  /** Check if this time is after another */
  isAfter(other: Time | Date): boolean {
    const otherMs = other instanceof Time ? other.#ms : other.getTime();
    return this.#ms > otherMs;
  }

  /** Check if this time equals another */
  equals(other: Time | Date): boolean {
    const otherMs = other instanceof Time ? other.#ms : other.getTime();
    return this.#ms === otherMs;
  }

  // ============================================
  // Relative to Now (computed fresh each call)
  // ============================================

  /** Check if this time is in the past */
  isPast(): boolean {
    return this.#ms < Date.now();
  }

  /** Check if this time is in the future */
  isFuture(): boolean {
    return this.#ms > Date.now();
  }

  // ============================================
  // Window Checks - Key Feature
  // ============================================

  /**
   * Check if this time is within a duration window of another time
   * @param duration The window size (applied as +/- from anchor)
   * @param of The anchor time (defaults to now)
   * @returns true if this time is within the window
   */
  isWithin(duration: DurationInput, of?: Time | Date): boolean {
    const windowMs = Math.abs(normalizeToMillis(duration));
    const anchorMs = of
      ? (of instanceof Time ? of.#ms : of.getTime())
      : Date.now();

    const diff = Math.abs(this.#ms - anchorMs);
    return diff <= windowMs;
  }

  // ============================================
  // Expiration Helpers (common patterns)
  // ============================================

  /** Check if this time has expired (is in the past) - same as isPast() */
  hasExpired(): boolean {
    return this.isPast();
  }

  /**
   * Check if this time is in the future but will expire within the given duration
   * Useful for proactive refresh of tokens/caches before they expire
   */
  expiresWithin(duration: DurationInput): boolean {
    if (!this.isFuture()) {
      return false;
    }
    const windowMs = normalizeToMillis(duration);
    const timeUntilExpiry = this.#ms - Date.now();
    return timeUntilExpiry <= windowMs;
  }

  /**
   * Check if this time expired within the given duration (recently expired)
   * Useful for grace periods or "just expired" checks
   */
  expiredWithin(duration: DurationInput): boolean {
    if (!this.isPast()) {
      return false;
    }
    const windowMs = normalizeToMillis(duration);
    const timeSinceExpiry = Date.now() - this.#ms;
    return timeSinceExpiry <= windowMs;
  }

  // ============================================
  // Output Methods - EXPLICIT about units
  // ============================================

  /** Get the Unix timestamp in seconds (branded type) */
  toSeconds(): Seconds {
    return asSeconds(Math.floor(this.#ms / MS_PER_SECOND));
  }

  /** Get the Unix timestamp in milliseconds (branded type) */
  toMillis(): Milliseconds {
    return asMillis(this.#ms);
  }

  /** Convert to a Date object */
  toDate(): Date {
    return new Date(this.#ms);
  }

  /** Convert to an ISO 8601 string */
  toISO(): string {
    return new Date(this.#ms).toISOString();
  }

  /**
   * Get a human-readable relative time string
   * @param options Formatting options
   * @returns String like 'in 5 minutes', '2 hours ago', 'just now'
   */
  toRelative(options?: { long?: boolean }): string {
    const diff = this.#ms - Date.now();
    return formatRelative(diff, options);
  }

  /** String representation (ISO format) */
  toString(): string {
    return this.toISO();
  }

  /** Custom inspection for debugging */
  get [Symbol.toStringTag](): string {
    return 'Time';
  }
}
