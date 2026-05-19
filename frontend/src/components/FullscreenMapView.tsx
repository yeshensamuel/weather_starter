import { useCallback, useEffect, useRef } from 'react';
import type { Location } from '../types';
import { MapContent } from './MapContent';

interface FullscreenMapViewProps {
  locations: Location[];
  selectedId: number | null;
  onPinClick: (locationId: number) => void;
  onClose: () => void;
}

export function FullscreenMapView({
  locations,
  selectedId,
  onPinClick,
  onClose,
}: FullscreenMapViewProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Prevent body scroll while open
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Focus the close button on mount for accessibility
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Listen for Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Focus trap: Tab/Shift+Tab cycles only through focusable elements within the overlay
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Tab') return;

      const overlay = overlayRef.current;
      if (!overlay) return;

      const focusableElements = overlay.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if focus is on first element, wrap to last
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab: if focus is on last element, wrap to first
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    },
    []
  );

  const handlePinClick = (locationId: number) => {
    onPinClick(locationId);
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-label="Fullscreen weather map"
      className="fixed inset-0 z-[9999] flex flex-col bg-black/90 animate-fullscreen-fade-in"
      onKeyDown={handleKeyDown}
    >
      {/* Close button */}
      <button
        ref={closeButtonRef}
        aria-label="Close fullscreen map view"
        onClick={onClose}
        className="absolute top-4 right-4 z-[10000] flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Map content */}
      <div className="flex-1 w-full h-full">
        <MapContent
          locations={locations}
          selectedId={selectedId}
          onPinClick={handlePinClick}
          isFullscreen={true}
        />
      </div>
    </div>
  );
}
