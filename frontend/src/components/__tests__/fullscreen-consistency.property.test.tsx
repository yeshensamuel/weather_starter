import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { MapContent } from '../MapContent';
import type { Location } from '../../types';

/**
 * Feature: weather-map-card, Property 3: Fullscreen view content consistency
 *
 * Validates: Requirements 4.2
 *
 * For any set of locations, the fullscreen map view SHALL display the same set
 * of markers and weather labels as the compact map card — the marker count,
 * positions, and label text SHALL be identical in both views.
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

// Generate arrays of 1-20 locations with unique IDs
const locationsArbitrary = fc
  .array(locationArbitrary, { minLength: 1, maxLength: 20 })
  .map((locations) =>
    locations.map((loc, index) => ({ ...loc, id: index + 1 }))
  );

/**
 * Extracts marker data (positions and label text) from a rendered MapContent container.
 */
function extractMarkerData(container: HTMLElement) {
  const markers = container.querySelectorAll('.leaflet-marker-icon');
  const data: { position: string; labelText: string }[] = [];

  markers.forEach((marker) => {
    // Extract position from the marker's style transform/position
    const style = (marker as HTMLElement).style;
    const transform = style.transform || style.getPropertyValue('transform');
    const left = style.left;
    const top = style.top;
    const position = transform || `${left},${top}`;

    // Extract the temperature label text from the marker's inner HTML
    const labelSpan = marker.querySelector('span');
    const labelText = labelSpan?.textContent || '';

    data.push({ position, labelText });
  });

  // Sort by label text for consistent comparison (order may differ)
  return data.sort((a, b) => a.labelText.localeCompare(b.labelText) || a.position.localeCompare(b.position));
}

describe('Feature: weather-map-card, Property 3: Fullscreen view content consistency', () => {
  it('compact and fullscreen views produce identical marker count, positions, and label text', { timeout: 30000 }, () => {
    fc.assert(
      fc.property(locationsArbitrary, (locations) => {
        // Render compact view (isFullscreen=false)
        const compactResult = render(
          <MapContent
            locations={locations}
            selectedId={null}
            onPinClick={() => {}}
            isFullscreen={false}
          />
        );

        // Render fullscreen view (isFullscreen=true)
        const fullscreenResult = render(
          <MapContent
            locations={locations}
            selectedId={null}
            onPinClick={() => {}}
            isFullscreen={true}
          />
        );

        // Extract marker data from both views
        const compactMarkers = compactResult.container.querySelectorAll('.leaflet-marker-icon');
        const fullscreenMarkers = fullscreenResult.container.querySelectorAll('.leaflet-marker-icon');

        // Verify marker count is identical
        expect(compactMarkers.length).toBe(fullscreenMarkers.length);
        expect(compactMarkers.length).toBe(locations.length);

        // Extract and compare label text from both views
        const compactLabels: string[] = [];
        compactMarkers.forEach((marker) => {
          const span = marker.querySelector('span');
          compactLabels.push(span?.textContent || '');
        });

        const fullscreenLabels: string[] = [];
        fullscreenMarkers.forEach((marker) => {
          const span = marker.querySelector('span');
          fullscreenLabels.push(span?.textContent || '');
        });

        // Labels should be identical (same order since same locations array)
        expect(compactLabels).toEqual(fullscreenLabels);

        // Verify positions are identical by checking marker transforms
        const compactPositions: string[] = [];
        compactMarkers.forEach((marker) => {
          const el = marker as HTMLElement;
          compactPositions.push(el.style.transform || `${el.style.left},${el.style.top}`);
        });

        const fullscreenPositions: string[] = [];
        fullscreenMarkers.forEach((marker) => {
          const el = marker as HTMLElement;
          fullscreenPositions.push(el.style.transform || `${el.style.left},${el.style.top}`);
        });

        expect(compactPositions).toEqual(fullscreenPositions);

        // Cleanup
        compactResult.unmount();
        fullscreenResult.unmount();
      }),
      { numRuns: 100 }
    );
  });
});
