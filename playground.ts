import { Time, Duration, dur } from './src/index.ts';

console.log('=== Time ===\n');

// Creating times
const now = Time.now();
console.log('Time.now():', now.toISO());
console.log('Time.seconds(1704067200):', Time.seconds(1704067200).toISO());
console.log('Time.in("1h"):', Time.in('1h').toISO());
console.log('Time.ago("30m"):', Time.ago('30m').toISO());

// Arithmetic
console.log('\n--- Arithmetic ---');
console.log('now.add("2h"):', now.add('2h').toISO());
console.log('now.subtract("1d"):', now.subtract('1d').toISO());

const t1 = Time.seconds(2000);
const t2 = Time.seconds(1000);
console.log('Time.seconds(2000).diff(Time.seconds(1000)):', t1.diff(t2).toSeconds(), 'seconds');

// Comparisons
console.log('\n--- Comparisons ---');
console.log('Time.ago("1h").isPast():', Time.ago('1h').isPast());
console.log('Time.in("1h").isFuture():', Time.in('1h').isFuture());
console.log('Time.ago("5m").isWithin("10m"):', Time.ago('5m').isWithin('10m'));
console.log('Time.ago("15m").isWithin("10m"):', Time.ago('15m').isWithin('10m'));

// Expiration helpers
console.log('\n--- Expiration ---');
const futureToken = Time.in('10m');
console.log('Token expires in 10 minutes:');
console.log('  hasExpired():', futureToken.hasExpired());
console.log('  expiresWithin("15m"):', futureToken.expiresWithin('15m'));
console.log('  expiresWithin("5m"):', futureToken.expiresWithin('5m'));

const expiredToken = Time.ago('5m');
console.log('Token expired 5 minutes ago:');
console.log('  hasExpired():', expiredToken.hasExpired());
console.log('  expiredWithin("10m"):', expiredToken.expiredWithin('10m'));
console.log('  expiredWithin("2m"):', expiredToken.expiredWithin('2m'));

// Output formats
console.log('\n--- Output ---');
console.log('now.toSeconds():', now.toSeconds());
console.log('now.toMillis():', now.toMillis());
console.log('now.toISO():', now.toISO());
console.log('Time.in("5m").toRelative():', Time.in('5m').toRelative());
console.log('Time.ago("2h").toRelative():', Time.ago('2h').toRelative());
console.log('Time.ago("2h").toRelative({ long: true }):', Time.ago('2h').toRelative({ long: true }));

console.log('\n=== Duration ===\n');

// Creating durations
console.log('dur("1h").toMillis():', dur('1h').toMillis());
console.log('dur("1h30m").toMillis():', dur('1h30m').toMillis());
console.log('dur("1w2d").toDays():', dur('1w2d').toDays());
console.log('dur("1.5h").toMinutes():', dur('1.5h').toMinutes());

// Arithmetic
console.log('\n--- Arithmetic ---');
console.log('dur("1h").add("30m").toMinutes():', dur('1h').add('30m').toMinutes());
console.log('dur("2h").subtract("30m").toMinutes():', dur('2h').subtract('30m').toMinutes());
console.log('dur("1h").multiply(3).toHours():', dur('1h').multiply(3).toHours());
console.log('dur("1h").divide(2).toMinutes():', dur('1h').divide(2).toMinutes());

// Comparisons
console.log('\n--- Comparisons ---');
console.log('dur("1h").equals("60m"):', dur('1h').equals('60m'));
console.log('dur("2h").greaterThan("1h"):', dur('2h').greaterThan('1h'));
console.log('dur("30m").lessThan("1h"):', dur('30m').lessThan('1h'));

// Humanize
console.log('\n--- Humanize ---');
console.log('dur("90m").humanize():', dur('90m').humanize());
console.log('dur("90m").humanize({ long: true }):', dur('90m').humanize({ long: true }));
console.log('dur("45s").humanize():', dur('45s').humanize());
console.log('dur("3d").humanize({ long: true }):', dur('3d').humanize({ long: true }));
console.log('dur("500ms").humanize():', dur('500ms').humanize());

// Chaining
console.log('\n=== Chaining ===\n');
const result = dur('1h')
  .add('30m')
  .multiply(2)
  .subtract('15m');
console.log("dur('1h').add('30m').multiply(2).subtract('15m'):");
console.log('  toHours():', result.toHours());
console.log('  humanize():', result.humanize());
