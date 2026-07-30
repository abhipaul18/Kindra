import type {
  VerificationDecisionResult,
  VerificationDecisionStatus,
  ClassificationResult,
  FraudDetectionResult,
  GPSValidationResult,
} from './types';

export function runVerificationDecision(
  classification: ClassificationResult & { apiError?: any },
  fraud: FraudDetectionResult,
  gps: GPSValidationResult,
  missionMatch: boolean = true,
  expectedActivity: string = 'Civic Contribution',
  detectedActivity: string = 'General Civic Activity'
): VerificationDecisionResult {
  let confidenceScore = classification.confidence;

  if (!gps.isWithinGeofence) confidenceScore *= 0.85;
  if (gps.isSpoofed) confidenceScore *= 0.1;
  if (fraud.fraudScore > 0) confidenceScore *= (1 - fraud.fraudScore / 100);

  confidenceScore = Math.min(1.0, Math.max(0.05, Number(confidenceScore.toFixed(2))));

  let status: VerificationDecisionStatus = 'pending';
  let requiresManualReview = false;
  let autoRejected = false;
  let decisionReasoning = '';
  let rejectionReason: string | undefined;
  let suggestedAction: string | undefined;

  // RULE 0: OpenRouter API Error -> Explicit API Failure Diagnostic
  if (classification.apiError) {
    return {
      status: 'manual_review_required',
      confidenceScore: 0,
      missionMatch: false,
      expectedActivity,
      detectedActivity: 'OpenRouter API Request Error',
      requiresManualReview: true,
      autoRejected: false,
      decisionReasoning: `OpenRouter API Call Failed (${classification.apiError.statusCode} ${classification.apiError.statusText}): ${classification.apiError.message}`,
      rejectionReason: `API Communication Error (${classification.apiError.statusCode}). Endpoint: ${classification.apiError.endpoint}`,
      suggestedAction: 'Please check your OpenRouter API key, model selection, or network availability.',
      apiError: classification.apiError,
    };
  }

  // RULE 1: Mission Match Failure -> Immediately Reject with 0 Karma
  if (!missionMatch) {
    status = 'auto_rejected';
    autoRejected = true;
    rejectionReason = 'The uploaded evidence does not satisfy the selected mission requirements.';
    suggestedAction = `Please upload evidence satisfying mission: "${expectedActivity}".`;
    decisionReasoning = `Verification Failed: Gemini/Gemma AI determined mission_match == false for "${expectedActivity}". Detected: "${detectedActivity}". Reason: ${classification.reasoning}. Karma awarded: 0 XP.`;
  }
  // RULE 2: Fraud Score or GPS Spoofing -> Immediately Reject
  else if (fraud.fraudScore >= 50 || fraud.isDuplicate || gps.isSpoofed) {
    status = 'auto_rejected';
    autoRejected = true;
    rejectionReason = 'Security alert: Fraud risk score exceeded threshold.';
    suggestedAction = 'Please submit original, non-edited photo proof.';
    decisionReasoning = `Submission rejected by Gemma AI Engine due to fraud risk score (${fraud.fraudScore}/100). Flags: ${
      fraud.isDuplicate ? 'Duplicate image match. ' : ''
    }${gps.isSpoofed ? 'GPS Spoofing detected. ' : ''}${fraud.isAiGenerated ? 'AI Generated Synthetic Media. ' : ''}`;
  }
  // RULE 3: confidence >= 90% -> Auto Approve
  else if (confidenceScore >= 0.90 && missionMatch) {
    status = 'auto_verified';
    decisionReasoning = `Mission Approved by Gemma AI. High confidence (${(confidenceScore * 100).toFixed(0)}%), mission_match == true (${detectedActivity}). Reason: ${classification.reasoning}`;
  }
  // RULE 4: confidence 80% - 89% -> Needs Additional Validation / Low Confidence Approval
  else if (confidenceScore >= 0.80 && missionMatch) {
    status = 'verified_low_confidence';
    decisionReasoning = `Verified with Low Confidence (${(confidenceScore * 100).toFixed(0)}%). Mission match passed, queued for optional officer audit. Reason: ${classification.reasoning}`;
  }
  // RULE 5: confidence < 80% -> Manual Review Required
  else {
    status = 'manual_review_required';
    requiresManualReview = true;
    decisionReasoning = `Confidence score (${(confidenceScore * 100).toFixed(0)}%) is below 80%. Queued for manual review. Reason: ${classification.reasoning}`;
  }

  return {
    status,
    confidenceScore,
    missionMatch,
    expectedActivity,
    detectedActivity,
    requiresManualReview,
    autoRejected,
    decisionReasoning,
    rejectionReason,
    suggestedAction,
  };
}
