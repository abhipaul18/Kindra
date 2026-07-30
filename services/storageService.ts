import { supabase } from '@/src/lib/supabase';

export type StorageBucket = 'avatars' | 'reports' | 'campaigns' | 'badges' | 'documents';

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File
): Promise<{ path: string; publicUrl: string }> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
  });

  if (error) throw error;

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
