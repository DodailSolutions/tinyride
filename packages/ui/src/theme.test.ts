import { describe, it, expect } from 'vitest';
import { formatINR, formatDistance, formatTime12h, colors } from './theme';

describe('UI Theme & Formatters', () => {
  it('formats INR currency correctly', () => {
    const formatted = formatINR(3500);
    expect(formatted).toContain('3,500');
    expect(formatted).toMatch(/₹|INR/);
  });

  it('formats distance in kilometers with 1 decimal precision', () => {
    expect(formatDistance(4.25)).toBe('4.3 km');
    expect(formatDistance(10)).toBe('10.0 km');
  });

  it('formats 24-hour time to 12-hour AM/PM format', () => {
    expect(formatTime12h('08:15')).toBe('8:15 AM');
    expect(formatTime12h('15:30')).toBe('3:30 PM');
    expect(formatTime12h('12:00')).toBe('12:00 PM');
    expect(formatTime12h('00:00')).toBe('12:00 AM');
  });

  it('contains valid Brand Navy and Orange hex colors', () => {
    expect(colors.navy[900]).toBe('#0F1E36');
    expect(colors.orange[500]).toBe('#FF6B00');
  });
});
