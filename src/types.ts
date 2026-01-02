/**
 * Branded types for type-safe time units
 */

declare const SecondsSymbol: unique symbol;
declare const MillisecondsSymbol: unique symbol;

/** Branded type for seconds - prevents mixing with milliseconds at compile time */
export type Seconds = number & { readonly [SecondsSymbol]: typeof SecondsSymbol };

/** Branded type for milliseconds - prevents mixing with seconds at compile time */
export type Milliseconds = number & { readonly [MillisecondsSymbol]: typeof MillisecondsSymbol };

/** Helper to brand a number as Seconds (internal use) */
export const asSeconds = (n: number): Seconds => n as Seconds;

/** Helper to brand a number as Milliseconds (internal use) */
export const asMillis = (n: number): Milliseconds => n as Milliseconds;

// Duration string unit types (following ms library pattern)
type Years = 'years' | 'year' | 'yrs' | 'yr' | 'y';
type Months = 'months' | 'month' | 'mo';
type Weeks = 'weeks' | 'week' | 'w';
type Days = 'days' | 'day' | 'd';
type Hours = 'hours' | 'hour' | 'hrs' | 'hr' | 'h';
type Minutes = 'minutes' | 'minute' | 'mins' | 'min' | 'm';
type SecondsUnit = 'seconds' | 'second' | 'secs' | 'sec' | 's';
type MillisecondsUnit = 'milliseconds' | 'millisecond' | 'msecs' | 'msec' | 'ms';

type Unit = Years | Months | Weeks | Days | Hours | Minutes | SecondsUnit | MillisecondsUnit;
type UnitAnyCase = Capitalize<Unit> | Uppercase<Unit> | Unit;

// Short units for compound duration support
type ShortUnit = 'y' | 'mo' | 'w' | 'd' | 'h' | 'm' | 's' | 'ms';

/**
 * Type-safe duration string values like '1h', '30m', '2 days'
 * Also supports compound durations like '1h30m', '1w2d'
 */
export type StringValue =
  | `${number}`
  | `${number}${UnitAnyCase}`
  | `${number} ${UnitAnyCase}`
  // Compound durations (2 components)
  | `${number}${ShortUnit}${number}${ShortUnit}`
  // Compound durations (3 components)
  | `${number}${ShortUnit}${number}${ShortUnit}${number}${ShortUnit}`;

// Forward declaration for Duration class (avoids circular import)
export interface DurationLike {
  toMillis(): number;
}

/** Input type for duration - accepts string values or Duration instances */
export type DurationInput = StringValue | DurationLike;
