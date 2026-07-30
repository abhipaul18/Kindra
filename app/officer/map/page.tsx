'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { supabase } from '@/src/lib/supabase';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

import { useGeolocation } from '@/hooks/useGeolocation';

const priorityColorMap: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};

export default function OfficerMapPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { coords: officerGps, status: gpsStatus } = useGeolocation(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('reports')
        .select('id, title, location_name, latitude, longitude, priority, status, created_at')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('created_at', { ascending: false })
        .limit(200);

      setReports(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-md animate-pulse">
        <div className="h-12 bg-surface-container-high rounded-xl w-48" />
        <div className="h-[500px] bg-surface-container-high rounded-2xl" />
      </div>
    );
  }

  const center: [number, number] = officerGps?.lat && officerGps?.lng
    ? [officerGps.lat, officerGps.lng]
    : reports.length > 0
    ? [reports[0].latitude, reports[0].longitude]
    : [12.9716, 77.5946];

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-on-surface">Issue Map</h1>
        <span className="text-xs font-semibold text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full">
          {reports.length} reports with GPS
        </span>
      </div>

      {/* Legend */}
      <Card className="p-md flex flex-wrap items-center gap-md border-outline-variant/30">
        {Object.entries(priorityColorMap).map(([priority, color]) => (
          <div key={priority} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs font-semibold text-on-surface capitalize">{priority}</span>
          </div>
        ))}
      </Card>

      {/* Map */}
      <Card className="overflow-hidden border-outline-variant/30" style={{ height: '500px' }}>
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {reports.map((r) => (
            <CircleMarker
              key={r.id}
              center={[r.latitude, r.longitude]}
              radius={8}
              pathOptions={{
                fillColor: priorityColorMap[r.priority] || '#6b7280',
                color: '#ffffff',
                weight: 2,
                fillOpacity: 0.85,
              }}
            >
              <Popup>
                <div className="font-sans">
                  <p className="font-bold text-sm">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.location_name}</p>
                  <p className="text-xs mt-1">
                    <span className="font-semibold capitalize">{r.priority}</span> • {r.status?.replace('_', ' ')}
                  </p>
                  <a href={`/officer/report/${r.id}`} className="text-xs text-blue-600 font-bold hover:underline mt-1 block">
                    View Details →
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </Card>
    </div>
  );
}
