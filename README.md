# @ratio-hub/time

Type-safe time library for TypeScript. Branded types prevent mixing up seconds and milliseconds.

## Install

```bash
bun add @ratio-hub/time
```

## Quick Start

```typescript
import { Time, Duration, dur } from "@ratio-hub/time";

// Create time from JWT expiration (unix seconds)
const exp = Time.seconds(jwt.exp);

// Check if token expired
if (exp.hasExpired()) {
  console.log("Token expired");
}

// Check if token expires within 5 minutes (proactive refresh)
if (exp.expiresWithin("5m")) {
  console.log("Token expiring soon, refresh it");
}

// Parse duration strings
const oneHour = dur("1h"); // Duration
const mixed = dur("1h30m"); // Duration (1.5 hours)
console.log(mixed.toMillis()); // 5400000
console.log(mixed.toMinutes()); // 90
```

## Time

### Creating Time Instances

```typescript
// All factories are explicit about units
const now = Time.now(); // current time
const fromSec = Time.seconds(1704067200); // from unix seconds
const fromMs = Time.millis(1704067200000); // from unix milliseconds
const fromDate = Time.date(new Date()); // from Date object
const fromISO = Time.iso("2024-01-01T00:00:00Z"); // from ISO string

// Shortcuts for relative times
const inOneHour = Time.in("1h"); // Time: 1 hour from now
const thirtyMinsAgo = Time.ago("30m"); // Time: 30 minutes ago
```

### Arithmetic

All operations return new `Time` instances (immutable).

```typescript
const now = Time.now();

const later = now.add("1h"); // Time: 1 hour later
const earlier = now.subtract("30m"); // Time: 30 minutes earlier

// Get difference between two times
const t1 = Time.seconds(2000);
const t2 = Time.seconds(1000);
const diff = t1.diff(t2); // Duration: 1000 seconds
console.log(diff.toSeconds()); // 1000
```

### Comparisons

```typescript
const t1 = Time.seconds(1000);
const t2 = Time.seconds(2000);

t1.isBefore(t2); // true
t1.isAfter(t2); // false
t1.equals(t2); // false

// Relative to current time
const past = Time.ago("1h");
past.isPast(); // true
past.isFuture(); // false
```

### Window Checks

```typescript
const lastRequest = Time.ago("30s");

// Is this time within 1 minute of now?
lastRequest.isWithin("1m"); // true (30s < 1m)

// Is this time within 10 seconds of now?
lastRequest.isWithin("10s"); // false (30s > 10s)

// Check against a specific anchor time
const anchor = Time.seconds(1000);
const target = Time.seconds(1050);
target.isWithin("100s", anchor); // true (50s < 100s)
```

### Expiration Helpers

```typescript
const tokenExp = Time.in("10m"); // expires in 10 minutes

tokenExp.hasExpired(); // false (still in future)
tokenExp.expiresWithin("15m"); // true (expires within 15 min window)
tokenExp.expiresWithin("5m"); // false (won't expire in next 5 min)

const oldToken = Time.ago("5m"); // expired 5 minutes ago

oldToken.hasExpired(); // true
oldToken.expiredWithin("10m"); // true (expired within last 10 min)
oldToken.expiredWithin("2m"); // false (expired more than 2 min ago)
```

### Output

```typescript
const time = Time.seconds(1704067200);

time.toSeconds(); // 1704067200 (Seconds type)
time.toMillis(); // 1704067200000 (Milliseconds type)
time.toDate(); // Date object
time.toISO(); // '2024-01-01T00:00:00.000Z'

// Human-readable relative time
Time.in("5m").toRelative(); // 'in 5m'
Time.ago("2h").toRelative(); // '2h ago'
Time.ago("2h").toRelative({ long: true }); // '2 hours ago'
```

## Duration

### Creating Durations

```typescript
// From strings using dur()
const d1 = dur("1h"); // 1 hour
const d2 = dur("30m"); // 30 minutes
const d3 = dur("1h30m"); // 1 hour 30 minutes (compound)
const d4 = dur("1w2d"); // 1 week 2 days
const d5 = dur("1 hour"); // with space
const d6 = dur("-5m"); // negative duration

// From numbers using static methods
const d7 = Duration.milliseconds(1000);
const d8 = Duration.seconds(60);
const d9 = Duration.minutes(30);
const d10 = Duration.hours(2);
const d11 = Duration.days(7);
const d12 = Duration.weeks(1);
const d13 = Duration.months(6); // approximate (year/12)
const d14 = Duration.years(1); // approximate (365.25 days)
```

### Arithmetic

All operations return new `Duration` instances (immutable).

```typescript
const oneHour = dur("1h");

oneHour.add("30m"); // Duration: 1h30m (5400000ms)
oneHour.subtract("15m"); // Duration: 45m (2700000ms)
oneHour.multiply(2); // Duration: 2h (7200000ms)
oneHour.divide(2); // Duration: 30m (1800000ms)

dur("-1h").abs(); // Duration: 1h (positive)
dur("1h").negate(); // Duration: -1h (negative)
```

### Comparisons

```typescript
dur("1h").equals("60m"); // true
dur("2h").greaterThan("1h"); // true
dur("30m").lessThan("1h"); // true

dur("0s").isZero(); // true
dur("-1h").isNegative(); // true
dur("1h").isPositive(); // true
```

### Output

```typescript
const d = dur("90m");

d.toMillis(); // 5400000
d.toSeconds(); // 5400
d.toMinutes(); // 90
d.toHours(); // 1.5
d.toDays(); // 0.0625

// Human-readable (rounds to largest sensible unit)
dur("90m").humanize(); // '2h'
dur("90m").humanize({ long: true }); // '2 hours'
dur("45s").humanize(); // '45s'
dur("3d").humanize({ long: true }); // '3 days'
```

## Duration Strings

Supported formats:

| Unit         | Formats                                              |
| ------------ | ---------------------------------------------------- |
| Years        | `y`, `yr`, `yrs`, `year`, `years`                    |
| Months       | `mo`, `month`, `months`                              |
| Weeks        | `w`, `week`, `weeks`                                 |
| Days         | `d`, `day`, `days`                                   |
| Hours        | `h`, `hr`, `hrs`, `hour`, `hours`                    |
| Minutes      | `m`, `min`, `mins`, `minute`, `minutes`              |
| Seconds      | `s`, `sec`, `secs`, `second`, `seconds`              |
| Milliseconds | `ms`, `msec`, `msecs`, `millisecond`, `milliseconds` |

Compound: `1h30m`, `1w2d`, `2h30m15s`

Case insensitive: `1H`, `1Hour`, `1HOUR` all work.

## Type Safety

The library exports branded `Seconds` and `Milliseconds` types. TypeScript will catch if you accidentally mix them:

```typescript
import type { Seconds, Milliseconds } from "@ratio-hub/time";

const sec: Seconds = time.toSeconds(); // OK
const ms: Milliseconds = time.toMillis(); // OK

// TypeScript error: Type 'Seconds' is not assignable to type 'Milliseconds'
const wrong: Milliseconds = time.toSeconds();
```

This prevents bugs like passing seconds to an API that expects milliseconds.

## License

MIT
