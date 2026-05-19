import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MapContent } from '../MapContent';
import type { Location } from '../../types';

function makeLocation(overrides?: Partial<Location>): Location {
  return {
    id: 1,
    latitude: 1.35,
    longitude: 103.82,
    created_at: '2026-01-01T00:00:00Z',
    weather: {
      condition: 'Cloudy',
      observed_at: '2026-01-01T00:00:00Z',
      source: 'test',
      area: 'Orchard',
      valid_period_text: 'Now',
      temperature_c: 28,
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
    },
    ...overrides,
  };
}

describe('MapContent', () => {
  describe('Marker rendering (Requirements 1.3, 2.1)', () => {
    it('renders one marker per location', () => {
      const locations = [
        makeLocation({ id: 1, latitude: 1.35, longitude: 103.82 }),
        makeLocation({ id: 2, latitude: 1.30, longitude: 103.85 }),
        makeLocation({ id: 3, latitude: 1.40, longitude: 103.90 }),
      ];

      const { container } = render(
        <MapContent
          locations={locations}
          selectedId={null}
          onPinClick={() => {}}
        />
      );

      const markers = container.querySelectorAll('.leaflet-marker-icon');
      expect(markers.length).toBe(3);
    });

    it('renders no markers when locations array is empty', () => {
      const { container } = render(
        <MapContent
          locations={[]}
          selectedId={null}
          onPinClick={() => {}}
        />
      );

      const markers = container.querySelectorAll('.leaflet-marker-icon');
      expect(markers.length).toBe(0);
    });
  });

  describe('Temperature labels (Requirements 3.2, 3.3)', () => {
    it('displays formatted temperature in marker label', () => {
      const locations = [makeLocation({ id: 1, weather: { ...makeLocation().weather, temperature_c: 25.7 } })];

      const { container } = render(
        <MapContent
          locations={locations}
          selectedId={null}
          onPinClick={() => {}}
        />
      );

      const marker = container.querySelector('.leaflet-marker-icon');
      expect(marker).not.toBeNull();
      const span = marker!.querySelector('span');
      expect(span).not.toBeNull();
      expect(span!.textContent).toBe('26°');
    });

    it('displays "--°" when temperature is null', () => {
      const locations = [makeLocation({ id: 1, weather: { ...makeLocation().weather, temperature_c: null } })];

      const { container } = render(
        <MapContent
          locations={locations}
          selectedId={null}
          onPinClick={() => {}}
        />
      );

      const marker = container.querySelector('.leaflet-marker-icon');
      expect(marker).not.toBeNull();
      const span = marker!.querySelector('span');
      expect(span).not.toBeNull();
      expect(span!.textContent).toBe('--°');
    });
  });

  describe('Selected pin visual distinction (Requirement 5.3)', () => {
    it('selected marker has scale(1.4) applied', () => {
      const locations = [
        makeLocation({ id: 1 }),
        makeLocation({ id: 2, latitude: 1.30, longitude: 103.85 }),
      ];

      const { container } = render(
        <MapContent
          locations={locations}
          selectedId={1}
          onPinClick={() => {}}
        />
      );

      const markers = container.querySelectorAll('.leaflet-marker-icon');
      expect(markers.length).toBe(2);

      // First marker (id=1) should be selected
      const selectedPin = markers[0].querySelector('.location-marker-pin') as HTMLElement;
      expect(selectedPin.style.transform).toContain('scale(1.4)');

      // Second marker (id=2) should not be selected
      const unselectedPin = markers[1].querySelector('.location-marker-pin') as HTMLElement;
      expect(unselectedPin.style.transform).not.toContain('scale(1.4)');
    });
  });

  describe('Pin click callback (Requirements 5.1, 5.2)', () => {
    it('calls onPinClick with correct location id when marker is clicked', () => {
      const onPinClick = vi.fn();
      const locations = [
        makeLocation({ id: 10 }),
        makeLocation({ id: 20, latitude: 1.30, longitude: 103.85 }),
      ];

      const { container } = render(
        <MapContent
          locations={locations}
          selectedId={null}
          onPinClick={onPinClick}
        />
      );

      const markers = container.querySelectorAll('.leaflet-marker-icon');
      expect(markers.length).toBe(2);

      // Click the second marker
      const { fireEvent } = require('@testing-library/react');
      fireEvent.click(markers[1]);
      expect(onPinClick).toHaveBeenCalledWith(20);
    });
  });

  describe('Accessibility (Requirement 6.6)', () => {
    it('marker has accessible name with area and temperature', () => {
      const locations = [makeLocation({ id: 1, weather: { ...makeLocation().weather, area: 'Marina Bay', temperature_c: 30 } })];

      const { container } = render(
        <MapContent
          locations={locations}
          selectedId={null}
          onPinClick={() => {}}
        />
      );

      const marker = container.querySelector('.leaflet-marker-icon');
      expect(marker).not.toBeNull();
      const pinDiv = marker!.querySelector('.location-marker-pin');
      expect(pinDiv).not.toBeNull();
      expect(pinDiv!.getAttribute('aria-label')).toBe('Marina Bay 30°');
    });

    it('marker uses coordinates as fallback when area is null', () => {
      const locations = [makeLocation({ id: 1, latitude: 1.35, longitude: 103.82, weather: { ...makeLocation().weather, area: null, temperature_c: 25 } })];

      const { container } = render(
        <MapContent
          locations={locations}
          selectedId={null}
          onPinClick={() => {}}
        />
      );

      const marker = container.querySelector('.leaflet-marker-icon');
      expect(marker).not.toBeNull();
      const pinDiv = marker!.querySelector('.location-marker-pin');
      expect(pinDiv).not.toBeNull();
      expect(pinDiv!.getAttribute('aria-label')).toBe('1.350, 103.820 25°');
    });
  });
});
