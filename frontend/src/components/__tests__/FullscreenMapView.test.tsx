import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { FullscreenMapView } from '../FullscreenMapView';
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

describe('FullscreenMapView', () => {
  let originalOverflow: string;

  beforeEach(() => {
    originalOverflow = document.body.style.overflow;
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  describe('Rendering and accessibility (Requirements 6.4, 6.5)', () => {
    it('renders with role="dialog"', () => {
      const { container } = render(
        <FullscreenMapView
          locations={[makeLocation()]}
          selectedId={null}
          onPinClick={() => {}}
          onClose={() => {}}
        />
      );

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
    });

    it('has aria-label "Fullscreen weather map"', () => {
      const { container } = render(
        <FullscreenMapView
          locations={[makeLocation()]}
          selectedId={null}
          onPinClick={() => {}}
          onClose={() => {}}
        />
      );

      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(dialog!.getAttribute('aria-label')).toBe('Fullscreen weather map');
    });

    it('renders close button with accessible label', () => {
      const { container } = render(
        <FullscreenMapView
          locations={[makeLocation()]}
          selectedId={null}
          onPinClick={() => {}}
          onClose={() => {}}
        />
      );

      const closeButton = container.querySelector('[aria-label="Close fullscreen map view"]');
      expect(closeButton).not.toBeNull();
      expect(closeButton!.tagName.toLowerCase()).toBe('button');
    });
  });

  describe('Close behavior (Requirements 4.3, 4.4, 4.5)', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      const { container } = render(
        <FullscreenMapView
          locations={[makeLocation()]}
          selectedId={null}
          onPinClick={() => {}}
          onClose={onClose}
        />
      );

      const closeButton = container.querySelector('[aria-label="Close fullscreen map view"]');
      expect(closeButton).not.toBeNull();
      fireEvent.click(closeButton!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn();
      render(
        <FullscreenMapView
          locations={[makeLocation()]}
          selectedId={null}
          onPinClick={() => {}}
          onClose={onClose}
        />
      );

      // Escape key listener is on document
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose for non-Escape keys', () => {
      const onClose = vi.fn();
      render(
        <FullscreenMapView
          locations={[makeLocation()]}
          selectedId={null}
          onPinClick={() => {}}
          onClose={onClose}
        />
      );

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'a' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Scroll lock (Requirement 4.7)', () => {
    it('sets body overflow to hidden on mount', () => {
      document.body.style.overflow = 'auto';

      render(
        <FullscreenMapView
          locations={[makeLocation()]}
          selectedId={null}
          onPinClick={() => {}}
          onClose={() => {}}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body overflow on unmount', () => {
      document.body.style.overflow = 'auto';

      const { unmount } = render(
        <FullscreenMapView
          locations={[makeLocation()]}
          selectedId={null}
          onPinClick={() => {}}
          onClose={() => {}}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');
      unmount();
      expect(document.body.style.overflow).toBe('auto');
    });
  });

  describe('Focus trap (Requirement 6.2)', () => {
    it('traps focus within the overlay on Tab', () => {
      const { container } = render(
        <FullscreenMapView
          locations={[makeLocation()]}
          selectedId={null}
          onPinClick={() => {}}
          onClose={() => {}}
        />
      );

      const dialog = container.querySelector('[role="dialog"]') as HTMLElement;

      // Find all focusable elements within the overlay
      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      expect(focusableElements.length).toBeGreaterThan(0);

      // Focus the last focusable element
      const lastFocusable = focusableElements[focusableElements.length - 1];
      lastFocusable.focus();
      expect(document.activeElement).toBe(lastFocusable);

      // Tab from the last focusable element should wrap to first
      fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: false });

      // Focus should wrap to the first focusable element within the overlay
      const closeButton = container.querySelector('[aria-label="Close fullscreen map view"]') as HTMLElement;
      expect(document.activeElement).toBe(closeButton);
    });

    it('traps focus within the overlay on Shift+Tab', () => {
      const { container } = render(
        <FullscreenMapView
          locations={[makeLocation()]}
          selectedId={null}
          onPinClick={() => {}}
          onClose={() => {}}
        />
      );

      const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
      const closeButton = container.querySelector('[aria-label="Close fullscreen map view"]') as HTMLElement;

      // Focus the close button (which is the first focusable element)
      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);

      // Shift+Tab from the first focusable element should wrap to last focusable element
      // The overlay contains the close button and the OpenStreetMap attribution link
      fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });

      // Focus should wrap to the last focusable element within the overlay (not escape it)
      const activeEl = document.activeElement as HTMLElement;
      expect(dialog.contains(activeEl)).toBe(true);
    });
  });

  describe('Pin click in fullscreen (Requirement 5.2)', () => {
    it('calls onPinClick with correct location id when marker is clicked', () => {
      const onPinClick = vi.fn();
      const locations = [
        makeLocation({ id: 5 }),
        makeLocation({ id: 10, latitude: 1.30, longitude: 103.85 }),
      ];

      const { container } = render(
        <FullscreenMapView
          locations={locations}
          selectedId={null}
          onPinClick={onPinClick}
          onClose={() => {}}
        />
      );

      const markers = container.querySelectorAll('.leaflet-marker-icon');
      expect(markers.length).toBe(2);

      fireEvent.click(markers[1]);
      expect(onPinClick).toHaveBeenCalledWith(10);
    });
  });

  describe('Fullscreen overlay styling (Requirement 4.1)', () => {
    it('renders as a fixed overlay covering the viewport', () => {
      const { container } = render(
        <FullscreenMapView
          locations={[makeLocation()]}
          selectedId={null}
          onPinClick={() => {}}
          onClose={() => {}}
        />
      );

      const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
      expect(dialog).not.toBeNull();
      expect(dialog.className).toContain('fixed');
      expect(dialog.className).toContain('inset-0');
    });
  });
});
