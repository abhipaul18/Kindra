import { supabase } from '@/src/lib/supabase';

export type StorageBucket = 'avatars' | 'reports' | 'campaigns' | 'badges' | 'documents';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

export function generateStoragePath(userId: string, prefix: string, filename: string): string {
  const extension = filename.split('.').pop() || 'png';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}/${prefix}_${timestamp}_${random}.${extension}`;
}

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File
): Promise<{ path: string; publicUrl: string }> {
  // Validate File Size
  const maxSize = bucket === 'documents' ? MAX_DOC_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    throw new Error(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB`);
  }

  // Validate File Type
  if (bucket !== 'documents' && !file.type.startsWith('image/')) {
    throw new Error('Only image files (JPEG, PNG, WebP) are allowed for this bucket');
  }

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });

  if (error) {
    console.error('Storage upload error:', error);
    throw error;
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: urlData.publicUrl,
  };
}

export function getPublicStorageUrl(bucket: StorageBucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
