'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  useGeolocation,
  calculateHaversineDistance,
  calculateCompassBearing,
  calculateTravelEstimates,
} from '@/hooks/useGeolocation';

interface LiveMapProps {
  targetLat?: number;
  targetLng?: number;
  locationName?: string;
  className?: string;
  zoom?: number;
  showRoute?: boolean;
  onLiveLocationChange?: (lat: number, lng: number, accuracy: number | null, isManual: boolean) => void;
}

const LeafletMapInner = dynamic(
  () =>
    Promise.resolve(
      ({
        targetLat,
        targetLng,
        userLat,
        userLng,
        accuracy,
        locationName,
        zoom,
        showRoute,
        onMapClick,
      }: {
        targetLat?: number;
        targetLng?: number;
        userLat: number | null;
        userLng: number | null;
        accuracy: number | null;
        locationName?: string;
        zoom: number;
        showRoute: boolean;
        onMapClick: (lat: number, lng: number) => void;
      }) => {
        const { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } = require('react-leaflet');
        require('leaflet/dist/leaflet.css');
        const L = require('leaflet');

        // Destination Marker Icon
        const missionIcon = L.divIcon({
          className: 'custom-mission-marker',
          html: `
            <div style="background-color: #004287; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.35);">
              <span class="material-symbols-outlined" style="font-size: 22px;">location_on</span>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38],
        });

        // User Live GPS Icon (Pulsing Green)
        const userGpsIcon = L.divIcon({
          className: 'custom-user-gps-marker',
          html: `
            <div style="position: relative; width: 32px; height: 32px;">
              <div style="position: absolute; width: 100%; height: 100%; background-color: #006c48; border-radius: 50%; opacity: 0.35; animation: ping 1.5s infinite;"></div>
              <div style="position: absolute; width: 20px; height: 20px; top: 6px; left: 6px; background-color: #006c48; border: 3px solid white; border-radius: 50%; box-shadow: 0 3px 10px rgba(0,0,0,0.4);"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        // Map Click Listener for Manual Fallback Location Selection
        function MapEventsHandler() {
          useMapEvents({
            click(e: { latlng: { lat: number; lng: number } }) {
              onMapClick(e.latlng.lat, e.latlng.lng);
            },
          });
          return null;
        }

        // Camera Controller Component
        function MapViewController({ cLat, cLng, zLevel }: { cLat: number; cLng: number; zLevel: number }) {
          const map = useMap();
          useEffect(() => {
            map.flyTo([cLat, cLng], zLevel, { duration: 1.2 });
          }, [cLat, cLng, zLevel, map]);
          return null;
        }

        const effectiveTargetLat = targetLat !== undefined ? targetLat : userLat || 12.9716;
        const effectiveTargetLng = targetLng !== undefined ? targetLng : userLng || 77.5946;

        const centerLat = userLat !== null ? userLat : effectiveTargetLat;
        const centerLng = userLng !== null ? userLng : effectiveTargetLng;

        const routePositions: [number, number][] =
          userLat !== null && userLng !== null && targetLat !== undefined && targetLng !== undefined
            ? [
                [userLat, userLng],
                [targetLat, targetLng],
              ]
            : [];

        return (
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={zoom}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%', borderRadius: '1rem', zIndex: 1 }}
          >
            <MapEventsHandler />
            <MapViewController cLat={centerLat} cLng={centerLng} zLevel={zoom} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Polyline Route Line from User Live GPS to Mission Destination */}
            {showRoute && routePositions.length === 2 && (
              <Polyline
                positions={routePositions}
                pathOptions={{
                  color: '#004287',
                  weight: 4,
                  dashArray: '8, 8',
                  opacity: 0.8,
                }}
              />
            )}

            {/* Destination Marker */}
            {targetLat !== undefined && targetLng !== undefined && (
              <Marker position={[targetLat, targetLng]} icon={missionIcon}>
                {locationName && (
                  <Popup>
                    <div className="font-sans text-xs">
                      <strong className="text-primary font-bold">{locationName}</strong>
                      <p className="text-[10px] text-gray-600 m-0">Destination Location</p>
                    </div>
                  </Popup>
                )}
              </Marker>
            )}

            {/* User Live GPS Marker */}
            {userLat !== null && userLng !== null && (
              <Marker position={[userLat, userLng]} icon={userGpsIcon}>
                <Popup>
                  <div className="font-sans text-xs">
                    <strong className="text-secondary font-bold">Your Live Location</strong>
                    <p className="text-[10px] text-gray-600 m-0">
                      Lat: {userLat.toFixed(4)}, Lng: {userLng.toFixed(4)}
                    </p>
                    {accuracy && (
                      <p className="text-[9px] text-gray-500 m-0">Accuracy: ±{accuracy.toFixed(0)}m</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        );
      }
    ),
  { ssr: false }
);

export function LiveMap({
  targetLat,
  targetLng,
  locationName = 'Civic Mission Site',
  className = 'h-64 w-full',
  zoom = 15,
  showRoute = true,
  onLiveLocationChange,
}: LiveMapProps) {
  const {
    coords,
    status,
    isManualFallback,
    errorMessage,
    requestPermissionAndStart,
    setManualLocation,
  } = useGeolocation(true);

  const userLat = coords?.lat ?? null;
  const userLng = coords?.lng ?? null;

  // Emit coordinate updates to parent
  useEffect(() => {
    if (userLat !== null && userLng !== null && onLiveLocationChange) {
      onLiveLocationChange(userLat, userLng, coords?.accuracy ?? null, isManualFallback);
    }
  }, [userLat, userLng, coords?.accuracy, isManualFallback, onLiveLocationChange]);

  // Route & Travel Calculations
  let distanceInfo = null;
  let bearingText = '';

  if (userLat !== null && userLng !== null && targetLat !== undefined && targetLng !== undefined) {
    const distKm = calculateHaversineDistance(userLat, userLng, targetLat, targetLng);
    distanceInfo = calculateTravelEstimates(distKm, 'walking');
    bearingText = calculateCompassBearing(userLat, userLng, targetLat, targetLng);
  }

  const handleManualMapClick = (lat: number, lng: number) => {
    setManualLocation(lat, lng);
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-md border border-outline-variant/40 flex flex-col ${className}`}>
      {/* Map Rendering Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[160px]">
        <LeafletMapInner
          targetLat={targetLat}
          targetLng={targetLng}
          userLat={userLat}
          userLng={userLng}
          accuracy={coords?.accuracy ?? null}
          locationName={locationName}
          zoom={zoom}
          showRoute={showRoute}
          onMapClick={handleManualMapClick}
        />

        {/* Top Right Live Badge */}
        <div className="absolute top-2.5 right-2.5 z-[10] bg-surface/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-primary border border-primary/20 shadow-md flex items-center gap-1.5 pointer-events-none">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'granted' && !isManualFallback ? 'bg-secondary animate-ping' : 'bg-amber-500'
            }`}
          />
          <span>
            {status === 'granted'
              ? isManualFallback
                ? 'Manual Map Marker'
                : 'Live GPS Connected'
              : status === 'requesting'
              ? 'Requesting GPS...'
              : 'GPS Disabled'}
          </span>
        </div>

        {/* Top Left Recenter GPS Button */}
        <button
          onClick={requestPermissionAndStart}
          title="Access My Live Device GPS Location"
          className="absolute top-2.5 left-2.5 z-[10] bg-surface/95 hover:bg-surface-container-high backdrop-blur-md px-3 py-1.5 rounded-full text-primary border border-outline-variant/30 shadow-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
        >
          <span className={`material-symbols-outlined text-sm ${status === 'requesting' ? 'animate-spin' : ''}`}>
            my_location
          </span>
          <span>{status === 'requesting' ? 'Locating...' : 'Recenter GPS'}</span>
        </button>

        {/* Permission Denied / Error Banner with Retry Button */}
        {(status === 'denied' || status === 'blocked' || status === 'unavailable' || status === 'timeout') && (
          <div className="absolute bottom-3 left-3 right-3 z-[10] bg-error-container/95 text-on-error-container backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-bold border border-error/30 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="material-symbols-outlined text-error text-base shrink-0">warning</span>
              <span className="truncate">{errorMessage || 'Location permission required for live GPS.'}</span>
            </div>
            <button
              onClick={requestPermissionAndStart}
              className="ml-2 bg-error text-on-error px-3 py-1 rounded-lg text-xs font-black shadow-sm hover:opacity-90 transition-opacity shrink-0"
            >
              Retry GPS
            </button>
          </div>
        )}
      </div>

      {/* Bottom Live Metrics Bar (Distance, Travel Time, Direction, Accuracy) */}
      <div className="bg-surface-container-low border-t border-outline-variant/30 p-2.5 px-3 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-on-surface">
        <div className="flex items-center gap-3 flex-wrap">
          {userLat !== null && userLng !== null && (
            <span className="flex items-center gap-1 text-secondary text-[11px]">
              <span className="material-symbols-outlined text-xs">my_location</span>
              {userLat.toFixed(4)}°, {userLng.toFixed(4)}°
              {coords?.accuracy ? ` (±${coords.accuracy.toFixed(0)}m)` : ''}
            </span>
          )}

          {distanceInfo && (
            <div className="flex items-center gap-3 border-l border-outline-variant/40 pl-3">
              <span className="flex items-center gap-1 text-primary text-[11px]">
                <span className="material-symbols-outlined text-xs">straighten</span>
                {distanceInfo.distanceFormatted}
              </span>
              <span className="flex items-center gap-1 text-tertiary text-[11px]">
                <span className="material-symbols-outlined text-xs">directions_walk</span>
                {distanceInfo.travelTimeFormatted}
              </span>
              <span className="flex items-center gap-1 text-on-surface-variant text-[11px]">
                <span className="material-symbols-outlined text-xs">explore</span>
                {bearingText}
              </span>
            </div>
          )}
        </div>

        {isManualFallback && (
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
            Manual Map Selection Mode
          </span>
        )}
      </div>
    </div>
  );
}
