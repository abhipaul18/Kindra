import { NextResponse } from 'next/server';

/**
 * POST /api/evidence/upload
 *
 * Server-side API route for evidence upload and duplicate checking.
 * Receives multipart form data with the image file and metadata,
 * performs server-side SHA-256 hashing, uploads to Supabase Storage,
 * and checks for duplicates.
 *
 * This route is a scaffold for future server-side migration of the
 * evidence pipeline (currently running client-side).
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;
    const missionId = formData.get('missionId') as string | null;

    if (!file || !userId || !missionId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, userId, missionId' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are accepted.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB.` },
        { status: 400 }
      );
    }

    // Compute SHA-256 server-side
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha256Hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('[API /api/evidence/upload]');
    console.log('  User     :', userId);
    console.log('  Mission  :', missionId);
    console.log('  File     :', file.name);
    console.log('  Size     :', file.size, 'bytes');
    console.log('  SHA-256  :', sha256Hash);

    return NextResponse.json({
      success: true,
      sha256: sha256Hash,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      message: 'Evidence received. Client-side pipeline handles storage and duplicate detection.',
    });

  } catch (error: any) {
    console.error('[API /api/evidence/upload Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Evidence Upload Error' },
      { status: 500 }
    );
  }
}
