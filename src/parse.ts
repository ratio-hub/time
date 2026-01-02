/**
 * Duration string parsing utilities
 */

// Time constants in milliseconds
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = MS_PER_SECOND * 60;
export const MS_PER_HOUR = MS_PER_MINUTE * 60;
export const MS_PER_DAY = MS_PER_HOUR * 24;
export const MS_PER_WEEK = MS_PER_DAY * 7;
export const MS_PER_YEAR = MS_PER_DAY * 365.25;
export const MS_PER_MONTH = MS_PER_YEAR / 12;

// Unit mappings (lowercase)
const UNIT_MAP: Record<string, number> = {
  // Milliseconds
  milliseconds: 1,
  millisecond: 1,
  msecs: 1,
  msec: 1,
  ms: 1,

  // Seconds
  seconds: MS_PER_SECOND,
  second: MS_PER_SECOND,
  secs: MS_PER_SECOND,
  sec: MS_PER_SECOND,
  s: MS_PER_SECOND,

  // Minutes
  minutes: MS_PER_MINUTE,
  minute: MS_PER_MINUTE,
  mins: MS_PER_MINUTE,
  min: MS_PER_MINUTE,
  m: MS_PER_MINUTE,

  // Hours
  hours: MS_PER_HOUR,
  hour: MS_PER_HOUR,
  hrs: MS_PER_HOUR,
  hr: MS_PER_HOUR,
  h: MS_PER_HOUR,

  // Days
  days: MS_PER_DAY,
  day: MS_PER_DAY,
  d: MS_PER_DAY,

  // Weeks
  weeks: MS_PER_WEEK,
  week: MS_PER_WEEK,
  w: MS_PER_WEEK,

  // Months (approximate)
  months: MS_PER_MONTH,
  month: MS_PER_MONTH,
  mo: MS_PER_MONTH,

  // Years (approximate)
  years: MS_PER_YEAR,
  year: MS_PER_YEAR,
  yrs: MS_PER_YEAR,
  yr: MS_PER_YEAR,
  y: MS_PER_YEAR,
};

// Regex for parsing a single duration component: optional sign, number (with optional decimal), optional space, optional unit
// Examples: '1h', '1.5h', '-5m', '100', '1 hour', '2.5 days'
const COMPONENT_REGEX = /(-?\d+\.?\d*)\s*([a-zA-Z]*)/g;

/**
 * Parse a duration string into milliseconds
 * @param input Duration string like '1h', '30m', '1h30m', '2 days', '-5m'
 * @returns Duration in milliseconds
 * @throws Error if input is invalid
 */
export function parseDuration(input: string): number {
  if (typeof input !== 'string') {
    throw new Error(`Invalid duration: expected string, got ${typeof input}`);
  }

  const str = input.trim();

  if (str === '') {
    throw new Error('Invalid duration: empty string');
  }

  // Check for leading negative sign (applies to entire duration)
  let isNegative = false;
  let parseStr = str;

  if (str.startsWith('-')) {
    isNegative = true;
    parseStr = str.slice(1).trim();
  } else if (str.startsWith('+')) {
    parseStr = str.slice(1).trim();
  }

  // Try to parse as bare number first (interpreted as milliseconds)
  const bareNumber = parseFloat(parseStr);
  if (!isNaN(bareNumber) && /^[\d.]+$/.test(parseStr)) {
    return isNegative ? -bareNumber : bareNumber;
  }

  // Parse compound duration (e.g., '1h30m', '1w2d')
  let totalMs = 0;
  let matched = false;

  // Reset regex state
  COMPONENT_REGEX.lastIndex = 0;

  let match;
  let lastIndex = 0;

  while ((match = COMPONENT_REGEX.exec(parseStr)) !== null) {
    const [fullMatch, numStr, unitStr] = match;

    // Check for gaps (invalid characters between components)
    const gap = parseStr.slice(lastIndex, match.index).trim();
    if (gap !== '') {
      throw new Error(`Invalid duration: unexpected characters '${gap}' in '${input}'`);
    }
    lastIndex = match.index + fullMatch.length;

    if (!numStr) continue;

    const num = parseFloat(numStr);
    if (isNaN(num)) {
      throw new Error(`Invalid duration: invalid number '${numStr}' in '${input}'`);
    }

    // Determine unit
    const unit = (unitStr ?? '').toLowerCase() || 'ms';
    const multiplier = UNIT_MAP[unit];

    if (multiplier === undefined) {
      throw new Error(`Invalid duration: unknown unit '${unitStr}' in '${input}'`);
    }

    totalMs += num * multiplier;
    matched = true;
  }

  // Check for trailing invalid characters
  const trailing = parseStr.slice(lastIndex).trim();
  if (trailing !== '') {
    throw new Error(`Invalid duration: unexpected characters '${trailing}' in '${input}'`);
  }

  if (!matched) {
    throw new Error(`Invalid duration: could not parse '${input}'`);
  }

  return isNegative ? -totalMs : totalMs;
}

/**
 * Check if a value looks like a Duration instance
 */
export function isDurationLike(value: unknown): value is { toMillis(): number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toMillis' in value &&
    typeof (value as { toMillis: unknown }).toMillis === 'function'
  );
}

/**
 * Normalize a DurationInput to milliseconds
 */
export function normalizeToMillis(input: string | { toMillis(): number }): number {
  if (typeof input === 'string') {
    return parseDuration(input);
  }
  if (isDurationLike(input)) {
    return input.toMillis();
  }
  throw new Error(`Invalid duration input: ${typeof input}`);
}
