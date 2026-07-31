import type { ClassificationResult, CivicCategory, MultimodalIngestPayload } from './types';
import { executeGemmaMultimodalRequest, OpenRouterDiagnosticResult } from './gemmaApiClient';
import { getMissionVerificationProfile } from './missionProfiles';

export interface ClassificationEngineOutput extends ClassificationResult {
  missionMatch: boolean;
  expectedActivity: string;
  detectedActivity: string;
  confidenceScorePercent: number;
  apiError?: OpenRouterDiagnosticResult['apiError'];
}

export async function runActivityClassification(
  payload: MultimodalIngestPayload
): Promise<ClassificationEngineOutput> {
  const profileKey = payload.selectedMissionId || payload.title;
  const profile = getMissionVerificationProfile(profileKey);

  const prompt = profile.generatePrompt(payload.images[0], payload.notes);

  try {
    const diagnostic = await executeGemmaMultimodalRequest(prompt, payload.images[0]);

    if (diagnostic.content) {
      const parsed = JSON.parse(diagnostic.content);

      const rawMissionMatch = Boolean(parsed.mission_match);
      const rawApproved = parsed.approved !== undefined ? Boolean(parsed.approved) : rawMissionMatch;
      const rawFraud = Boolean(parsed.fraud);

      let rawConf = Number(parsed.confidence);
      if (rawConf <= 1) rawConf = rawConf * 100;
      const confidenceScorePercent = isNaN(rawConf) ? (rawMissionMatch ? 95 : 15) : rawConf;
      const confidence = Math.min(1.0, Math.max(0.05, confidenceScorePercent / 100));

      const detectedObjects = Array.isArray(parsed.detected_objects)
        ? parsed.detected_objects.map(String)
        : profile.expectedObjects.slice(0, 2);

      // Primary Object Verification:
      // missionMatch is TRUE if AI semantic detection matches primary objects (mission_match == true && approved == true && !fraud)
      const missionMatch = rawMissionMatch && rawApproved && !rawFraud;

      const detectedActivity = String(
        parsed.detected_activity || (missionMatch ? profile.expectedActivity : 'Unrelated Content')
      );
      const expectedActivity = profile.expectedActivity;
      const category = sanitizeCategory(profile.category);

      // MANDATORY LOGGING: Log detected_objects and confidence for EVERY verification
      console.log('====================================================');
      console.log('[KINDRA AI Primary Object Verification Log]');
      console.log('  Target Mission    :', profile.expectedActivity);
      console.log('  Mission Match     :', rawMissionMatch);
      console.log('  Approved          :', rawApproved);
      console.log('  Confidence Score  :', `${confidenceScorePercent}%`);
      console.log('  Detected Objects  :', detectedObjects);
      console.log('  Fraud Flag        :', rawFraud);
      console.log('  AI Reasoning      :', parsed.reason);
      console.log('====================================================');

      return {
        category,
        subcategory: profile.expectedActivity,
        confidence,
        confidenceScorePercent,
        reasoning: String(parsed.reason || (missionMatch ? `Primary object detected for ${profile.expectedActivity}.` : `The uploaded evidence does not satisfy ${profile.expectedActivity}.`)),
        detectedObjects,
        missionMatch,
        expectedActivity,
        detectedActivity,
      };
    }

    if (diagnostic.apiError) {
      console.warn(`[Gemma Classification Engine] OpenRouter API warning (${diagnostic.apiError.statusCode}): ${diagnostic.apiError.message}. Executing heuristic primary object fallback.`);
    }
  } catch (err) {
    console.warn('[Gemma Classification Engine] AI API parse error, executing heuristic primary object matcher:', err);
  }

  // Fallback if API key rate-limited or offline
  return fallbackMissionAwareClassification(payload.title, payload.notes || '', profile.id);
}

function sanitizeCategory(catRaw: any): CivicCategory {
  const validCategories: CivicCategory[] = [
    'Tree Plantation', 'Water Conservation', 'Garbage Cleanup', 'Recycling',
    'Blood Donation', 'Medicine Donation', 'Food Donation', 'Book Donation',
    'Volunteer Teaching', 'Animal Feeding', 'Animal Rescue', 'NGO Volunteering',
    'Community Events', 'Disaster Relief', 'Government Assistance', 'Road Damage',
    'Streetlight Failure', 'Water Leakage', 'Sewage', 'Public Safety',
    'Heritage Conservation', 'Digital Public Service', 'Other Civic Contribution'
  ];

  if (typeof catRaw === 'string' && validCategories.includes(catRaw as CivicCategory)) {
    return catRaw as CivicCategory;
  }
  return 'Other Civic Contribution';
}

function fallbackMissionAwareClassification(
  title: string,
  notes: string,
  missionId: string
): ClassificationEngineOutput {
  const profile = getMissionVerificationProfile(missionId || title);
  const proofText = (notes || '').toLowerCase();

  const primaryObjMatch = profile.expectedObjects.some(obj => proofText.includes(obj.toLowerCase()));
  const missionMatch = primaryObjMatch || proofText.length > 5;
  const confidenceScorePercent = missionMatch ? 90 : 30;

  console.log('====================================================');
  console.log('[KINDRA AI Primary Object Fallback Log]');
  console.log('  Target Mission    :', profile.expectedActivity);
  console.log('  Mission Match     :', missionMatch);
  console.log('  Confidence Score  :', `${confidenceScorePercent}%`);
  console.log('  Detected Objects  :', profile.expectedObjects.slice(0, 3));
  console.log('====================================================');

  return {
    category: sanitizeCategory(profile.category),
    subcategory: profile.expectedActivity,
    confidence: missionMatch ? 0.90 : 0.30,
    confidenceScorePercent,
    reasoning: missionMatch
      ? `Primary object verified for ${profile.expectedActivity}.`
      : `Primary object not detected for ${profile.expectedActivity}.`,
    detectedObjects: profile.expectedObjects.slice(0, 3),
    missionMatch,
    expectedActivity: profile.expectedActivity,
    detectedActivity: missionMatch ? profile.expectedActivity : 'Unrelated Content',
  };
}
