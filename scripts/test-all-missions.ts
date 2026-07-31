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
import { MISSION_PROFILES } from '../src/lib/gemma/missionProfiles';
import type { MultimodalIngestPayload, FraudDetectionResult } from '../src/lib/gemma/types';

interface TestSpec {
  testType: 'Valid Image' | 'Wrong Mission' | 'Screenshot' | 'Blank Image' | 'AI Generated Unrelated' | 'Duplicate Image' | 'Blurry Image';
  imageUrl: string;
  notes: string;
  expectedResult: 'PASS' | 'FAIL';
  isDuplicate?: boolean;
  isScreenshot?: boolean;
  isAiGenerated?: boolean;
}

const SAMPLE_ROAD_DAMAGED_IMG = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60';
const SAMPLE_PLANT_IMG = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60';
const SAMPLE_DOG_FEEDING_IMG = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=60';
const SAMPLE_GARBAGE_CLEANUP_IMG = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=60';
const SAMPLE_BLOOD_DONATION_IMG = 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&auto=format&fit=crop&q=60';
const SAMPLE_FOOD_DONATION_IMG = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=60';

// Mission specific descriptive notes containing expected domain keywords
const MISSION_VALID_NOTES: Record<string, string> = {
  tree_plantation: 'Newly planted young tree sapling in outdoor soil and garden',
  road_damage: 'Road pothole with broken asphalt and cracked pavement hazard',
  garbage_cleanup: 'Community garbage cleanup drive with trash bags and plastic waste',
  feed_dogs: 'Feeding street dogs eating dog food from food bowls in neighborhood',
  feed_cats: 'Feeding street cats eating cat food outdoors',
  animal_rescue: 'Injured animal receiving rescue treatment and veterinary care in cage',
  blood_donation: 'Blood donation bag and donor chair in clinical hospital setting',
  food_donation: 'Food donation meals and cooked food distribution packets',
  book_donation: 'Educational school books stack donated to library drop-off box',
  volunteer_teaching: 'Volunteer teaching classroom session with teacher at whiteboard and students',
  medicine_donation: 'Essential pharmaceutical medicines and first aid supplies donated to clinic',
  clothes_donation: 'Clothes donation bags and folded garments distributed to community',
  water_conservation: 'Rainwater harvesting tank installation and water body cleaning project',
  plastic_recycling: 'Segregated plastic bottles collection in recycling bin station',
  beach_cleanup: 'Coastal beach cleanup drive collecting marine trash bags on ocean shore',
  park_cleanup: 'Public park cleanliness drive collecting litter and trash bags',
  tree_watering: 'Tree watering activity with watering can around sapling soil',
  illegal_dumping: 'Illegal garbage dumping ground waste pile on public roadside',
  street_lights: 'Broken streetlight pole with damaged luminaire lamp fixture',
  damaged_public_property: 'Damaged public park bench infrastructure requiring repair',
  overflowing_dustbins: 'Overflowing public dustbin with garbage spilled on sidewalk',
};

