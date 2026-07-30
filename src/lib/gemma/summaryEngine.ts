import type {
  AISummariesResult,
  ClassificationResult,
  VisionAnalysisResult,
  GPSValidationResult,
  SmartRoutingResult,
  VerificationDecisionResult,
  MultimodalIngestPayload,
} from './types';

export function runSummaryGeneration(
  payload: MultimodalIngestPayload,
  classification: ClassificationResult,
  vision: VisionAnalysisResult,
  gps: GPSValidationResult,
  routing: SmartRoutingResult,
  decision: VerificationDecisionResult
): AISummariesResult {
  const confidencePct = (decision.confidenceScore * 100).toFixed(0);
  const locationStr = payload.notes ? payload.notes.substring(0, 40) : 'GPS Verified Location';

  const executiveSummary = `${classification.category} activity detected near ${locationStr}. GPS geofence ${
    gps.isWithinGeofence ? 'verified' : 'flagged'
  }. Gemma AI Confidence ${confidencePct}%. Status: ${decision.status}. Routed to ${routing.destinationDepartment}.`;

  const citizenSummary = `Your ${classification.category} submission ("${payload.title}") was analyzed by Gemma AI Vision. ${
    decision.status.includes('verified')
      ? 'Verification successful! Thank you for contributing to your community.'
      : decision.status === 'manual_review_required'
      ? 'Your proof has been forwarded to municipal reviewers for quick confirmation.'
      : 'Your submission requires additional evidence.'
  }`;

  const officerSummary = `[OFFICER BRIEF] Report ID: #${payload.reportId || payload.submissionId || 'N/A'}. Category: ${
    classification.category
  } (${classification.subcategory}). Location: GPS (${gps.currentGps.lat.toFixed(4)}, ${gps.currentGps.lng.toFixed(
    4
  )}). AI Confidence: ${confidencePct}%. Key detected objects: ${vision.detectedObjects.join(', ')}. Action: ${
    routing.destinationDepartment
  } field dispatch.`;

  const ngoSummary = `[NGO COLLABORATION BRIEF] Civic initiative "${payload.title}" verified for community partner assignment. Category: ${classification.category}. Target Entity: ${routing.routingTargetEntity}. Status: ${decision.status}.`;

  return {
    executiveSummary,
    citizenSummary,
    officerSummary,
    ngoSummary,
  };
}
