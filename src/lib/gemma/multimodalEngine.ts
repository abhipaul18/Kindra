import { supabase } from '@/src/lib/supabase';
import type { MultimodalIngestPayload } from './types';

export async function processMultimodalIngestion(input: {
  userId: string;
  title: string;
  notes?: string;
  images?: (string | File)[];
  beforeImage?: string | File;
  afterImage?: string | File;
  videoUrl?: string;
  voiceNoteUrl?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  gpsAccuracy?: number;
  uploadLat?: number;
  uploadLng?: number;
  missionLat?: number;
  missionLng?: number;
  locationAddress?: string;
  selectedMissionId?: string;
  expectedActivity?: string;
  deviceMetadata?: MultimodalIngestPayload['deviceMetadata'];
}): Promise<MultimodalIngestPayload> {
  const uploadedImageUrls: string[] = [];

  // Handle image upload storage if File objects are provided
  if (input.images && input.images.length > 0) {
    for (let i = 0; i < input.images.length; i++) {
      const item = input.images[i];
      if (typeof item === 'string') {
        uploadedImageUrls.push(item);
      } else if (item instanceof File) {
        const storedUrl = await uploadAssetToStorage(item, `images/${input.userId}`);
        if (storedUrl) uploadedImageUrls.push(storedUrl);
      }
    }
  }

  let beforeUrl: string | undefined;
  if (input.beforeImage) {
    beforeUrl = typeof input.beforeImage === 'string' 
      ? input.beforeImage 
      : await uploadAssetToStorage(input.beforeImage, `before_after/${input.userId}`);
  }

  let afterUrl: string | undefined;
  if (input.afterImage) {
    afterUrl = typeof input.afterImage === 'string'
      ? input.afterImage
      : await uploadAssetToStorage(input.afterImage, `before_after/${input.userId}`);
  }

  return {
    userId: input.userId,
    title: input.title,
    notes: input.notes,
    selectedMissionId: input.selectedMissionId,
    expectedActivity: input.expectedActivity,
    images: uploadedImageUrls.length > 0 ? uploadedImageUrls : ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60'],
    beforeImage: beforeUrl,
    afterImage: afterUrl,
    videoUrl: input.videoUrl,
    voiceNoteUrl: input.voiceNoteUrl,
    gps: {
      currentLat: input.latitude ?? 28.6139,
      currentLng: input.longitude ?? 77.2090,
      uploadLat: input.uploadLat ?? input.latitude ?? 28.6139,
      uploadLng: input.uploadLng ?? input.longitude ?? 77.2090,
      missionLat: input.missionLat ?? input.latitude ?? 28.6139,
      missionLng: input.missionLng ?? input.longitude ?? 77.2090,
      altitude: input.altitude,
      accuracy: input.gpsAccuracy,
    },
    timestamp: new Date().toISOString(),
    deviceMetadata: input.deviceMetadata ?? {
      deviceModel: 'Web Browser Device',
      operatingSystem: 'Client Web Platform',
      appVersion: 'v2.4-enterprise',
      captureSource: 'camera_live',
    },
  };
}

async function uploadAssetToStorage(file: File, pathFolder: string): Promise<string | undefined> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `${pathFolder}/${fileName}`;

    const { error } = await supabase.storage
      .from('reports')
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.warn('[Multimodal Storage] Storage upload warning:', error.message);
      return undefined;
    }

    const { data: publicUrlData } = supabase.storage.from('reports').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('[Multimodal Storage Error]:', err);
    return undefined;
  }
}
