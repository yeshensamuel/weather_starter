import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { MapContent } from '../MapContent';
import { FullscreenMapView } from '../FullscreenMapView';
import type { Location } from '../../types';

/**
 * Feature: weather-map-card, Property 4: Pin click selects location
 *
 * Validates: Requirements 5.1, 5.2
 *
 * For any location in the locations array and for any map view (compact or fullscreen),
 * clicking that location's pin SHALL result in the onPinClick callback being called
 * with that location's id.
 */

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

// Generate arrays of 1-20 locations with unique IDs, plus a random target index
const locationsWithTargetArbitrary = fc
  .array(locationArbitrary, { minLength: 1, maxLength: 20 })
  .map((locations) => locations.map((loc, index) => ({ ...loc, id: index + 1 })))
  .chain((locations) =>
    fc.record({
      locations: fc.constant(locations),
      targetIndex: fc.integer({ min: 0, max: locations.length - 1 }),
    })
  );

describe('Feature: weather-map-card, Property 4: Pin click selects location', () => {
  it('clicking a pin in compact view calls onPinClick with the correct location id', () => {
    fc.assert(
      fc.property(locationsWithTargetArbitrary, ({ locations, targetIndex }) => {
        const onPinClick = vi.fn();
        const targetLocation = locations[targetIndex];

        const { container } = render(
          <MapContent
            locations={locations}
            selectedId={null}
            onPinClick={onPinClick}
            isFullscreen={false}
          />
        );

        // Leaflet renders markers with class 'leaflet-marker-icon'
        const markers = container.querySelectorAll('.leaflet-marker-icon');
        expect(markers.length).toBe(locations.length);

        // Click the target marker
        fireEvent.click(markers[targetIndex]);

        // Verify onPinClick was called with the correct location id
        expect(onPinClick).toHaveBeenCalledWith(targetLocation.id);
      }),
      { numRuns: 100 }
    );
  });

  it('clicking a pin in fullscreen view calls onPinClick with the correct location id', () => {
    fc.assert(
      fc.property(locationsWithTargetArbitrary, ({ locations, targetIndex }) => {
        const onPinClick = vi.fn();
        const onClose = vi.fn();
        const targetLocation = locations[targetIndex];

        const { container } = render(
          <FullscreenMapView
            locations={locations}
            selectedId={null}
            onPinClick={onPinClick}
            onClose={onClose}
          />
        );

        // Leaflet renders markers with class 'leaflet-marker-icon'
        const markers = container.querySelectorAll('.leaflet-marker-icon');
        expect(markers.length).toBe(locations.length);

        // Click the target marker
        fireEvent.click(markers[targetIndex]);

        // Verify onPinClick was called with the correct location id
        expect(onPinClick).toHaveBeenCalledWith(targetLocation.id);
      }),
      { numRuns: 100 }
    );
  });
});
