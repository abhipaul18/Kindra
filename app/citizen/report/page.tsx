'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { reportSchema, type ReportFormData } from '@/lib/validations/report';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { uploadFile } from '@/services/storageService';
import { submitCivicReport } from '@/services/reportService';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { ImageUploader } from '@/components/reports/ImageUploader';
import { LocationPicker } from '@/components/maps/LocationPicker';
import { useGeolocation } from '@/hooks/useGeolocation';

const DEFAULT_CATEGORIES = [
  { id: 'cat-roads', name: 'Roads & Infrastructure' },
  { id: 'cat-sanitation', name: 'Sanitation & Waste' },
  { id: 'cat-safety', name: 'Public Safety & Utilities' },
  { id: 'cat-parks', name: 'Parks & Recreation' },
];

export default function ReportIssuePage() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { coords: liveCoords, status: gpsStatus, requestPermissionAndStart } = useGeolocation(true);

  // Fetch categories dynamically from Supabase with fallbacks
  const { data: dbCategories = [] } = useQuery({
    queryKey: ['categories-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error || !data || data.length === 0) return [];
      return data;
    },
  });

  const categories = dbCategories.length > 0 ? dbCategories : DEFAULT_CATEGORIES;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      location_name: 'Detecting Live GPS Location...',
      latitude: liveCoords?.lat || 12.9716,
      longitude: liveCoords?.lng || 77.5946,
    },
  });

  // Dynamically sync real-time GPS coordinates into form
  React.useEffect(() => {
    if (liveCoords?.lat && liveCoords?.lng) {
      setValue('latitude', liveCoords.lat);
      setValue('longitude', liveCoords.lng);
      setValue('location_name', `GPS Spot (${liveCoords.lat.toFixed(4)}, ${liveCoords.lng.toFixed(4)})`);
    }
  }, [liveCoords, setValue]);

  const onSubmit = async (data: ReportFormData) => {
    setImageError(null);
    setServerError(null);

    if (!selectedFile) {
      setImageError('Please upload an issue photo before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload photo to Supabase Storage 'reports' bucket
      const filename = `report-${user?.id || 'anon'}-${Date.now()}.${selectedFile.name.split('.').pop()}`;
      const { publicUrl, path } = await uploadFile('reports', filename, selectedFile);

      // 2. Insert report record into Supabase PostgreSQL 'reports' table
      const createdReport = await submitCivicReport({
        reporter_id: user?.id,
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        status: 'submitted',
        priority: 'medium',
        location_name: data.location_name,
        latitude: data.latitude,
        longitude: data.longitude,
        image_url: publicUrl,
      });

      // 3. Navigate to Submission Processing / Confirmation screen
      window.location.href = `/citizen/report/submitted?id=${createdReport.id}`;
    } catch (err: any) {
      console.error('Report submission failed:', err);
      setServerError(err.message || 'Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-lg max-w-2xl mx-auto pb-xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-on-surface">Report a Civic Issue</h1>
        <p className="text-sm text-on-surface-variant">
          Snap a photo of potholes, trash pileup, or hazards to alert municipal officers and earn +50 Karma.
        </p>
      </div>

      <Card className="p-lg gap-md border-outline-variant/30">
        {serverError && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg text-xs font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
          {/* Photo Uploader */}
          <ImageUploader
            onImageSelected={(file) => {
              setSelectedFile(file);
              if (file) setImageError(null);
            }}
            error={imageError || undefined}
          />

          {/* Category Dropdown */}
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-bold text-on-surface">
              Issue Category <span className="text-error">*</span>
            </label>
            <select
              {...register('category_id')}
              className={`w-full h-12 px-3 rounded-xl border bg-surface text-on-surface font-semibold text-sm transition-colors ${
                errors.category_id ? 'border-error' : 'border-outline-variant hover:border-primary'
              }`}
            >
              <option value="">Select a Category...</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <span className="text-xs text-error font-semibold">{errors.category_id.message}</span>
            )}
          </div>

          {/* Title Input */}
          <Input
            label="Issue Title"
            placeholder="e.g. Large pothole on main road causing traffic hazard"
            icon="title"
            error={errors.title?.message}
            {...register('title')}
          />

          {/* Description Textarea */}
          <div className="flex flex-col gap-1 w-full">
            <label className="text-sm font-bold text-on-surface">
              Detailed Description <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe the issue size, severity, and any landmarks..."
              {...register('description')}
              className={`w-full p-3 rounded-xl border bg-surface text-on-surface text-sm font-medium transition-colors ${
                errors.description ? 'border-error' : 'border-outline-variant hover:border-primary'
              }`}
            />
            {errors.description && (
              <span className="text-xs text-error font-semibold">{errors.description.message}</span>
            )}
          </div>

          {/* Formatted Location Input */}
          <Input
            label="Address / Location Name"
            placeholder="e.g. MG Road, Near Metro Station Pillar 42"
            icon="location_on"
            error={errors.location_name?.message}
            {...register('location_name')}
          />

          {/* OpenStreetMap Pin Selector */}
          <LocationPicker
            onLocationSelected={(lat, lng, address) => {
              setValue('latitude', lat);
              setValue('longitude', lng);
              if (address) setValue('location_name', address);
            }}
          />

          {/* Submit Action */}
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            icon="send"
            className="w-full font-bold py-3 mt-2"
          >
            Submit Issue Report
          </Button>
        </form>
      </Card>
    </div>
  );
}
