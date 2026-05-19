import { useRef, useState } from 'react';
import { useStore } from '../state/store';
import { FullscreenMapView } from './FullscreenMapView';
import { MapContent } from './MapContent';

export function MapCard() {
  const { locations, selectedId, select } = useStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (locations.length === 0) {
    return null;
  }

  const handlePinClick = (locationId: number) => {
    select(locationId);
  };

  const handleMapBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only open fullscreen if the click target is the map container background,
    // not a pin/marker. Leaflet markers have their own click handlers that
    // stop propagation, so clicks that reach this handler are on the map background.
    const target = e.target as HTMLElement;
    if (target.closest('.leaflet-marker-icon')) {
      return;
    }
    setIsFullscreen(true);
  };

  const handleFullscreenClose = () => {
    setIsFullscreen(false);
    // Restore focus to the card element after fullscreen closes (Requirement 6.3)
    cardRef.current?.focus();
  };

  const handleFullscreenPinClick = (locationId: number) => {
    select(locationId);
    setIsFullscreen(false);
    cardRef.current?.focus();
  };

  return (
    <>
      <div
        ref={cardRef}
        aria-label="Weather locations map"
        tabIndex={-1}
        className="h-[300px] w-full rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl overflow-hidden"
        onClick={handleMapBackgroundClick}
      >
        <MapContent
          locations={locations}
          selectedId={selectedId}
          onPinClick={handlePinClick}
          isFullscreen={false}
        />
      </div>
      {isFullscreen && (
        <FullscreenMapView
          locations={locations}
          selectedId={selectedId}
          onPinClick={handleFullscreenPinClick}
          onClose={handleFullscreenClose}
        />
      )}
    </>
  );
}
