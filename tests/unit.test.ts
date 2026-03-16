import { describe, test, expect } from 'bun:test';
import { sanitize } from '../src/lib/api.ts';
import { formatCount, timeAgo } from '../src/lib/ui.ts';

describe('sanitize', () => {
  test('passes through clean text', () => {
    expect(sanitize('Hello World')).toBe('Hello World');
  });

  test('strips ANSI color codes', () => {
    expect(sanitize('\x1b[31mred text\x1b[0m')).toBe('red text');
  });

  test('strips ANSI cursor movement', () => {
    expect(sanitize('\x1b[2Amove up')).toBe('move up');
  });

  test('strips OSC sequences (title injection)', () => {
    expect(sanitize('\x1b]0;evil title\x07normal')).toBe('normal');
  });

  test('strips ASCII control chars', () => {
    expect(sanitize('hello\x00\x01\x02world')).toBe('helloworld');
  });

  test('preserves newlines and tabs', () => {
    expect(sanitize('line1\nline2\ttab')).toBe('line1\nline2\ttab');
  });

  test('strips carriage returns', () => {
    expect(sanitize('abc\rOVERWRITE')).toBe('abcOVERWRITE');
  });

  test('handles empty string', () => {
    expect(sanitize('')).toBe('');
  });

  test('handles mixed ANSI + control chars', () => {
    expect(sanitize('\x1b[1m\x00bold\x1b[0m\x03')).toBe('bold');
  });
});

describe('formatCount', () => {
  test('returns raw number under 1000', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(1)).toBe('1');
    expect(formatCount(999)).toBe('999');
  });

  test('formats thousands', () => {
    expect(formatCount(1000)).toBe('1.0K');
    expect(formatCount(1500)).toBe('1.5K');
    expect(formatCount(12500)).toBe('12.5K');
    expect(formatCount(99999)).toBe('100.0K');
  });

  test('formats hundreds of thousands without decimals', () => {
    expect(formatCount(100000)).toBe('100K');
    expect(formatCount(500000)).toBe('500K');
    expect(formatCount(999999)).toBe('1000K');
  });

  test('formats millions', () => {
    expect(formatCount(1_000_000)).toBe('1.0M');
    expect(formatCount(2_500_000)).toBe('2.5M');
  });
});

describe('timeAgo', () => {
  test('returns minutes for recent timestamps', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe('5m ago');
  });

  test('returns hours', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600_000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe('3h ago');
  });

  test('returns days', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 86400_000).toISOString();
    expect(timeAgo(tenDaysAgo)).toBe('10d ago');
  });

  test('returns months', () => {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400_000).toISOString();
    expect(timeAgo(ninetyDaysAgo)).toBe('3mo ago');
  });

  test('returns years and months', () => {
    const eighteenMonthsAgo = new Date(Date.now() - 548 * 86400_000).toISOString();
    expect(timeAgo(eighteenMonthsAgo)).toMatch(/^1y \dmo ago$/);
  });

  test('returns years only when no remaining months', () => {
    const twoYearsAgo = new Date(Date.now() - 730 * 86400_000).toISOString();
    expect(timeAgo(twoYearsAgo)).toMatch(/^2y( \dmo)? ago$/);
  });

  test('handles invalid date', () => {
    expect(timeAgo('garbage')).toBe('unknown');
    expect(timeAgo('')).toBe('unknown');
  });

  test('clamps future dates to 0m ago', () => {
    const future = new Date(Date.now() + 86400_000).toISOString();
    expect(timeAgo(future)).toBe('0m ago');
  });
});
