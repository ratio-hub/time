/**
 * @ratio/time - Type-safe time library for TypeScript
 *
 * Provides branded types to prevent unit mixups and an ergonomic API
 * for common time operations like expiration checks and duration arithmetic.
 */

// Core classes
export { Time } from './time.ts';
export { Duration, dur } from './duration.ts';

// Types
export type {
  Seconds,
  Milliseconds,
  StringValue,
  DurationInput,
  DurationLike,
} from './types.ts';

// Type helpers (for advanced use cases)
export { asSeconds, asMillis } from './types.ts';
