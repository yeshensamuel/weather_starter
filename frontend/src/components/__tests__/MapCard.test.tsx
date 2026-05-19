import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MapCard } from '../MapCard';
import type { Location } from '../../types';

// Mock the store
const mockSelect = vi.fn();
const mockStore = {
  locations: [] as Location[],
  selectedId: null as number | null,
  select: mockSelect,
  isAdding: false,
  isLoading: false,
  refreshingId: null,
  error: null,
  setAdding: vi.fn(),
  create: vi.fn(),
  refresh: vi.fn(),
  remove: vi.fn(),
};

vi.mock('../../state/store', () => ({
  useStore: () => mockStore,
}));

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

describe('MapCard', () => {
  beforeEach(() => {
    mockStore.locations = [];
    mockStore.selectedId = null;
    mockSelect.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Conditional rendering (Requirements 1.1, 1.2)', () => {
    it('renders null when no locations exist', () => {
      mockStore.locations = [];
      const { container } = render(<MapCard />);
      expect(container.innerHTML).toBe('');
    });

    it('renders the map card when locations exist', () => {
      mockStore.locations = [makeLocation()];
      const { container } = render(<MapCard />);
      expect(container.innerHTML).not.toBe('');
      expect(container.querySelector('[aria-label="Weather locations map"]')).not.toBeNull();
    });
  });

  describe('Card styling (Requirements 1.4, 1.5)', () => {
    it('applies correct card styling classes', () => {
      mockStore.locations = [makeLocation()];
      const { container } = render(<MapCard />);
      const card = container.querySelector('[aria-label="Weather locations map"]');
      expect(card).not.toBeNull();
      expect(card!.className).toContain('h-[300px]');
      expect(card!.className).toContain('w-full');
      expect(card!.className).toContain('rounded-2xl');
      expect(card!.className).toContain('border');
      expect(card!.className).toContain('border-white/15');
      expect(card!.className).toContain('bg-white/[0.08]');
      expect(card!.className).toContain('backdrop-blur-xl');
      expect(card!.className).toContain('overflow-hidden');
    });
  });

  describe('Accessibility attributes (Requirements 6.1)', () => {
    it('has aria-label "Weather locations map"', () => {
      mockStore.locations = [makeLocation()];
      const { container } = render(<MapCard />);
      const card = container.querySelector('[aria-label="Weather locations map"]');
      expect(card).not.toBeNull();
    });

    it('has tabIndex for focus restoration', () => {
      mockStore.locations = [makeLocation()];
      const { container } = render(<MapCard />);
      const card = container.querySelector('[aria-label="Weather locations map"]');
      expect(card).not.toBeNull();
      expect(card!.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('Pin click selection (Requirements 5.1, 5.4)', () => {
    it('calls store.select when a pin is clicked', () => {
      const loc = makeLocation({ id: 42 });
      mockStore.locations = [loc];
      mockStore.selectedId = null;

      const { container } = render(<MapCard />);
      const marker = container.querySelector('.leaflet-marker-icon');
      expect(marker).not.toBeNull();

      fireEvent.click(marker!);
      expect(mockSelect).toHaveBeenCalledWith(42);
    });

    it('calls store.select even when clicking already-selected pin (idempotent)', () => {
      const loc = makeLocation({ id: 7 });
      mockStore.locations = [loc];
      mockStore.selectedId = 7;

      const { container } = render(<MapCard />);
      const marker = container.querySelector('.leaflet-marker-icon');
      expect(marker).not.toBeNull();

      fireEvent.click(marker!);
      // select is still called - the store handles idempotency
      expect(mockSelect).toHaveBeenCalledWith(7);
    });
  });

  describe('Selected pin visual distinction (Requirement 5.3)', () => {
    it('selected pin marker has scale transform applied', () => {
      const loc = makeLocation({ id: 1 });
      mockStore.locations = [loc];
      mockStore.selectedId = 1;

      const { container } = render(<MapCard />);
      const marker = container.querySelector('.leaflet-marker-icon');
      expect(marker).not.toBeNull();

      // The selected marker's inner div should have scale(1.4) style
      const pinDiv = marker!.querySelector('.location-marker-pin');
      expect(pinDiv).not.toBeNull();
      expect((pinDiv as HTMLElement).style.transform).toContain('scale(1.4)');
    });

    it('non-selected pin marker does not have scale transform', () => {
      const loc = makeLocation({ id: 1 });
      mockStore.locations = [loc];
      mockStore.selectedId = 99; // different id

      const { container } = render(<MapCard />);
      const marker = container.querySelector('.leaflet-marker-icon');
      expect(marker).not.toBeNull();

      const pinDiv = marker!.querySelector('.location-marker-pin');
      expect(pinDiv).not.toBeNull();
      expect((pinDiv as HTMLElement).style.transform).not.toContain('scale(1.4)');
    });
  });

  describe('Fullscreen open behavior (Requirement 4.1)', () => {
    it('opens fullscreen when map background is clicked', () => {
      mockStore.locations = [makeLocation()];
      const { container } = render(<MapCard />);
      const card = container.querySelector('[aria-label="Weather locations map"]');
      expect(card).not.toBeNull();

      // Click the card (simulating a background click)
      fireEvent.click(card!);

      // Fullscreen overlay should now be rendered
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).not.toBeNull();
      expect(dialog!.getAttribute('aria-label')).toBe('Fullscreen weather map');
    });
  });
});
