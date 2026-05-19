import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { MapContent } from '../MapContent';
import type { Location, WeatherSnapshot } from '../../types';

/**
 * Feature: weather-map-card, Property 1: Marker count equals location count
 *
 * Validates: Requirements 1.3, 2.1
 *
 * For any non-empty array of locations, the MapContent component SHALL render
 * exactly one marker for each location in the array.
 */

function makeWeatherSnapshot(overrides?: Partial<WeatherSnapshot>): WeatherSnapshot {
  return {
    condition: 'Cloudy',
    observed_at: '2026-01-01T00:00:00Z',
    source: 'test',
    area: 'Test Area',
    valid_period_text: 'Now',
    temperature_c: 25,
    humidity_percent: 70,
    rainfall_mm: 0,
    wind_speed_knots: 5,
    wind_direction_degrees: 180,
    forecast_low_c: 22,
    forecast_high_c: 30,
    uv_index: 5,
    psi_twenty_four_hourly: 40,
    pm25_one_hourly: 10,
    air_quality_region: 'central',
    forecast_periods: [],
    daily_forecast: [],
    ...overrides,
  };
}

const locationArbitrary: fc.Arbitrary<Location> = fc.record({
  id: fc.integer({ min: 1, max: 100000 }),
  latitude: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
  longitude: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
  created_at: fc.constant('2026-01-01T00:00:00Z'),
  weather: fc.record({
    condition: fc.constant('Cloudy' as string | null),
    observed_at: fc.constant('2026-01-01T00:00:00Z' as string | null),
    source: fc.constant('test' as string | null),
    area: fc.oneof(fc.string({ minLength: 1, maxLength: 20 }), fc.constant(null as string | null)),
    valid_period_text: fc.constant('Now' as string | null),
    temperature_c: fc.oneof(
      fc.double({ min: -50, max: 50, noNaN: true, noDefaultInfinity: true }),
      fc.constant(null as number | null)
    ),
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

// Generate arrays of 1-20 locations with unique IDs
const locationsArbitrary = fc
  .array(locationArbitrary, { minLength: 1, maxLength: 20 })
  .map((locations) =>
    locations.map((loc, index) => ({ ...loc, id: index + 1 }))
  );

describe('Feature: weather-map-card, Property 1: Marker count equals location count', () => {
  it('renders exactly one marker per location for any valid location array', () => {
    fc.assert(
      fc.property(locationsArbitrary, (locations) => {
        const { container } = render(
          <MapContent
            locations={locations}
            selectedId={null}
            onPinClick={() => {}}
          />
        );

        // Leaflet renders each marker with the class 'leaflet-marker-icon'
        const markers = container.querySelectorAll('.leaflet-marker-icon');
        expect(markers.length).toBe(locations.length);
      }),
      { numRuns: 100 }
    );
  });
});
