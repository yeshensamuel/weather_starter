import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { formatMapTemperature } from '../format';

describe('Feature: weather-map-card, Property 2: Temperature label formatting', () => {
  /**
   * **Validates: Requirements 3.2, 3.3**
   *
   * For any valid finite numeric temperature value, formatMapTemperature SHALL return
   * the rounded integer followed by a degree symbol. For any null or undefined value,
   * it SHALL return "--°".
   */

  it('returns rounded integer followed by degree symbol for any finite number', () => {
    fc.assert(
      fc.property(
        fc.double({ noNaN: true, noDefaultInfinity: true, min: -100, max: 100 }),
        (value) => {
          const result = formatMapTemperature(value);
          const expected = `${Math.round(value)}°`;
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns "--°" for null', () => {
    fc.assert(
      fc.property(fc.constant(null), (value) => {
        expect(formatMapTemperature(value)).toBe('--°');
      }),
      { numRuns: 1 }
    );
  });

  it('returns "--°" for undefined', () => {
    fc.assert(
      fc.property(fc.constant(undefined), (value) => {
        expect(formatMapTemperature(value)).toBe('--°');
      }),
      { numRuns: 1 }
    );
  });

  it('returns "--°" for NaN', () => {
    const result = formatMapTemperature(NaN);
    expect(result).toBe('--°');
  });

  it('returns "--°" for Infinity and -Infinity', () => {
    expect(formatMapTemperature(Infinity)).toBe('--°');
    expect(formatMapTemperature(-Infinity)).toBe('--°');
  });

  it('handles -0 correctly (returns "0°")', () => {
    const result = formatMapTemperature(-0);
    expect(result).toBe('0°');
  });

  it('returns correct format for any number including edge cases from fast-check', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.double({ noNaN: true, noDefaultInfinity: true }),
          fc.constant(NaN),
          fc.constant(Infinity),
          fc.constant(-Infinity),
          fc.constant(-0)
        ),
        (value) => {
          const result = formatMapTemperature(value);
          if (!Number.isFinite(value)) {
            expect(result).toBe('--°');
          } else {
            expect(result).toBe(`${Math.round(value)}°`);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns correct format for null/undefined mixed with numbers', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.double({ noNaN: true, noDefaultInfinity: true, min: -100, max: 100 }).map(
            (v) => ({ input: v as number | null | undefined, isValid: true })
          ),
          fc.constant({ input: null as number | null | undefined, isValid: false }),
          fc.constant({ input: undefined as number | null | undefined, isValid: false })
        ),
        ({ input, isValid }) => {
          const result = formatMapTemperature(input);
          if (isValid && typeof input === 'number') {
            expect(result).toBe(`${Math.round(input)}°`);
          } else {
            expect(result).toBe('--°');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
