import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import type { Location } from '../types';
import { BoundsUpdater } from './BoundsUpdater';
import { LocationMarker } from './LocationMarker';

interface MapContentProps {
  locations: Location[];
  selectedId: number | null;
  onPinClick: (locationId: number) => void;
  isFullscreen?: boolean;
}

export function MapContent({
  locations,
  selectedId,
  onPinClick,
  isFullscreen = false,
}: MapContentProps) {
  const defaultCenter: [number, number] = [1.35, 103.82];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
      doubleClickZoom={isFullscreen}
      scrollWheelZoom={true}
      dragging={true}
      minZoom={isFullscreen ? 2 : undefined}
      maxZoom={isFullscreen ? 18 : undefined}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <BoundsUpdater locations={locations} />
      {locations.map((location) => (
        <LocationMarker
          key={location.id}
          location={location}
          isSelected={location.id === selectedId}
          onClick={() => onPinClick(location.id)}
        />
      ))}
    </MapContainer>
  );
}
