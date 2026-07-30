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
import type { CompleteVerificationPipelineOutput } from './types';
import { supabase } from '@/src/lib/supabase';

export async function executeGemmaVerificationPipeline(
  input: Parameters<typeof processMultimodalIngestion>[0] & { reportId?: string; missionId?: string }
): Promise<CompleteVerificationPipelineOutput> {
  const auditTrail: CompleteVerificationPipelineOutput['auditTrail'] = [];

  // Stage 1: Multimodal Input Analysis & Storage
  const payload = await processMultimodalIngestion({
    ...input,
    selectedMissionId: input.missionId || input.title,
  });
  auditTrail.push({ stage: 'multimodal_ingest', completedAt: new Date().toISOString(), notes: 'Multimodal assets ingested and stored.' });

  // Stage 2: AI Activity Classification & Mission Matching
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

  // Stage 6: Fraud Detection & Image Hashing
  const fraud = await runFraudDetection(payload, gps, ocr);
  auditTrail.push({ stage: 'fraud_detection', completedAt: new Date().toISOString(), notes: `Fraud Score: ${fraud.fraudScore}/100 (${fraud.riskLevel} risk)` });

  // Stage 7: Impact Calculation
  const impact = runImpactCalculation(payload, classification, vision);
  auditTrail.push({ stage: 'impact_calculation', completedAt: new Date().toISOString(), notes: `Impact Score: ${impact.totalImpactScore}/100` });

  // Stage 8 & 12: Decision Matrix with Mission Matching Golden Rule
  const decision = runVerificationDecision(
    classification,
    fraud,
    gps,
    classification.missionMatch,
    classification.expectedActivity,
    classification.detectedActivity
  );

  // Stage 8: Karma Evaluation (0 Karma if missionMatch == false or auto_rejected)
  const karma = evaluateDynamicKarma(
    classification,
    impact,
    fraud,
    decision.status === 'auto_verified' ? decision.confidenceScore : 0
  );
  auditTrail.push({ stage: 'karma_evaluation', completedAt: new Date().toISOString(), notes: karma.reasoning });

  // Stage 9: Smart Routing
  const routing = runSmartRouting(classification);
  auditTrail.push({ stage: 'smart_routing', completedAt: new Date().toISOString(), notes: `Routed to ${routing.destinationDepartment}` });

  // Stage 10: AI Summaries
  const summaries = runSummaryGeneration(payload, classification, vision, gps, routing, decision);
  auditTrail.push({ stage: 'summary_generation', completedAt: new Date().toISOString(), notes: summaries.executiveSummary });

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

  // Stage 14 & 16: Persist Database Audit Record & Server-side Award Execution
  await persistVerificationToDatabase(pipelineOutput, input.reportId, input.missionId);

  return pipelineOutput;
}

async function persistVerificationToDatabase(
  output: CompleteVerificationPipelineOutput,
  reportId?: string,
  missionId?: string
) {
  try {
    // 1. Create or update mission submission record
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

    // 2. Create verification_requests entry
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

    // 3. Create verification_results entry
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

    // 4. Create child audit tables in parallel
    if (resultId) {
      await Promise.allSettled([
        // Fraud Report
        supabase.from('fraud_reports').insert({
          verification_result_id: resultId,
          submission_id: submissionId,
          report_id: reportId,
          fraud_score: output.fraud.fraudScore,
          is_duplicate: output.fraud.isDuplicate,
          perceptual_hash: output.fraud.perceptualHash,
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

        // OCR Results
        supabase.from('ocr_results').insert({
          verification_result_id: resultId,
          submission_id: submissionId,
          document_type: output.ocr.documentType,
          extracted_text: output.ocr.extractedText,
          structured_data: JSON.parse(JSON.stringify(output.ocr.structuredFields)),
          confidence: output.ocr.confidence,
          is_authentic_document: output.ocr.isAuthentic,
          validation_reasoning: output.ocr.reasoning,
        }),

        // GPS Logs
        supabase.from('gps_logs').insert({
          verification_result_id: resultId,
          submission_id: submissionId,
          current_lat: output.gps.currentGps.lat,
          current_lng: output.gps.currentGps.lng,
          exif_lat: output.gps.uploadGps?.lat,
          exif_lng: output.gps.uploadGps?.lng,
          target_lat: output.gps.missionGps?.lat,
          target_lng: output.gps.missionGps?.lng,
          distance_offset_meters: output.gps.distanceFromMissionMeters,
          is_within_geofence: output.gps.isWithinGeofence,
          travel_path_valid: output.gps.travelPathValid,
          is_spoofed: output.gps.isSpoofed,
          gps_confidence: output.gps.confidence,
        }),

        // Impact Scores
        supabase.from('impact_scores').insert({
          verification_result_id: resultId,
          submission_id: submissionId,
          environmental_score: output.impact.environmentalScore,
          community_score: output.impact.communityScore,
          urgency_rating: output.impact.urgencyRating,
          difficulty_rating: output.impact.difficultyRating,
          volunteer_hours_estimated: output.impact.volunteerHours,
          beneficiaries_count: output.impact.beneficiariesCount,
          social_value_score: output.impact.socialValueScore,
          total_impact_score: output.impact.totalImpactScore,
        }),

        // Routing History
        supabase.from('routing_history').insert({
          verification_result_id: resultId,
          destination_department: output.routing.destinationDepartment,
          routing_reason: output.routing.routingReasoning,
        }),

        // AI Reasoning with Mission Match Metadata
        supabase.from('ai_reasoning').insert({
          verification_result_id: resultId,
          submission_id: submissionId,
          category: output.classification.category,
          subcategory: output.decision.expectedActivity,
          confidence: output.decision.confidenceScore,
          detected_objects: output.vision.detectedObjects,
          citizen_summary: output.summaries.citizenSummary,
          officer_summary: output.summaries.officerSummary,
          ngo_summary: output.summaries.ngoSummary,
          raw_reasoning: output.decision.decisionReasoning,
        }),

        // Manual Review Queue entry if required
        output.decision.requiresManualReview
          ? supabase.from('manual_reviews').insert({
              verification_result_id: resultId,
              submission_id: submissionId,
              report_id: reportId,
              status: 'pending',
              reviewer_notes: output.decision.decisionReasoning,
            })
          : Promise.resolve(),

        // Award Karma ONLY IF auto_verified AND missionMatch == true
        output.decision.status === 'auto_verified' && output.decision.missionMatch && output.karma.finalKarmaAwarded > 0
          ? supabase.rpc('award_karma', {
              p_user_id: output.payload.userId,
              p_amount: output.karma.finalKarmaAwarded,
              p_action_type: 'mission_verified',
              p_description: `Gemma AI Verified: ${output.payload.title}`,
              p_reference_id: submissionId || reportId,
            })
          : Promise.resolve(),
      ]);
    }
  } catch (err) {
    console.error('[Verification Persistence Error]:', err);
  }
}
