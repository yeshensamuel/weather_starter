import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { MapContent } from '../MapContent';
import { formatMapTemperature } from '../format';
import type { Location } from '../../types';

/**
 * Feature: weather-map-card, Property 5: Accessible name includes location name and temperature
 *
 * Validates: Requirements 6.6
 *
 * For any location with a non-null area name and temperature, the corresponding
 * map pin's accessible name SHALL contain both the area name and the formatted
 * temperature value.
 */

const locationWithAreaArbitrary: fc.Arbitrary<Location> = fc.record({
  id: fc.integer({ min: 1, max: 100000 }),
  latitude: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
  longitude: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
  created_at: fc.constant('2026-01-01T00:00:00Z'),
  weather: fc.record({
    condition: fc.constant('Cloudy' as string | null),
    observed_at: fc.constant('2026-01-01T00:00:00Z' as string | null),
    source: fc.constant('test' as string | null),
    area: fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.length > 0 && !s.includes('"') && !s.includes('<') && !s.includes('>')),
    valid_period_text: fc.constant('Now' as string | null),
    temperature_c: fc.double({ min: -50, max: 50, noNaN: true, noDefaultInfinity: true }),
    humidity_percent: fc.constant(70 as number | null),
    rainfall_mm: fc.constant(0 as number | null),
    wind_speed_knots: fc.constant(5 as number | null),
    wind_direction_degrees: fc.constant(180 as number | null),
    forecast_low_c: fc.constant(22 as number | null),
    forecast_high_c: fc.constant(30 as number | null),
    uv_index: fc.constant(5 as number | null),
    psi_twenty_four_hourly: fc.constant(40 as number | null),
    pm25_one_hourly: fc.constant(10 as number | null),
    air_quality_region: fc.constant('central' as string | null),
    forecast_periods: fc.constant([] as { label: string; forecast: string }[]),
    daily_forecast: fc.constant([] as { date: string; forecast: string; temperature_low_c: number | null; temperature_high_c: number | null }[]),
  }),
});

// Generate arrays of 1-10 locations with unique IDs, all having non-null area and temperature
const locationsArbitrary = fc
  .array(locationWithAreaArbitrary, { minLength: 1, maxLength: 10 })
  .map((locations) => locations.map((loc, index) => ({ ...loc, id: index + 1 })));

describe('Feature: weather-map-card, Property 5: Accessible name includes location name and temperature', () => {
  it('each pin accessible name contains both the area name and formatted temperature', () => {
    fc.assert(
      fc.property(locationsArbitrary, (locations) => {
        const { container } = render(
          <MapContent
            locations={locations}
            selectedId={null}
            onPinClick={() => {}}
          />
        );

        // Leaflet renders markers with alt attribute on img elements or aria-label on div icons
        const markerIcons = container.querySelectorAll('.leaflet-marker-icon');
        expect(markerIcons.length).toBe(locations.length);

        locations.forEach((location, index) => {
          const markerEl = markerIcons[index];
          const area = location.weather.area!;
          const temperature = formatMapTemperature(location.weather.temperature_c);

          // The inner div has aria-label with the accessible name
          const pinDiv = markerEl.querySelector('[aria-label]');
          expect(pinDiv).not.toBeNull();

          const ariaLabel = pinDiv!.getAttribute('aria-label')!;
          expect(ariaLabel).toContain(area);
          expect(ariaLabel).toContain(temperature);
        });
      }),
      { numRuns: 100 }
    );
  });
});
