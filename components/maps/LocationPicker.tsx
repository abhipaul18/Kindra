'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelected: (lat: number, lng: number, address?: string) => void;
}

// Client-only Inner Leaflet Component
const MapInner = dynamic(
  () =>
    Promise.resolve(({ lat, lng, onSelect }: { lat: number; lng: number; onSelect: (l1: number, l2: number) => void }) => {
      const { MapContainer, TileLayer, Marker, useMapEvents } = require('react-leaflet');
      require('leaflet/dist/leaflet.css');
      const L = require('leaflet');

      // Fix default marker icon paths in Leaflet
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      function LocationMarker() {
        const [position, setPosition] = useState<[number, number]>([lat, lng]);
        useMapEvents({
          click(e: any) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            onSelect(e.latlng.lat, e.latlng.lng);
          },
        });

        return <Marker position={position} />;
      }

      return (
        <MapContainer center={[lat, lng]} zoom={14} style={{ height: '100%', width: '100%', borderRadius: '1rem' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      );
    }),
  { ssr: false }
);

export function LocationPicker({ initialLat = 12.9716, initialLng = 77.5946, onLocationSelected }: LocationPickerProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: initialLat, lng: initialLng });
  const [isLocating, setIsLocating] = useState(false);

  const handleSelect = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    onLocationSelected(lat, lng, `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });
          onLocationSelected(lat, lng, `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          setIsLocating(false);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setIsLocating(false);
        }
      );
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-on-surface">Location Map Pin</label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">my_location</span>
          {isLocating ? 'Detecting GPS...' : 'Use My Current Location'}
        </button>
      </div>

      <div className="w-full h-56 rounded-2xl overflow-hidden border border-outline-variant/40 shadow-sm relative">
        <MapInner lat={coords.lat} lng={coords.lng} onSelect={handleSelect} />
      </div>

      <div className="text-[11px] text-on-surface-variant flex items-center gap-1 font-medium">
        <span className="material-symbols-outlined text-sm">info</span>
        <span>Tap anywhere on the OpenStreetMap to set the precise issue location pin.</span>
      </div>
    </div>
  );
}
