'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeolocationCoords {
  lat: number;
  lng: number;
  accuracy: number | null; // meters
  heading: number | null;  // degrees
  speed: number | null;    // m/s
  timestamp: number;
}

export type GeolocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'timeout'
  | 'unavailable';

export interface DistanceInfo {
  distanceKm: number;
  distanceFormatted: string;
  travelTimeMin: number;
  travelTimeFormatted: string;
  bearing: string;
}

/**
 * Calculates Haversine distance between two coordinates in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates compass bearing from point A to point B.
 */
export function calculateCompassBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  const rad = Math.PI / 180;
  const phi1 = lat1 * rad;
  const phi2 = lat2 * rad;
  const deltaLambda = (lon2 - lon1) * rad;

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let bearingDeg = (Math.atan2(y, x) * 180) / Math.PI;
  bearingDeg = (bearingDeg + 360) % 360;

  const directions = [
    'North (N)',
    'North-East (NE)',
    'East (E)',
    'South-East (SE)',
    'South (S)',
    'South-West (SW)',
    'West (W)',
    'North-West (NW)',
  ];
  const index = Math.round(bearingDeg / 45) % 8;
  return directions[index];
}

/**
 * Estimates travel time (walking vs driving speed).
 */
export function calculateTravelEstimates(
  distanceKm: number,
  mode: 'walking' | 'driving' = 'walking'
): DistanceInfo {
  // Walking avg 5 km/h, driving avg 30 km/h in city
  const speed = mode === 'walking' ? 5 : 30;
  const travelHours = distanceKm / speed;
  const travelTimeMin = Math.max(1, Math.round(travelHours * 60));

  let travelTimeFormatted = `${travelTimeMin} mins`;
  if (travelTimeMin >= 60) {
    const hrs = Math.floor(travelTimeMin / 60);
    const mins = travelTimeMin % 60;
    travelTimeFormatted = `${hrs} hr ${mins} mins`;
  }

  let distanceFormatted = `${(distanceKm * 1000).toFixed(0)} m`;
  if (distanceKm >= 1) {
    distanceFormatted = `${distanceKm.toFixed(2)} km`;
  }

  return {
    distanceKm,
    distanceFormatted,
    travelTimeMin,
    travelTimeFormatted,
    bearing: '',
  };
}

export function useGeolocation(autoStart = true) {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [isManualFallback, setIsManualFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);

  const requestPermissionAndStart = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unavailable');
      setErrorMessage('Geolocation API is not supported by your browser.');
      return;
    }

    setStatus('requesting');
    setErrorMessage(null);

    // Initial position request
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy || null,
          heading: pos.coords.heading || null,
          speed: pos.coords.speed || null,
          timestamp: pos.timestamp || Date.now(),
        });
        setStatus('granted');
        setIsManualFallback(false);
      },
      (err) => {
        console.warn('Geolocation position error:', err);
        setIsManualFallback(true);
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
          setErrorMessage('Location permission was denied. Please allow location access in your browser settings.');
        } else if (err.code === err.TIMEOUT) {
          setStatus('timeout');
          setErrorMessage('Location request timed out. Retrying or fallback enabled.');
        } else {
          setStatus('unavailable');
          setErrorMessage('GPS signal unavailable. You can click on the map to manually set your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    // Watch position for continuous real-time updates as user moves
    if (watchIdRef.current === null) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy || null,
            heading: pos.coords.heading || null,
            speed: pos.coords.speed || null,
            timestamp: pos.timestamp || Date.now(),
          });
          setStatus('granted');
          setIsManualFallback(false);
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            setStatus('denied');
          }
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }
  }, []);

  const setManualLocation = useCallback((lat: number, lng: number) => {
    setCoords({
      lat,
      lng,
      accuracy: 0,
      heading: null,
      speed: null,
      timestamp: Date.now(),
    });
    setIsManualFallback(true);
    setStatus('granted');
  }, []);

  useEffect(() => {
    if (autoStart) {
      requestPermissionAndStart();
    }

    return () => {
      if (watchIdRef.current !== null && typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [autoStart, requestPermissionAndStart]);

  return {
    coords,
    status,
    isManualFallback,
    errorMessage,
    requestPermissionAndStart,
    setManualLocation,
  };
}
