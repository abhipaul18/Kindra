import { NextResponse } from 'next/server';
import { executeGemmaVerificationPipeline } from '@/src/lib/gemma/verificationPipeline';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      title,
      notes,
      images,
      beforeImage,
      afterImage,
      videoUrl,
      voiceNoteUrl,
      latitude,
      longitude,
      altitude,
      gpsAccuracy,
      locationAddress,
      deviceMetadata,
      reportId,
      missionId,
    } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId and title are required.' },
        { status: 400 }
      );
    }

    const verificationResult = await executeGemmaVerificationPipeline({
      userId,
      title,
      notes,
      images: images || [],
      beforeImage,
      afterImage,
      videoUrl,
      voiceNoteUrl,
      latitude,
      longitude,
      altitude,
      gpsAccuracy,
      locationAddress,
      deviceMetadata,
      reportId,
      missionId,
    });

    return NextResponse.json({
      success: true,
      verification: verificationResult,
    });
  } catch (error: any) {
    console.error('[API /api/gemma/verify Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Verification Pipeline Error' },
      { status: 500 }
    );
  }
}
