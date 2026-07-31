import { processMultimodalIngestion } from './multimodalEngine';
import { runActivityClassification } from './classificationEngine';
import { runComputerVisionAnalysis } from './visionEngine';
import { runGPSValidation } from './gpsEngine';
import { runOCREngine } from './ocrEngine';
import { runFraudDetection } from './fraudEngine';
import { runImpactCalculation } from './impactEngine';
import { evaluateDynamicKarma } from './karmaEngine';
import { runSmartRouting } from './routingEngine';
import { runSummaryGeneration } from './summaryEngine';
import { runVerificationDecision } from './decisionEngine';
import { checkDuplicateSubmission, registerLocalSubmission, DuplicateResponse } from './duplicateEngine';
import type { CompleteVerificationPipelineOutput } from './types';
import { supabase } from '@/src/lib/supabase';

export async function executeGemmaVerificationPipeline(
  input: Parameters<typeof processMultimodalIngestion>[0] & { reportId?: string; missionId?: string }
): Promise<CompleteVerificationPipelineOutput | DuplicateResponse> {
  const missionId = input.missionId || input.selectedMissionId || input.title;
  const primaryImage = (input.images && input.images[0]) || input.beforeImage || '';

  // 1. EARLY DUPLICATE DETECTION (Before Storage Upload, DB Insert, AI Request, or Karma Award)
  const duplicateCheck = await checkDuplicateSubmission({
    userId: input.userId,
    missionId,
    imageData: primaryImage,
    latitude: input.latitude,
    longitude: input.longitude,
  });

  if (duplicateCheck.isDuplicate) {
    // REQUIRED LOGGING
    console.log('[Pipeline Debug] Duplicate Found');
    console.log('[Pipeline Debug] Pipeline Terminated');
    console.log('[Pipeline Debug] No Storage Upload');
    console.log('[Pipeline Debug] No Database Insert');
    console.log('[Pipeline Debug] No AI Request');

    return {
      status: 'duplicate',
      reason: duplicateCheck.reason || 'Exact duplicate image already submitted.',
      duplicate_type: duplicateCheck.duplicateType || 'exact',
      confidence: 100,
      isDuplicate: true,
      karmaAwarded: 0,
    };
  }

  // 2. ONLY IF DUPLICATE == FALSE: Continue with Upload Storage, DB Insert, Gemma AI Verification
  const auditTrail: CompleteVerificationPipelineOutput['auditTrail'] = [];

  // Stage 1: Multimodal Input Analysis & Storage Upload
  const payload = await processMultimodalIngestion({
    ...input,
    selectedMissionId: missionId,
  });
  auditTrail.push({ stage: 'multimodal_ingest', completedAt: new Date().toISOString(), notes: 'Multimodal assets ingested and stored.' });

  // Stage 2: AI Activity Classification & Mission Matching (Gemma Vision Call)
  const classification = await runActivityClassification(payload);
  auditTrail.push({ 
    stage: 'classification', 
    completedAt: new Date().toISOString(), 
    notes: `Mission Match: ${classification.missionMatch ? 'PASSED' : 'FAILED'}. Expected: "${classification.expectedActivity}", Detected: "${classification.detectedActivity}"` 
  });

  // Stage 3: Computer Vision & Object Detection
  const vision = await runComputerVisionAnalysis(payload);
  auditTrail.push({ stage: 'vision_analysis', completedAt: new Date().toISOString(), notes: `Objects detected: ${vision.detectedObjects.join(', ')}` });

  // Stage 4: GPS Validation
  const gps = runGPSValidation(payload);
  auditTrail.push({ stage: 'gps_validation', completedAt: new Date().toISOString(), notes: gps.reasoning });

  // Stage 5: OCR Engine
  const ocr = await runOCREngine(payload);
  auditTrail.push({ stage: 'ocr_processing', completedAt: new Date().toISOString(), notes: `Document type: ${ocr.documentType}` });

  // Stage 6: Fraud Detection
  const fraud = await runFraudDetection(payload, gps, ocr);
  auditTrail.push({ stage: 'fraud_detection', completedAt: new Date().toISOString(), notes: `Fraud Score: ${fraud.fraudScore}/100 (${fraud.riskLevel} risk)` });

  // Stage 7: Impact Calculation
  const impact = runImpactCalculation(payload, classification, vision);
  auditTrail.push({ stage: 'impact_calculation', completedAt: new Date().toISOString(), notes: `Impact Score: ${impact.totalImpactScore}/100` });

  // Stage 8: Decision Matrix
  const decision = runVerificationDecision(
    classification,
    fraud,
    gps,
    classification.missionMatch,
    classification.expectedActivity,
    classification.detectedActivity
  );

  // Stage 9: Dynamic Karma Evaluation
  const karma = evaluateDynamicKarma(
    classification,
    impact,
    fraud,
    decision.status === 'auto_verified' ? decision.confidenceScore : 0
  );
  auditTrail.push({ stage: 'karma_evaluation', completedAt: new Date().toISOString(), notes: karma.reasoning });

  // Stage 10: Smart Routing & Summaries
  const routing = runSmartRouting(classification);
  const summaries = runSummaryGeneration(payload, classification, vision, gps, routing, decision);

  const pipelineOutput: CompleteVerificationPipelineOutput = {
    id: `verif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    payload,
    classification,
    vision,
    gps,
    ocr,
    fraud,
    impact,
    karma,
    routing,
    summaries,
    decision,
    auditTrail,
  };

  // Stage 11: Persist Database Audit Record
  await persistVerificationToDatabase(pipelineOutput, input.reportId, missionId);

  // Register in local history store for future duplicate detection
  registerLocalSubmission({
    userId: input.userId,
    missionId,
    latitude: input.latitude,
    longitude: input.longitude,
    sha256: duplicateCheck.sha256,
    pHash: duplicateCheck.pHash,
    timestamp: Date.now(),
  });

  return pipelineOutput;
}

async function persistVerificationToDatabase(
  output: CompleteVerificationPipelineOutput,
  reportId?: string,
  missionId?: string
) {
  try {
    const { data: submission } = await supabase
      .from('mission_submissions')
      .insert({
        user_id: output.payload.userId,
        mission_id: missionId,
        title: output.payload.title,
        notes: output.payload.notes,
        primary_image_url: output.payload.images[0],
        media_urls: output.payload.images,
        latitude: output.payload.gps?.currentLat,
        longitude: output.payload.gps?.currentLng,
        location_address: output.payload.notes || 'Civic Location',
        device_metadata: JSON.parse(JSON.stringify(output.payload.deviceMetadata || {})),
        status: output.decision.status,
      })
      .select('id')
      .single();

    const submissionId = submission?.id;

    const { data: request } = await supabase
      .from('verification_requests')
      .insert({
        submission_id: submissionId,
        report_id: reportId,
        user_id: output.payload.userId,
        current_stage: 'decision_complete',
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    const requestId = request?.id;

    const { data: result } = await supabase
      .from('verification_results')
      .insert({
        verification_request_id: requestId,
        submission_id: submissionId,
        report_id: reportId,
        overall_status: output.decision.status,
        confidence_score: output.decision.confidenceScore,
        overall_fraud_score: output.fraud.fraudScore,
        impact_score: output.impact.totalImpactScore,
        calculated_karma: output.karma.finalKarmaAwarded,
        is_karma_awarded: output.decision.status === 'auto_verified' && output.karma.finalKarmaAwarded > 0,
        routed_department: output.routing.destinationDepartment,
        routing_entity_type: output.routing.routingTargetEntity,
        summary_text: output.summaries.executiveSummary,
        reasoning_text: output.decision.decisionReasoning,
      })
      .select('id')
      .single();

    const resultId = result?.id;

    if (resultId) {
      await Promise.allSettled([
        (supabase as any).from('fraud_reports').insert({
          verification_result_id: resultId,
          submission_id: submissionId,
          report_id: reportId,
          user_id: output.payload.userId,
          mission_id: missionId,
          latitude: output.payload.gps?.currentLat,
          longitude: output.payload.gps?.currentLng,
          fraud_score: output.fraud.fraudScore,
          is_duplicate: output.fraud.isDuplicate,
          perceptual_hash: output.fraud.perceptualHash,
          image_hash: output.fraud.perceptualHash,
          sha256: (output.auditTrail[0] as any)?.inputHash || '',
          is_ai_generated: output.fraud.isAiGenerated,
          is_edited_or_tampered: output.fraud.isEditedOrTampered,
          is_screenshot: output.fraud.isScreenshot,
          is_internet_stock: output.fraud.isInternetStockPhoto,
          metadata_tamper_flag: output.fraud.metadataTamperFlag,
          timestamp_mismatch_flag: output.fraud.timestampMismatchFlag,
          gps_spoofing_flag: output.fraud.isFakeGps,
          risk_level: output.fraud.riskLevel,
          details: JSON.parse(JSON.stringify(output.fraud)),
        }),
      ]);
    }
  } catch (e) {
    console.warn('[Verification Pipeline] DB audit log warning:', e);
  }
}
