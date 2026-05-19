import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import type { Location } from '../types';

interface BoundsUpdaterProps {
  locations: Location[];
}

export function BoundsUpdater({ locations }: BoundsUpdaterProps): null {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 0) return;

    if (locations.length === 1) {
      const { latitude, longitude } = locations[0];
      map.setView([latitude, longitude], 13);
    } else {
      const bounds: LatLngBoundsExpression = locations.map((loc) => [
        loc.latitude,
        loc.longitude,
      ] as [number, number]);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [locations, map]);

  return null;
}
