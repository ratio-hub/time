/**
 * Human-readable formatting utilities for durations and relative times
 */

import {
  MS_PER_SECOND,
  MS_PER_MINUTE,
  MS_PER_HOUR,
  MS_PER_DAY,
  MS_PER_WEEK,
  MS_PER_MONTH,
  MS_PER_YEAR,
} from './parse.ts';

interface HumanizeOptions {
  long?: boolean;
}

interface FormatRelativeOptions {
  long?: boolean;
}

// Thresholds for rounding (use 1.5x as breakpoint to next unit)
const UNITS = [
  { ms: MS_PER_YEAR, short: 'y', long: 'year', longPlural: 'years' },
  { ms: MS_PER_MONTH, short: 'mo', long: 'month', longPlural: 'months' },
  { ms: MS_PER_WEEK, short: 'w', long: 'week', longPlural: 'weeks' },
  { ms: MS_PER_DAY, short: 'd', long: 'day', longPlural: 'days' },
  { ms: MS_PER_HOUR, short: 'h', long: 'hour', longPlural: 'hours' },
  { ms: MS_PER_MINUTE, short: 'm', long: 'minute', longPlural: 'minutes' },
  { ms: MS_PER_SECOND, short: 's', long: 'second', longPlural: 'seconds' },
  { ms: 1, short: 'ms', long: 'millisecond', longPlural: 'milliseconds' },
];

/**
 * Format a duration in milliseconds as a human-readable string
 * @param ms Duration in milliseconds
 * @param options Formatting options
 * @returns Human-readable duration string like '5m' or '5 minutes'
 */
export function humanize(ms: number, options?: HumanizeOptions): string {
  const long = options?.long ?? false;
  const absMs = Math.abs(ms);
  const sign = ms < 0 ? '-' : '';

  // Handle zero
  if (absMs === 0) {
    return long ? '0 milliseconds' : '0ms';
  }

  // Find the best unit (largest unit where value >= 1)
  for (const unit of UNITS) {
    if (absMs >= unit.ms) {
      const value = Math.round(absMs / unit.ms);
      if (long) {
        const unitName = value === 1 ? unit.long : unit.longPlural;
        return `${sign}${value} ${unitName}`;
      }
      return `${sign}${value}${unit.short}`;
    }
  }

  // Fallback (shouldn't reach here)
  return long ? `${sign}${absMs} milliseconds` : `${sign}${absMs}ms`;
}

/**
 * Format a relative time (difference from reference point)
 * @param diffMs Difference in milliseconds (positive = future, negative = past)
 * @param options Formatting options
 * @returns Human-readable relative time like 'in 5 minutes' or '2 hours ago'
 */
export function formatRelative(diffMs: number, options?: FormatRelativeOptions): string {
  const long = options?.long ?? false;
  const absDiff = Math.abs(diffMs);

  // Handle "just now" / "in a moment" for very small differences
  const threshold = MS_PER_SECOND * 10; // 10 seconds
  if (absDiff < threshold) {
    if (diffMs >= 0) {
      return long ? 'in a moment' : 'in a moment';
    }
    return long ? 'just now' : 'just now';
  }

  // Get humanized duration
  const duration = humanize(absDiff, { long });

  // Format as relative
  if (diffMs > 0) {
    return `in ${duration}`;
  }
  return `${duration} ago`;
}
