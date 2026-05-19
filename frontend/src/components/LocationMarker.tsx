import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import type { Location } from '../types';
import { formatMapTemperature } from './format';

interface LocationMarkerProps {
  location: Location;
  isSelected: boolean;
  onClick: () => void;
}

export function LocationMarker({ location, isSelected, onClick }: LocationMarkerProps) {
  const temperature = formatMapTemperature(location.weather.temperature_c);

  const area = location.weather.area;
  const altText = area
    ? `${area} ${temperature}`
    : `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)} ${temperature}`;

  const icon = useMemo(() => {
    const scale = isSelected ? 'transform: scale(1.4);' : '';
    return new DivIcon({
      className: 'location-marker-icon',
      html: `
        <div
          class="location-marker-pin"
          tabindex="0"
          role="button"
          aria-label="${altText.replace(/"/g, '&quot;')}"
          style="display:flex;flex-direction:column;align-items:center;${scale}outline:none;"
        >
          <span style="font-size:12px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,0.8);white-space:nowrap;">${temperature}</span>
          <div style="width:12px;height:12px;border-radius:50%;background:#3b82f6;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>
        </div>
      `,
      iconSize: [40, 36],
      iconAnchor: [20, 36],
    });
  }, [isSelected, temperature, altText]);

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={icon}
      alt={altText}
      eventHandlers={{
        click: (e) => {
          e.originalEvent.stopPropagation();
          onClick();
        },
        keypress: (e) => {
          if (e.originalEvent.key === 'Enter' || e.originalEvent.key === ' ') {
            e.originalEvent.preventDefault();
            onClick();
          }
        },
      }}
    />
  );
}
