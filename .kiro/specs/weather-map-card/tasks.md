# Implementation Plan: Weather Map Card

## Overview

This plan implements an interactive Leaflet-based map card for the Weather Starter dashboard. The map displays saved locations as pins with temperature labels, supports fullscreen expansion, and allows location selection via pin clicks. The implementation uses the existing `react-leaflet` and `leaflet` dependencies, integrates with the `StoreProvider` context, and follows the established card styling pattern.

## Tasks

- [x] 1. Set up core utilities and shared components
  - [x] 1.1 Add `formatMapTemperature` utility to `format.ts`
    - Add a `formatMapTemperature` function to `frontend/src/components/format.ts`
    - Returns `Math.round(value) + "°"` for valid finite numbers
    - Returns `"--°"` for null, undefined, NaN, or Infinity
    - _Requirements: 3.2, 3.3_

  - [x] 1.2 Create the `BoundsUpdater` component
    - Create `frontend/src/components/BoundsUpdater.tsx`
    - Use `useMap()` hook from react-leaflet to access the map instance
    - When locations array changes: call `map.fitBounds()` with all marker positions and `{ padding: [20, 20] }` for multiple locations
    - When only one location exists: call `map.setView([lat, lng], 13)`
    - Return `null` (render nothing)
    - _Requirements: 1.3, 2.4, 2.5_

  - [x] 1.3 Create the `LocationMarker` component
    - Create `frontend/src/components/LocationMarker.tsx`
    - Render a `Marker` from react-leaflet at `[location.latitude, location.longitude]`
    - Use a custom `DivIcon` that renders the temperature label (using `formatMapTemperature`) above a pin indicator
    - Apply a larger/scaled style when `isSelected` is true (visually distinct without relying on color alone)
    - Set the marker's `alt` attribute to `"{area} {temperature}"` for accessibility (use formatted coordinates as fallback if area is null)
    - Attach `onClick` handler via react-leaflet's `eventHandlers={{ click: onClick }}`
    - Stop click event propagation so pin clicks don't trigger the map background click
    - _Requirements: 2.1, 3.1, 3.2, 3.3, 5.3, 6.6_

- [x] 2. Implement the MapContent shared component
  - [x] 2.1 Create the `MapContent` component
    - Create `frontend/src/components/MapContent.tsx`
    - Render `MapContainer` from react-leaflet with OpenStreetMap `TileLayer`
    - Accept `locations`, `selectedId`, `onPinClick`, and `isFullscreen` props
    - Render one `LocationMarker` per location
    - Include `BoundsUpdater` to handle automatic bounds fitting
    - Set `doubleClickZoom={false}` in compact mode (when `isFullscreen` is false)
    - Set `minZoom={2}` and `maxZoom={18}` in fullscreen mode
    - Set `scrollWheelZoom={true}` and `dragging={true}` for pan/zoom support
    - _Requirements: 1.3, 1.6, 2.1, 3.1, 4.2, 4.6_

  - [x] 2.2 Write property test: Marker count equals location count (Property 1)
    - **Property 1: Marker count equals location count**
    - Generate random arrays of 1–20 locations with random lat/lng using fast-check
    - Verify that MapContent renders exactly one marker per location
    - **Validates: Requirements 1.3, 2.1**

  - [x] 2.3 Write property test: Temperature label formatting (Property 2)
    - **Property 2: Temperature label formatting**
    - Generate random numbers (including edge cases like -0, NaN, Infinity) and null/undefined using fast-check
    - Verify `formatMapTemperature` returns correct formatted string
    - **Validates: Requirements 3.2, 3.3**

- [x] 3. Implement the MapCard component
  - [x] 3.1 Create the `MapCard` component
    - Create `frontend/src/components/MapCard.tsx`
    - Read `locations` and `selectedId` from `useStore()`
    - Return `null` when `locations` is empty
    - Render a container with fixed height of 300px, full width, and the existing card styling: `rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl overflow-hidden`
    - Render `MapContent` inside the container with `isFullscreen={false}`
    - Manage local `isFullscreen` state via `useState`
    - Handle click on map background (not on pins) to open fullscreen view
    - Add `aria-label="Weather locations map"` to the card container
    - Store a ref to the card element for focus restoration after fullscreen closes
    - On pin click in compact mode: call `store.select(locationId)` (Requirement 5.1)
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 5.1, 5.4, 6.1_

  - [x] 3.2 Integrate `MapCard` into the `Hero` component
    - Import `MapCard` in `frontend/src/components/Hero.tsx`
    - Place `<MapCard />` between `<HourlyStrip>` and `<TenDayForecast>` in the layout
    - _Requirements: 1.1_

