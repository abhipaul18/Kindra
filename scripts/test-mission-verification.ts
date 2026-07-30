import { runActivityClassification } from '../src/lib/gemma/classificationEngine';
import { runVerificationDecision } from '../src/lib/gemma/decisionEngine';
import { runGPSValidation } from '../src/lib/gemma/gpsEngine';
import { evaluateDynamicKarma } from '../src/lib/gemma/karmaEngine';
import type { MultimodalIngestPayload } from '../src/lib/gemma/types';

interface TestCase {
  missionId: string;
  missionTitle: string;
  uploadDescription: string;
  expectedResult: 'PASS' | 'FAIL';
}

const TEST_MATRIX: TestCase[] = [
  // Plant a Tree semantic variations (all MUST PASS)
  { missionId: 'tree_plantation', missionTitle: 'Plant a Tree', uploadDescription: 'person planting a young tree in soil', expectedResult: 'PASS' },
  { missionId: 'tree_plantation', missionTitle: 'Plant a Tree', uploadDescription: 'tree sapling in garden soil', expectedResult: 'PASS' },
  { missionId: 'tree_plantation', missionTitle: 'Plant a Tree', uploadDescription: 'planting vegetation outdoor garden', expectedResult: 'PASS' },
  { missionId: 'tree_plantation', missionTitle: 'Plant a Tree', uploadDescription: 'small tree newly planted in earth', expectedResult: 'PASS' },
  
  // Rejections for Plant a Tree
  { missionId: 'tree_plantation', missionTitle: 'Plant a Tree', uploadDescription: 'Deep pothole road damage asphalt', expectedResult: 'FAIL' },
  { missionId: 'tree_plantation', missionTitle: 'Plant a Tree', uploadDescription: 'Overflowing garbage dumpster trash bags', expectedResult: 'FAIL' },

  // Road Potholes
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'Pothole asphalt road crack hazard', expectedResult: 'PASS' },
  { missionId: 'road_damage', missionTitle: 'Report Road Potholes', uploadDescription: 'tree sapling in garden soil', expectedResult: 'FAIL' },

  // Garbage Cleanup
  { missionId: 'garbage_cleanup', missionTitle: 'Garbage Cleanup', uploadDescription: 'Garbage bags trash cleanup litter', expectedResult: 'PASS' },
  { missionId: 'garbage_cleanup', missionTitle: 'Garbage Cleanup', uploadDescription: 'tree sapling in garden soil', expectedResult: 'FAIL' },

  // Blood Donation
  { missionId: 'blood_donation', missionTitle: 'Blood Donation Drive', uploadDescription: 'Blood donor card hospital red cross', expectedResult: 'PASS' },
  { missionId: 'blood_donation', missionTitle: 'Blood Donation Drive', uploadDescription: 'tree sapling in garden soil', expectedResult: 'FAIL' },

  // Book Donation
  { missionId: 'book_donation', missionTitle: 'Book Donation', uploadDescription: 'Educational textbooks library stack', expectedResult: 'PASS' },
  { missionId: 'book_donation', missionTitle: 'Book Donation', uploadDescription: 'Deep pothole road damage asphalt', expectedResult: 'FAIL' },
];

async function runTestSuite() {
  console.log('====================================================');
  console.log(' KINDRA — Structured JSON Semantic Verification Test ');
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
      images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60'],
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
