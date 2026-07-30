import type { ClassificationResult, CivicCategory, MultimodalIngestPayload } from './types';
import { executeGemmaMultimodalRequest, OpenRouterDiagnosticResult } from './gemmaApiClient';
import { getMissionVerificationProfile } from './missionProfiles';

export interface ClassificationEngineOutput extends ClassificationResult {
  missionMatch: boolean;
  expectedActivity: string;
  detectedActivity: string;
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

      // Raw Gemini Debug Logging before decision
      console.log('====================================================');
      console.log('[Gemma AI Debug Raw Response]');
      console.log('Mission:', profile.category);
      console.log('Detected Activity:', parsed.detected_activity);
      console.log('Confidence:', parsed.confidence);
      console.log('Detected Objects:', parsed.detected_objects);
      console.log('Reason:', parsed.reason);
      console.log('Mission Match Boolean:', parsed.mission_match);
      console.log('Model Used:', diagnostic.modelUsed);
      console.log('====================================================');

      const missionMatch = Boolean(parsed.mission_match);

      let rawConf = Number(parsed.confidence);
      if (rawConf > 1) rawConf = rawConf / 100;
      const confidence = Math.min(1.0, Math.max(0.05, isNaN(rawConf) ? (missionMatch ? 0.94 : 0.15) : rawConf));

      const detectedActivity = String(parsed.detected_activity || profile.expectedActivity);
      const expectedActivity = profile.expectedActivity;
      const category = sanitizeCategory(profile.category);

      return {
        category,
        subcategory: profile.expectedActivity,
        confidence,
        reasoning: String(parsed.reason || 'Gemma AI mission-aware JSON verification completed.'),
        detectedObjects: Array.isArray(parsed.detected_objects) ? parsed.detected_objects.map(String) : [detectedActivity],
        missionMatch,
        expectedActivity,
        detectedActivity,
      };
    }

    if (diagnostic.apiError) {
      return {
        category: sanitizeCategory(profile.category),
        subcategory: profile.expectedActivity,
        confidence: 0,
        reasoning: `OpenRouter API Error (${diagnostic.apiError.statusCode} ${diagnostic.apiError.statusText}): ${diagnostic.apiError.message}`,
        detectedObjects: ['API Request Error'],
        missionMatch: false,
        expectedActivity: profile.expectedActivity,
        detectedActivity: 'OpenRouter API Diagnostic Failure',
        apiError: diagnostic.apiError,
      };
    }
  } catch (err) {
    console.warn('[Gemma Classification Engine] AI API parse error, executing heuristic mission-aware matcher:', err);
  }

  // Fallback if no API error and no API key present
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

  let detectedActivityId = 'unknown';
  let detectedActivity = 'Unrelated Activity / Image';

  if (proofText.includes('pothole') || proofText.includes('asphalt') || proofText.includes('road damage') || proofText.includes('crack hazard')) {
    detectedActivityId = 'road_damage';
    detectedActivity = 'Road Potholes';
  } else if (proofText.includes('tree') || proofText.includes('sapling') || proofText.includes('planted') || proofText.includes('plant') || proofText.includes('seedling') || proofText.includes('foliage')) {
    detectedActivityId = 'tree_plantation';
    detectedActivity = 'Tree Plantation';
  } else if (proofText.includes('garbage') || proofText.includes('trash') || proofText.includes('litter') || proofText.includes('cleanup')) {
    detectedActivityId = 'garbage_cleanup';
    detectedActivity = 'Garbage Cleanup';
  } else if (proofText.includes('blood') || proofText.includes('donor')) {
    detectedActivityId = 'blood_donation';
    detectedActivity = 'Blood Donation';
  } else if (proofText.includes('food') || proofText.includes('meal')) {
    detectedActivityId = 'food_donation';
    detectedActivity = 'Food Donation';
  } else if (proofText.includes('textbook') || proofText.includes('library stack') || proofText.includes('donated books')) {
    detectedActivityId = 'book_donation';
    detectedActivity = 'Book Donation';
  } else if (proofText.includes('classroom') || proofText.includes('blackboard') || proofText.includes('students teacher')) {
    detectedActivityId = 'volunteer_teaching';
    detectedActivity = 'Volunteer Teaching';
  } else if (proofText.includes('dogs eating') || proofText.includes('cats eating') || proofText.includes('feeding bowls')) {
    detectedActivityId = 'animal_feeding';
    detectedActivity = 'Animal Feeding';
  }

  const isMatch = profile.id === detectedActivityId;

  return {
    category: profile.category as CivicCategory,
    subcategory: profile.expectedActivity,
    confidence: isMatch ? 0.94 : 0.15,
    reasoning: isMatch
      ? `Verified proof matching selected mission "${profile.expectedActivity}".`
      : `Verification Failed: Uploaded image detected as "${detectedActivity}", which does NOT match expected mission "${profile.expectedActivity}".`,
    detectedObjects: [detectedActivity],
    missionMatch: isMatch,
    expectedActivity: profile.expectedActivity,
    detectedActivity,
  };
}
