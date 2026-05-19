# Requirements Document

## Introduction

This feature adds an Apple Weather-style interactive map card to the Weather Starter dashboard. The map card displays all saved locations as pins with weather labels, appears as a compact card in the main content area, and expands to a fullscreen map view on user interaction. The project already includes `leaflet` and `react-leaflet` as dependencies.

## Glossary

- **Map_Card**: A compact, rectangular UI component rendered in the dashboard content area that displays an interactive map with location pins
- **Map_Pin**: A marker placed on the map at the geographic coordinates of a saved location
- **Weather_Label**: A small overlay displayed above a Map_Pin showing the current temperature for that location
- **Fullscreen_Map_View**: An expanded overlay that takes over the viewport to display the map at full size with all pins and labels
- **Dashboard**: The main content area of the application (the Hero section and associated cards)
- **Location**: A saved geographic coordinate with associated weather data, as stored in the application state

## Requirements

### Requirement 1: Display Map Card in Dashboard

**User Story:** As a user, I want to see a map card in the dashboard, so that I can get a geographic overview of all my saved weather locations at a glance.

#### Acceptance Criteria

1. WHEN at least one Location exists, THE Map_Card SHALL render in the Dashboard content area below the hourly forecast strip
2. WHILE no Locations are saved, THE Map_Card SHALL not render in the Dashboard
3. THE Map_Card SHALL display a Leaflet tile map with one marker per saved Location placed at its latitude and longitude, with the map viewport fitted to contain all markers within the visible bounds with at least 20 pixels of padding on each side; IF only one Location is saved, THEN THE Map_Card SHALL center on that Location at a zoom level of 13
4. THE Map_Card SHALL have a fixed height of 300 pixels and occupy the full available width of the content area
5. THE Map_Card SHALL match the existing card visual style used by other dashboard cards, applying rounded corners (border-radius 1rem), a semi-transparent background, and a border consistent with the HourlyStrip and TenDayForecast cards
6. THE Map_Card SHALL allow the user to pan and zoom the map via mouse drag and scroll wheel, but SHALL disable zoom on double-click to prevent accidental zoom when selecting markers

### Requirement 2: Show Location Pins on Map

**User Story:** As a user, I want to see pins for all my saved locations on the map, so that I can visualize where my weather data points are geographically.

#### Acceptance Criteria

1. THE Map_Card SHALL display exactly one Map_Pin for each saved Location, positioned at that Location's latitude and longitude coordinates
2. WHEN a new Location is added, THE Map_Card SHALL display a Map_Pin for the new Location without requiring a page reload
3. WHEN a Location is deleted, THE Map_Card SHALL remove the corresponding Map_Pin without requiring a page reload
4. WHEN the set of saved Locations changes, THE Map_Card SHALL adjust its bounds to fit all Map_Pins within the visible map area with sufficient padding so that no Map_Pin is clipped by the map edges
5. IF only one Location is saved, THEN THE Map_Card SHALL center on that Location's coordinates and display the map at a city-level zoom (approximately zoom level 12 to 13)

### Requirement 3: Display Weather Labels Above Pins

**User Story:** As a user, I want to see the current temperature displayed above each pin, so that I can quickly compare weather across locations without selecting each one.

#### Acceptance Criteria

1. THE Map_Card SHALL display a Weather_Label positioned directly above each Map_Pin, vertically offset so that the label does not overlap the pin icon
2. THE Weather_Label SHALL show the current temperature as a rounded integer followed by a degree symbol in degrees Celsius for the corresponding Location
3. IF a Location has no temperature data available, THEN THE Weather_Label SHALL display "--°" as placeholder text
4. WHEN weather data is refreshed for a Location, THE Weather_Label SHALL update to reflect the new temperature value within the same render cycle as the data change, without requiring a page reload
5. IF two or more Weather_Labels overlap due to closely positioned Map_Pins, THEN THE Map_Card SHALL still render all Weather_Labels without truncating any label text

### Requirement 4: Expand Map Card to Fullscreen

**User Story:** As a user, I want to expand the map card to a fullscreen view, so that I can explore my locations on a larger, more detailed map.

#### Acceptance Criteria

1. WHEN the user clicks or taps the Map_Card background (outside of any Map_Pin), THE Fullscreen_Map_View SHALL open as an overlay covering 100% of the viewport width and height within 300ms
2. THE Fullscreen_Map_View SHALL display the same map tiles, Map_Pins, Weather_Labels, and map bounds as the Map_Card
3. THE Fullscreen_Map_View SHALL include a close button in the top-right corner
4. WHEN the user clicks the close button, THE Fullscreen_Map_View SHALL close and return the user to the Dashboard with the previously visible state preserved
5. WHILE the Fullscreen_Map_View is open, WHEN the user presses the Escape key, THE Fullscreen_Map_View SHALL close and return the user to the Dashboard
6. THE Fullscreen_Map_View SHALL allow pan and zoom interactions on the map with a minimum zoom level of 2 and a maximum zoom level of 18
7. WHILE the Fullscreen_Map_View is open, THE system SHALL prevent scrolling and pointer interaction with the Dashboard content behind the overlay

### Requirement 5: Select Location from Map

**User Story:** As a user, I want to tap a pin on the map to select that location, so that I can quickly navigate to its detailed weather view.

#### Acceptance Criteria

1. WHEN the user clicks a Map_Pin in the Map_Card, THE Dashboard SHALL update the selected Location to the clicked pin's Location and the Dashboard SHALL update the displayed weather details to reflect the newly selected Location
2. WHEN the user clicks a Map_Pin in the Fullscreen_Map_View, THE Fullscreen_Map_View SHALL close and the Dashboard SHALL update the selected Location to the clicked pin's Location and display that Location's weather details
3. THE Map_Pin for the currently selected Location SHALL be visually distinct from other Map_Pins by displaying a different size or color that is distinguishable without relying on color alone
4. IF the user clicks the Map_Pin that is already the currently selected Location, THEN THE Dashboard SHALL remain on the current Location's weather details with no change in state

### Requirement 6: Map Card Accessibility

**User Story:** As a user relying on assistive technology, I want the map card to be accessible, so that I can understand and interact with the map content.

#### Acceptance Criteria

1. THE Map_Card SHALL have an accessible label that conveys it is a weather locations map
2. WHILE the Fullscreen_Map_View is open, THE overlay SHALL constrain keyboard focus so that pressing Tab and Shift+Tab cycles only through focusable elements within the overlay
3. WHEN the Fullscreen_Map_View is closed, THE system SHALL return keyboard focus to the Map_Card element that triggered the overlay
4. THE close button in the Fullscreen_Map_View SHALL have an accessible label that conveys it closes the fullscreen map view
5. WHILE the Fullscreen_Map_View is open, THE overlay SHALL have an ARIA role of dialog and an accessible name identifying it as the fullscreen weather map
6. THE Map_Card SHALL provide an accessible name for each Map_Pin that includes the corresponding Location name and current temperature value
7. WHEN the user navigates to a Map_Pin via keyboard, THE Map_Pin SHALL receive visible focus indication
