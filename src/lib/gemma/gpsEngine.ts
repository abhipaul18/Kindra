import type { GPSValidationResult, MultimodalIngestPayload } from './types';

export function runGPSValidation(payload: MultimodalIngestPayload): GPSValidationResult {
  const currentLat = payload.gps?.currentLat ?? 28.6139;
  const currentLng = payload.gps?.currentLng ?? 77.2090;

  const uploadLat = payload.gps?.uploadLat ?? currentLat;
  const uploadLng = payload.gps?.uploadLng ?? currentLng;

  const missionLat = payload.gps?.missionLat ?? currentLat;
  const missionLng = payload.gps?.missionLng ?? currentLng;

  // 1. Calculate distance offset between current upload & target mission GPS (Haversine formula)
  const distanceFromMissionMeters = calculateHaversineDistanceMeters(currentLat, currentLng, missionLat, missionLng);

  // 2. Calculate distance between EXIF photo metadata GPS and current device GPS
  const exifDiscrepancyMeters = calculateHaversineDistanceMeters(currentLat, currentLng, uploadLat, uploadLng);

  // 3. Geofence evaluation (Standard boundary: 500 meters)
  const maxGeofenceRadiusMeters = 500;
  const isWithinGeofence = distanceFromMissionMeters <= maxGeofenceRadiusMeters;

  // 4. GPS Spoofing & Impossibility Detection
  let isSpoofed = false;
  let travelPathValid = true;
  let reasoning = 'GPS validation passed. Coordinates are within the verified geofence boundary.';

  // Check 4a: Null Island (0,0) or invalid latitude/longitude range
  if (Math.abs(currentLat) < 0.001 && Math.abs(currentLng) < 0.001) {
    isSpoofed = true;
    travelPathValid = false;
    reasoning = 'GPS Spoofing Alert: Submissions from Null Island coordinates (0.0, 0.0) are rejected.';
  } else if (currentLat < -90 || currentLat > 90 || currentLng < -180 || currentLng > 180) {
    isSpoofed = true;
    travelPathValid = false;
    reasoning = 'GPS Spoofing Alert: Invalid out-of-range latitude/longitude values detected.';
  }

  // Check 4b: High EXIF Discrepancy (> 50 km between photo capture location and upload location)
  if (exifDiscrepancyMeters > 50000) {
    isSpoofed = true;
    travelPathValid = false;
    reasoning = `GPS Spoofing Alert: Photo capture EXIF location is ${(exifDiscrepancyMeters / 1000).toFixed(1)} km away from current device location.`;
  }

  // Check 4c: Geofence breach
  if (!isWithinGeofence && !isSpoofed) {
    reasoning = `Geofence Notice: Upload location is ${(distanceFromMissionMeters / 1000).toFixed(2)} km from mission target point (Max allowed: 0.5 km).`;
  }

  const confidence = isSpoofed ? 0.05 : isWithinGeofence ? 0.98 : 0.75;

  return {
    currentGps: { lat: currentLat, lng: currentLng },
    uploadGps: { lat: uploadLat, lng: uploadLng },
    missionGps: { lat: missionLat, lng: missionLng },
    isWithinGeofence,
    distanceFromMissionMeters: Math.round(distanceFromMissionMeters),
    travelPathValid,
    isSpoofed,
    confidence,
    reasoning,
  };
}

function calculateHaversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
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
