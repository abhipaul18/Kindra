import { supabase } from '@/src/lib/supabase';

// ============================================================
// SHA-256 Hash — Exact Duplicate Detection
// ============================================================

/**
 * Compute SHA-256 hex digest of a File using the Web Crypto API.
 * Works in all modern browsers without external dependencies.
 */
export async function computeSHA256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  console.log('[Evidence SHA-256]');
  console.log('  File     :', file.name);
  console.log('  Size     :', file.size, 'bytes');
  console.log('  SHA-256  :', hashHex);

  return hashHex;
}

// ============================================================
// Perceptual Hash (pHash) — Near-Duplicate Detection
// ============================================================

/**
 * Compute a perceptual hash of an image using canvas-based average hash.
 * Resizes image to 16x16 grayscale, computes average intensity,
 * and produces a 256-bit binary hash string.
 *
 * Near-duplicates (resized, recompressed, cropped) produce similar hashes.
 * Hamming distance ≤ 13 out of 256 bits (~95% similarity) = near duplicate.
 */
export async function computePerceptualHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Resize to 16x16 for perceptual hash
        const size = 16;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const pixels = imageData.data;

        // Convert to grayscale and compute average
        const grayValues: number[] = [];
        for (let i = 0; i < pixels.length; i += 4) {
          const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
          grayValues.push(gray);
        }

        const avg = grayValues.reduce((sum, v) => sum + v, 0) / grayValues.length;

        // Generate binary hash: 1 if pixel > average, 0 otherwise
        const hashBits = grayValues.map(v => (v >= avg ? '1' : '0')).join('');

        // Convert to hex for compact storage
        let hexHash = '';
        for (let i = 0; i < hashBits.length; i += 4) {
          const nibble = hashBits.substring(i, i + 4);
          hexHash += parseInt(nibble, 2).toString(16);
        }

        console.log('[Evidence pHash]');
        console.log('  File     :', file.name);
        console.log('  pHash    :', hexHash);
        console.log('  Bits     :', hashBits.length);

        resolve(hexHash);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for pHash'));
    };

    img.src = objectUrl;
  });
}

/**
 * Compute Hamming distance between two hex hash strings.
 * Returns the number of differing bits.
 */
export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return 256; // max distance if lengths differ

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const xor = parseInt(hash1[i], 16) ^ parseInt(hash2[i], 16);
    // Count set bits in XOR result
    let bits = xor;
    while (bits > 0) {
      distance += bits & 1;
      bits >>= 1;
    }
  }
  return distance;
}

/**
 * Compute similarity percentage between two perceptual hashes.
 * 100% = identical, 0% = completely different.
 */
export function pHashSimilarity(hash1: string, hash2: string): number {
  const totalBits = hash1.length * 4; // each hex char = 4 bits
  const distance = hammingDistance(hash1, hash2);
  return Math.max(0, ((totalBits - distance) / totalBits) * 100);
}

// ============================================================
// Supabase Storage Upload
// ============================================================

/**
 * Upload an image file to Supabase Storage in the good-deed-evidence bucket.
 * Path: good-deed-evidence/{userId}/{missionId}/{timestamp}_{uuid}.jpg
 *
 * Never overwrites existing files — always generates unique filenames.
 */
export async function uploadEvidenceImage(
  userId: string,
  missionId: string,
  file: File
): Promise<{ storagePath: string; publicUrl: string | null; error: string | null }> {
  const timestamp = Date.now();
  const uuid = crypto.randomUUID();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${timestamp}_${uuid}.${ext}`;
  const storagePath = `${userId}/${missionId}/${fileName}`;

  console.log('[Evidence Upload]');
  console.log('  Bucket   : good-deed-evidence');
  console.log('  Path     :', storagePath);
  console.log('  File     :', file.name);
  console.log('  Size     :', file.size, 'bytes');
  console.log('  MIME     :', file.type);

  const { error } = await supabase.storage
    .from('good-deed-evidence')
    .upload(storagePath, file, {
      cacheControl: '31536000', // 1 year cache
      upsert: false, // Never overwrite
      contentType: file.type || 'image/jpeg',
    });

  if (error) {
    console.error('[Evidence Upload Error]:', error.message);
    return { storagePath, publicUrl: null, error: error.message };
  }

  // Get signed URL (private bucket — 1 year expiry for evidence retention)
  const { data: urlData } = await supabase.storage
    .from('good-deed-evidence')
    .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 year

  const publicUrl = urlData?.signedUrl || null;

  console.log('[Evidence Upload Success]');
  console.log('  URL      :', publicUrl?.substring(0, 80) + '...');

  return { storagePath, publicUrl, error: null };
}

// ============================================================
// Save Evidence Record to Database
// ============================================================

export interface EvidenceRecord {
  userId: string;
  missionId: string;
  storagePath: string;
  publicUrl: string | null;
  imageHash: string;
  perceptualHash: string | null;
  verificationStatus: string;
  missionMatch: boolean | null;
  confidence: number | null;
  detectedActivity: string | null;
  detectedObjects: string[];
  fraud: boolean;
  aiReasoning: string | null;
  modelUsed: string | null;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  notes: string | null;
  deviceMetadata: Record<string, any>;
  duplicateOfId: string | null;
  duplicateType: string | null;
  similarityScore: number | null;
}

export async function saveEvidenceRecord(record: EvidenceRecord): Promise<{
  id: string | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('mission_evidence')
    .insert({
      user_id: record.userId,
      mission_id: record.missionId,
      storage_path: record.storagePath,
      public_url: record.publicUrl,
      image_hash: record.imageHash,
      perceptual_hash: record.perceptualHash,
      verification_status: record.verificationStatus,
      mission_match: record.missionMatch,
      confidence: record.confidence,
      detected_activity: record.detectedActivity,
      detected_objects: record.detectedObjects,
      fraud: record.fraud,
      ai_reasoning: record.aiReasoning,
      model_used: record.modelUsed,
      gps_latitude: record.gpsLatitude,
      gps_longitude: record.gpsLongitude,
      notes: record.notes,
      device_metadata: record.deviceMetadata,
      duplicate_of_id: record.duplicateOfId,
      duplicate_type: record.duplicateType,
      similarity_score: record.similarityScore,
      verified_at: record.verificationStatus !== 'pending' ? new Date().toISOString() : null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[Evidence Save Error]:', error.message);
    return { id: null, error: error.message };
  }

  console.log('[Evidence Record Saved]:', data?.id);
  return { id: data?.id || null, error: null };
}
