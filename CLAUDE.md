# @ratio-hub/time

Type-safe time library with branded types to prevent mixing seconds and milliseconds.

## Commands

```bash
bun test          # run tests
bun run build     # build dist/ for npm
bun run typecheck # check types
bun run playground.ts # interactive examples
```

## Structure

```
src/
  index.ts      # public exports
  time.ts       # Time class (instants)
  duration.ts   # Duration class + dur()
  types.ts      # branded Seconds/Milliseconds types
  parse.ts      # duration string parsing
  format.ts     # humanize, relative formatting

tests/
  *.test.ts     # bun:test tests
```

## Key Concepts

- `Time` = instant in time (wraps unix ms)
- `Duration` = length of time (wraps ms)
- `Seconds` / `Milliseconds` = branded types for type safety
- All operations are immutable

## Testing

```ts
import { test, expect, setSystemTime } from "bun:test";

// Use setSystemTime for time-dependent tests
setSystemTime(new Date("2024-06-15T12:00:00Z"));
// ... test ...
setSystemTime(); // reset
```
