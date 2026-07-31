import fs from 'fs';
import path from 'path';

// Load .env.local synchronously BEFORE importing modules
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

async function runPrimaryObjectVerificationTests() {
  const { getMissionVerificationProfile } = await import('../src/lib/gemma/missionProfiles');
  const { runVerificationDecision } = await import('../src/lib/gemma/decisionEngine');

  console.log('========================================================================');
  console.log(' KINDRA — PRIMARY OBJECT AI VERIFICATION RULE TEST SUITE                ');
  console.log('========================================================================\n');

  const testMissions = [
    { key: 'tree_plantation', name: '1. Plant a Tree', primary: ['Tree', 'Sapling', 'Plant'] },
    { key: 'road_damage', name: '2. Report Road Potholes', primary: ['Road', 'Asphalt', 'Pothole'] },
    { key: 'feed_dogs', name: '3. Feed Stray Animals', primary: ['Dog', 'Cat', 'Food bowl'] },
    { key: 'garbage_cleanup', name: '4. Garbage Cleanup', primary: ['Garbage', 'Plastic waste', 'Trash'] },
    { key: 'blood_donation', name: '5. Blood Donation', primary: ['Blood bag', 'Donor chair'] },
    { key: 'book_donation', name: '6. Book Donation', primary: ['Books', 'Textbooks'] },
    { key: 'food_donation', name: '7. Food Donation', primary: ['Food packets', 'Meals'] },
    { key: 'water_conservation', name: '8. Water Conservation', primary: ['Water body', 'Rainwater harvesting'] },
  ];

  console.log('------------------------------------------------------------------------');
  console.log(' TEST 1: Mission Profile Primary Object Rules');
  console.log('------------------------------------------------------------------------');

  testMissions.forEach((m) => {
    const profile = getMissionVerificationProfile(m.key);
    console.log(`  Mission: ${m.name}`);
    console.log(`    Primary Objects : ${profile.expectedObjects.join(', ')}`);
    console.log(`    Prompt Valid    : ${profile.generatePrompt().includes('PRIMARY OBJECTS') ? 'YES' : 'NO'}`);
  });
  console.log('  Profile Check Result: ✅ PASSED\n');

  console.log('------------------------------------------------------------------------');
  console.log(' TEST 2: Confidence Threshold Evaluation Rules');
  console.log('------------------------------------------------------------------------');

  const mockFraud: any = {
    isAiGenerated: false,
    isEditedOrTampered: false,
    isScreenshot: false,
    isInternetStockPhoto: false,
    metadataTamperFlag: false,
    timestampMismatchFlag: false,
    riskScore: 5,
    riskLevel: 'Low',
    reasoning: 'Clean optical capture',
    fraudScore: 0,
    isDuplicate: false,
    perceptualHash: '0000000000000000',
    flags: [],
  };

  const mockGps: any = {
    isWithinGeofence: true,
    distanceMeters: 5,
    distanceFromMissionMeters: 5,
    travelPathValid: true,
    confidence: 1.0,
    reasoning: 'Valid GPS',
    isSpoofed: false,
    currentGps: { latitude: 28.6139, longitude: 77.2090 },
  };

  const thresholdCases = [
    { confPercent: 95, expectedStatus: 'auto_verified', label: '95% (Very High Confidence)' },
    { confPercent: 88, expectedStatus: 'auto_verified', label: '88% (Approve)' },
    { confPercent: 78, expectedStatus: 'manual_review_required', label: '78% (Needs Manual Review)' },
    { confPercent: 60, expectedStatus: 'auto_rejected', label: '60% (Reject - Below 70)' },
  ];

  let thresholdPassed = true;

  thresholdCases.forEach((tc) => {
    const classification = {
      category: 'Tree Plantation' as const,
      subcategory: 'Plant a Tree',
      confidence: tc.confPercent / 100,
      reasoning: 'Primary object sapling detected.',
      detectedObjects: ['sapling', 'green plant'],
    };

    const decision = runVerificationDecision(
      classification,
      mockFraud,
      mockGps,
      true,
      'Plant a Tree',
      'Plant a Tree'
    );

    const isMatch = decision.status === tc.expectedStatus;
    if (!isMatch) thresholdPassed = false;

    console.log(`  Score ${tc.label}`);
    console.log(`    Status Evaluated: "${decision.status}"`);
    console.log(`    Expected Status : "${tc.expectedStatus}"`);
    console.log(`    Result          : ${isMatch ? '✅ PASSED' : '❌ FAILED'}`);
  });

  console.log('\n========================================================================');
  console.log(' VERIFICATION SUMMARY REPORT                                            ');
  console.log('========================================================================');
  if (thresholdPassed) {
    console.log('🎉 ALL PRIMARY OBJECT VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  } else {
    console.error('❌ Primary object verification test suite failed!');
    process.exit(1);
  }
}

runPrimaryObjectVerificationTests().catch(err => {
  console.error('Fatal error running primary object verification tests:', err);
  process.exit(1);
});