- [x] 4. Checkpoint - Verify compact map renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement the FullscreenMapView component
  - [x] 5.1 Create the `FullscreenMapView` component
    - Create `frontend/src/components/FullscreenMapView.tsx`
    - Render a fixed-position overlay covering 100vw × 100vh with a high z-index
    - Include `MapContent` with `isFullscreen={true}`
    - Add a close button in the top-right corner with `aria-label="Close fullscreen map view"`
    - Implement focus trap: Tab/Shift+Tab cycles only through focusable elements within the overlay
    - Listen for Escape key to trigger `onClose`
    - Prevent body scroll while open (set `document.body.style.overflow = 'hidden'` on mount, restore on unmount)
    - Set `role="dialog"` and `aria-label="Fullscreen weather map"` on the overlay container
    - On close: call `onClose` which restores focus to the MapCard trigger element
    - On pin click in fullscreen: call `onPinClick(locationId)` which should close fullscreen and select the location (Requirement 5.2)
    - Apply a transition/animation for the overlay appearing within 300ms
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.2, 6.2, 6.3, 6.4, 6.5_

  - [x] 5.2 Wire FullscreenMapView into MapCard
    - In `MapCard`, conditionally render `<FullscreenMapView>` when `isFullscreen` is true
    - Pass `onClose` handler that sets `isFullscreen` to false and restores focus to the card ref
    - Pass `onPinClick` handler that selects the location via `store.select()` and closes fullscreen
    - _Requirements: 4.1, 4.4, 5.2, 6.3_

  - [x] 5.3 Write property test: Fullscreen view content consistency (Property 3)
    - **Property 3: Fullscreen view content consistency**
    - Generate random location sets using fast-check
    - Verify both compact and fullscreen views produce identical marker count, positions, and label text
    - **Validates: Requirements 4.2**

  - [x] 5.4 Write property test: Pin click selects location (Property 4)
    - **Property 4: Pin click selects location**
    - Generate random location sets with a random target pin using fast-check
    - Simulate click on the target pin in both compact and fullscreen views
    - Verify `store.select` is called with the correct location id
    - **Validates: Requirements 5.1, 5.2**

- [x] 6. Checkpoint - Verify fullscreen and interactions work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Accessibility and polish
  - [x] 7.1 Implement keyboard focus management and accessibility attributes
    - Ensure MapCard has `aria-label="Weather locations map"`
    - Ensure each LocationMarker has an accessible name with location area and temperature
    - Ensure FullscreenMapView has `role="dialog"` and `aria-label="Fullscreen weather map"`
    - Ensure focus trap works correctly in fullscreen (Tab/Shift+Tab cycle within overlay)
    - Ensure focus returns to MapCard trigger element when fullscreen closes
    - Ensure close button has `aria-label="Close fullscreen map view"`
    - Add visible focus indication on map pins when navigated via keyboard
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 7.2 Write property test: Accessible name includes location name and temperature (Property 5)
    - **Property 5: Accessible name includes location name and temperature**
    - Generate random locations with random area names and temperatures using fast-check
    - Verify each pin's accessible name contains both the area name and formatted temperature
    - **Validates: Requirements 6.6**

  - [x] 7.3 Write unit tests for MapCard, MapContent, and FullscreenMapView
    - Create test files in `frontend/src/components/__tests__/`
    - Test conditional rendering (renders when locations exist, null when empty)
    - Test card styling classes
    - Test fullscreen open/close/escape behavior
    - Test scroll lock on body while fullscreen is open
    - Test selected pin visual distinction
    - Test idempotent selection (clicking already-selected pin)
    - Test accessibility attributes (aria-label, role, focus trap, focus restoration)
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 4.1, 4.3, 4.5, 4.7, 5.3, 5.4, 6.1–6.7_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using `fast-check`
- Unit tests validate specific examples and edge cases
- The existing `leaflet` and `react-leaflet` packages are already installed — no dependency installation needed
- The `formatMapTemperature` function can reuse the same logic pattern as the existing `formatTemperature` in `format.ts`
- Leaflet CSS must be imported (either in the component or globally) for proper map rendering

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.1"] },
    { "id": 3, "tasks": ["3.2"] },
    { "id": 4, "tasks": ["5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "5.4"] },
    { "id": 6, "tasks": ["7.1"] },
    { "id": 7, "tasks": ["7.2", "7.3"] }
  ]
}
```