async function executeTestSuite() {
  console.log('========================================================================');
  console.log(' KINDRA — DYNAMIC AI VERIFICATION ENGINE REPORT (ALL 21 MISSIONS)       ');
  console.log('========================================================================\n');

  const missionKeys = Object.keys(MISSION_PROFILES).filter(k => k !== 'default_profile');
  let totalTestsExecuted = 0;
  let totalTestsPassed = 0;
  let totalTestsFailed = 0;

  const reportRows: Array<{
    mission: string;
    validPass: boolean;
    wrongMissionFail: boolean;
    screenshotFail: boolean;
    blankFail: boolean;
    aiGeneratedFail: boolean;
    duplicateFail: boolean;
    blurryFail: boolean;
    overallStatus: 'PASS' | 'FAIL';
  }> = [];

  for (const missionKey of missionKeys) {
    const profile = MISSION_PROFILES[missionKey];

    // Determine appropriate valid test image
    let validImgUrl = SAMPLE_PLANT_IMG;
    if (missionKey === 'road_damage' || missionKey === 'street_lights' || missionKey === 'damaged_public_property') {
      validImgUrl = SAMPLE_ROAD_DAMAGED_IMG;
    } else if (missionKey.includes('dog') || missionKey.includes('cat') || missionKey === 'animal_rescue') {
      validImgUrl = SAMPLE_DOG_FEEDING_IMG;
    } else if (missionKey.includes('garbage') || missionKey.includes('plastic') || missionKey.includes('beach') || missionKey.includes('park') || missionKey.includes('dumping') || missionKey.includes('dustbin')) {
      validImgUrl = SAMPLE_GARBAGE_CLEANUP_IMG;
    } else if (missionKey.includes('blood') || missionKey.includes('medicine')) {
      validImgUrl = SAMPLE_BLOOD_DONATION_IMG;
    } else if (missionKey.includes('food') || missionKey.includes('clothes') || missionKey.includes('book') || missionKey.includes('teaching')) {
      validImgUrl = SAMPLE_FOOD_DONATION_IMG;
    }

    const validNote = MISSION_VALID_NOTES[missionKey] || `Valid evidence proof for ${profile.expectedActivity}`;

    const testSpecs: TestSpec[] = [
      { testType: 'Valid Image', imageUrl: validImgUrl, notes: validNote, expectedResult: 'PASS' },
      { testType: 'Wrong Mission', imageUrl: validImgUrl === SAMPLE_PLANT_IMG ? SAMPLE_ROAD_DAMAGED_IMG : SAMPLE_PLANT_IMG, notes: 'Indoor bedroom selfie holding phone', expectedResult: 'FAIL' },
      { testType: 'Screenshot', imageUrl: SAMPLE_PLANT_IMG, notes: 'Phone screen screenshot of social media post', expectedResult: 'FAIL', isScreenshot: true },
      { testType: 'Blank Image', imageUrl: SAMPLE_PLANT_IMG, notes: 'Blank white image screen asset', expectedResult: 'FAIL' },
      { testType: 'AI Generated Unrelated', imageUrl: SAMPLE_PLANT_IMG, notes: 'AI generated synthetic graphic illustration', expectedResult: 'FAIL', isAiGenerated: true },
      { testType: 'Duplicate Image', imageUrl: validImgUrl, notes: validNote, expectedResult: 'FAIL', isDuplicate: true },
      { testType: 'Blurry Image', imageUrl: SAMPLE_PLANT_IMG, notes: 'Blurry unusable out of focus image', expectedResult: 'FAIL' },
    ];

    let missionAllPassed = true;
    const testResults: Record<string, boolean> = {};

    for (const spec of testSpecs) {
      totalTestsExecuted++;

      const payload: MultimodalIngestPayload = {
        userId: 'test_audit_user',
        selectedMissionId: profile.id,
        title: profile.expectedActivity,
        notes: spec.notes,
        images: [spec.imageUrl],
        gps: { currentLat: 28.6139, currentLng: 77.2090 },
      };

      const classification = await runActivityClassification(payload);
      const dummyGps = runGPSValidation(payload);

      const fraud: FraudDetectionResult = {
        fraudScore: (spec.isDuplicate || spec.isScreenshot || spec.isAiGenerated) ? 85 : 0,
        isDuplicate: Boolean(spec.isDuplicate),
        perceptualHash: spec.isDuplicate ? 'HASH_DUP_123' : 'HASH_UNIQUE_999',
        isAiGenerated: Boolean(spec.isAiGenerated),
        isEditedOrTampered: false,
        metadataTamperFlag: false,
        timestampMismatchFlag: false,
        isFakeGps: false,
        isInternetStockPhoto: false,
        isScreenshot: Boolean(spec.isScreenshot),
        riskLevel: (spec.isDuplicate || spec.isScreenshot || spec.isAiGenerated) ? 'High' : 'Low',
        reasoning: spec.notes,
      };

      const decision = runVerificationDecision(
        classification,
        fraud,
        dummyGps,
        classification.missionMatch,
        classification.expectedActivity,
        classification.detectedActivity
      );

      const actualResult = (decision.status === 'auto_verified' || decision.status === 'verified_low_confidence') ? 'PASS' : 'FAIL';
      const isTestPassing = actualResult === spec.expectedResult;

      testResults[spec.testType] = isTestPassing;

      if (isTestPassing) {
        totalTestsPassed++;
      } else {
        totalTestsFailed++;
        missionAllPassed = false;
      }
    }

    reportRows.push({
      mission: profile.expectedActivity,
      validPass: testResults['Valid Image'],
      wrongMissionFail: testResults['Wrong Mission'],
      screenshotFail: testResults['Screenshot'],
      blankFail: testResults['Blank Image'],
      aiGeneratedFail: testResults['AI Generated Unrelated'],
      duplicateFail: testResults['Duplicate Image'],
      blurryFail: testResults['Blurry Image'],
      overallStatus: missionAllPassed ? 'PASS' : 'FAIL',
    });
  }

  console.log('\n========================================================================================================');
  console.log(' KINDRA AI VERIFICATION ENGINE — COMPREHENSIVE 21-MISSION VERIFICATION REPORT                          ');
  console.log('========================================================================================================');
  console.table(
    reportRows.map((r, idx) => ({
      '#': idx + 1,
      'Mission Profile': r.mission,
      'Valid Evidence': r.validPass ? '✅ PASS' : '❌ FAIL',
      'Wrong Mission': r.wrongMissionFail ? '✅ REJECT' : '❌ FAIL',
      'Screenshot': r.screenshotFail ? '✅ REJECT' : '❌ FAIL',
      'Blank Image': r.blankFail ? '✅ REJECT' : '❌ FAIL',
      'AI Generated': r.aiGeneratedFail ? '✅ REJECT' : '❌ FAIL',
      'Duplicate': r.duplicateFail ? '✅ REJECT' : '❌ FAIL',
      'Blurry Image': r.blurryFail ? '✅ REJECT' : '❌ FAIL',
      'Overall': r.overallStatus === 'PASS' ? '✅ PASSED' : '❌ FAILED',
    }))
  );

  console.log('\n--------------------------------------------------------------------------------------------------------');
  console.log(`TOTAL EXECUTED : ${totalTestsExecuted}`);
  console.log(`TOTAL PASSED   : ${totalTestsPassed} / ${totalTestsExecuted}`);
  console.log(`TOTAL FAILED   : ${totalTestsFailed} / ${totalTestsExecuted}`);
  console.log('========================================================================================================');

  if (totalTestsFailed > 0) {
    process.exit(1);
  }
}

executeTestSuite().catch(err => {
  console.error('Fatal error running verification test suite:', err);
  process.exit(1);
});
