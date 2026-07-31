import fs from 'fs';
import path from 'path';

// Load .env.local manually
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...vals] = trimmed.split('=');
        if (key && vals.length > 0) {
          process.env[key.trim()] = vals.join('=').trim();
        }
      }
    });
  }
} catch (e) {}

import { runActivityClassification } from '../src/lib/gemma/classificationEngine';
import { runVerificationDecision } from '../src/lib/gemma/decisionEngine';
import { runGPSValidation } from '../src/lib/gemma/gpsEngine';
import { evaluateDynamicKarma } from '../src/lib/gemma/karmaEngine';
import type { MultimodalIngestPayload } from '../src/lib/gemma/types';

interface TestCase {
  missionId: string;
  missionTitle: string;
  uploadDescription: string;
  imageUrl: string;
  expectedResult: 'PASS' | 'FAIL';
}

const POTHOLE_IMG = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60';
const PLANT_IMG = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60';

const TEST_MATRIX: TestCase[] = [
  // PASS Test Cases for "Report Road Potholes" (road_damage) using Road Damage image
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Road with large pothole and broken asphalt hazard', imageUrl: POTHOLE_IMG, expectedResult: 'PASS' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Road with cracked asphalt surface depression', imageUrl: POTHOLE_IMG, expectedResult: 'PASS' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Damaged concrete road with deep cavity defect', imageUrl: POTHOLE_IMG, expectedResult: 'PASS' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Broken pavement and missing road surface', imageUrl: POTHOLE_IMG, expectedResult: 'PASS' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Road erosion and large road crack hazard', imageUrl: POTHOLE_IMG, expectedResult: 'PASS' },

  // FAIL Test Cases for "Report Road Potholes" (Unrelated Content Must Reject) using Non-Road image
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Tree plantation with green sapling in soil', imageUrl: PLANT_IMG, expectedResult: 'FAIL' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Garbage cleanup drive with trash bags pile', imageUrl: PLANT_IMG, expectedResult: 'FAIL' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Blood donation chair and clinical donor card', imageUrl: PLANT_IMG, expectedResult: 'FAIL' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Food donation distribution meal packets', imageUrl: PLANT_IMG, expectedResult: 'FAIL' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Street dog eating food from bowl on pavement', imageUrl: PLANT_IMG, expectedResult: 'FAIL' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Commercial highrise building architecture view', imageUrl: PLANT_IMG, expectedResult: 'FAIL' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Indoor living room with sofa and furniture', imageUrl: PLANT_IMG, expectedResult: 'FAIL' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Car parking lot with parked sedan vehicles only', imageUrl: PLANT_IMG, expectedResult: 'FAIL' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Person selfie holding phone in bedroom', imageUrl: PLANT_IMG, expectedResult: 'FAIL' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Blank white image screen asset', imageUrl: PLANT_IMG, expectedResult: 'FAIL' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Phone screen screenshot of social media post', imageUrl: PLANT_IMG, expectedResult: 'FAIL' },
];

async function runTestSuite() {
  console.log('====================================================');
  console.log(' KINDRA — "Report Road Potholes" Verification Suite ');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < TEST_MATRIX.length; i++) {
    const test = TEST_MATRIX[i];
    const payload: MultimodalIngestPayload = {
      userId: 'test_user_01',
      selectedMissionId: test.missionId,
      title: test.missionTitle,
      notes: test.uploadDescription,
      images: [test.imageUrl],
      gps: { currentLat: 28.6139, currentLng: 77.2090 },
    };

    const classification = await runActivityClassification(payload);

    const dummyGps = runGPSValidation(payload);
    const dummyFraud = {
      fraudScore: 0,
      isDuplicate: false,
      perceptualHash: '000',
      isAiGenerated: false,
      isEditedOrTampered: false,
      metadataTamperFlag: false,
      timestampMismatchFlag: false,
      isFakeGps: false,
      isInternetStockPhoto: false,
      isScreenshot: false,
      riskLevel: 'Low' as const,
      reasoning: 'Clean test',
    };

    const decision = runVerificationDecision(
      classification,
      dummyFraud,
      dummyGps,
      classification.missionMatch,
      classification.expectedActivity,
      classification.detectedActivity
    );

    const karma = evaluateDynamicKarma(
      classification,
      { environmentalScore: 50, communityScore: 50, urgencyRating: 50, difficultyRating: 50, volunteerHours: 1, beneficiariesCount: 1, socialValueScore: 50, totalImpactScore: 50 },
      dummyFraud,
      decision.status === 'auto_verified' ? decision.confidenceScore : 0
    );

    const actualResult = (decision.status === 'auto_verified' || decision.status === 'verified_low_confidence') ? 'PASS' : 'FAIL';
    const isTestPassing = actualResult === test.expectedResult;

    if (isTestPassing) passedCount++;
    else failedCount++;

    console.log(`Test #${i + 1}: Mission: "${test.missionTitle}" | Upload: "${test.uploadDescription}"`);
    console.log(`  Expected: ${test.expectedResult} | Actual: ${actualResult} | Karma: ${karma.finalKarmaAwarded} XP`);
    console.log(`  Mission Match Boolean: ${classification.missionMatch} | Detected: "${classification.detectedActivity}"`);
    console.log(`  Reason: ${classification.reasoning}`);
    console.log(`  Result: ${isTestPassing ? '✅ PASSED TEST' : '❌ FAILED TEST'}\n`);
  }

  console.log('----------------------------------------------------');
  console.log(`TOTAL PASSED: ${passedCount} / ${TEST_MATRIX.length}`);
  console.log(`TOTAL FAILED: ${failedCount} / ${TEST_MATRIX.length}`);
  console.log('====================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test runner execution error:', err);
  process.exit(1);
});
