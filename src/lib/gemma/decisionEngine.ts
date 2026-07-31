import type {
  VerificationDecisionResult,
  VerificationDecisionStatus,
  ClassificationResult,
  FraudDetectionResult,
  GPSValidationResult,
} from './types';

export function runVerificationDecision(
  classification: ClassificationResult & { apiError?: any; confidenceScorePercent?: number },
  fraud: FraudDetectionResult,
  gps: GPSValidationResult,
  missionMatch: boolean = true,
  expectedActivity: string = 'Civic Contribution',
  detectedActivity: string = 'General Civic Activity'
): VerificationDecisionResult {
  let confidenceScore = classification.confidence;

  if (!gps.isWithinGeofence) confidenceScore *= 0.90;
  if (gps.isSpoofed) confidenceScore *= 0.1;
  if (fraud.fraudScore > 0) confidenceScore *= (1 - fraud.fraudScore / 100);

  confidenceScore = Math.min(1.0, Math.max(0.05, Number(confidenceScore.toFixed(2))));
  const confPercent = Math.round(confidenceScore * 100);

  let status: VerificationDecisionStatus = 'pending';
  let requiresManualReview = false;
  let autoRejected = false;
  let decisionReasoning = '';
  let rejectionReason: string | undefined;
  let suggestedAction: string | undefined;

  // RULE 0: OpenRouter API Error -> Diagnostic Error State
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

  const isFraud = fraud.fraudScore >= 50 || fraud.isDuplicate || gps.isSpoofed || fraud.isAiGenerated;

  // RULE 1: Fraud -> Immediately Reject
  if (isFraud) {
    status = 'auto_rejected';
    autoRejected = true;
    rejectionReason = 'Security alert: Fraud risk score exceeded threshold or duplicate/synthetic image detected.';
    suggestedAction = 'Please submit original, non-edited photo proof taken on location.';
    decisionReasoning = `Submission rejected by Gemma AI Engine due to fraud risk score (${fraud.fraudScore}/100). Flags: ${
      fraud.isDuplicate ? 'Duplicate image match. ' : ''
    }${gps.isSpoofed ? 'GPS Spoofing detected. ' : ''}${fraud.isAiGenerated ? 'AI Generated Synthetic Media. ' : ''}`;
  }
  // RULE 2: Mission Match == false -> Reject
  else if (!missionMatch) {
    status = 'auto_rejected';
    autoRejected = true;
    rejectionReason = 'The uploaded evidence does not satisfy the selected mission requirements.';
    suggestedAction = `Please upload evidence satisfying mission: "${expectedActivity}".`;
    decisionReasoning = `Verification Failed: Gemma AI determined mission_match == false for "${expectedActivity}". Detected: "${detectedActivity}". Reason: ${classification.reasoning}. Karma awarded: 0 XP.`;
  }
  // RULE 3: Confidence >= 85 (Approve & Very High Confidence)
  else if (confPercent >= 85 && missionMatch) {
    status = 'auto_verified';
    decisionReasoning = `Mission Approved by KINDRA Primary Object Engine (${confPercent}% Confidence). Reason: ${classification.reasoning}`;
  }
  // RULE 4: Confidence 70–84 -> Needs Manual Review
  else if (confPercent >= 70 && confPercent < 85 && missionMatch) {
    status = 'manual_review_required';
    requiresManualReview = true;
    decisionReasoning = `Needs Manual Review: Confidence score (${confPercent}%) is between 70-84%. Queued for civic officer manual review. Reason: ${classification.reasoning}`;
  }
  // RULE 5: Confidence Below 70 -> Reject
  else {
    status = 'auto_rejected';
    autoRejected = true;
    rejectionReason = `Confidence score (${confPercent}%) is below 70% threshold.`;
    suggestedAction = `Please re-take photo showing primary object(s) clearly for "${expectedActivity}".`;
    decisionReasoning = `Rejected: Confidence score (${confPercent}%) is below 70%. Reason: ${classification.reasoning}`;
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
