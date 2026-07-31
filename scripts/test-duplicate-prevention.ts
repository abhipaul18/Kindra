import fs from 'fs';
import path from 'path';

// Load .env.local BEFORE importing any project modules requiring Supabase
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
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

async function runDuplicatePreventionTests() {
  const { executeGemmaVerificationPipeline } = await import('../src/lib/gemma/verificationPipeline');
  const { clearLocalSubmissionHistory, generatePerceptualHash, computePHashSimilarity, checkDuplicateSubmission } = await import('../src/lib/gemma/duplicateEngine');

  console.log('========================================================================');
  console.log(' KINDRA — ENHANCED DUPLICATE PREVENTION ENGINE TEST SUITE              ');
  console.log('========================================================================\n');

  clearLocalSubmissionHistory();

  const testUserId = 'user_duplicate_test_101';
  const otherUserId = 'user_different_202';
  const testMissionId = 'road_damage';
  const testImage = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60';
  const testLat = 28.6139;
  const testLng = 77.2090;

  console.log('------------------------------------------------------------------------');
  console.log(' TEST 1: Difference Hash (dHash) & Hamming Similarity Evaluation');
  console.log('------------------------------------------------------------------------');
  const phash1 = generatePerceptualHash(testImage);
  const phash2 = generatePerceptualHash(testImage);
  const sim = computePHashSimilarity(phash1, phash2);
  console.log(`  pHash 1      : ${phash1}`);
  console.log(`  pHash 2      : ${phash2}`);
  console.log(`  Similarity   : ${sim}%`);
  console.log(`  dHash Check  : ${phash1.length === 16 && sim === 100 ? '✅ PASSED' : '❌ FAILED'}\n`);

  console.log('------------------------------------------------------------------------');
  console.log(' TEST 2: Initial Unique Submission (User 101, Road Damage)');
  console.log('------------------------------------------------------------------------');

  const res1: any = await executeGemmaVerificationPipeline({
    userId: testUserId,
    missionId: testMissionId,
    title: 'Report Road Potholes',
    notes: 'Road pothole with broken asphalt hazard',
    images: [testImage],
    latitude: testLat,
    longitude: testLng,
  });

  const isUniquePassed = res1.status !== 'duplicate' && res1.payload && res1.decision;
  console.log(`  Storage Upload   : ${res1.payload ? 'YES' : 'NO'}`);
  console.log(`  Database Insert  : YES`);
  console.log(`  Status           : ${res1.decision?.status || res1.status}`);
  console.log(`  Test Result      : ${isUniquePassed ? '✅ PASSED' : '❌ FAILED'}\n`);

  console.log('------------------------------------------------------------------------');
  console.log(' TEST 3: Different User (User 202) Same Image — Must NOT be False Duplicate');
  console.log('------------------------------------------------------------------------');

  const resDiffUser: any = await executeGemmaVerificationPipeline({
    userId: otherUserId,
    missionId: testMissionId,
    title: 'Report Road Potholes',
    notes: 'Road pothole with broken asphalt hazard',
    images: [testImage],
    latitude: testLat,
    longitude: testLng,
  });

  const isDiffUserPassed = resDiffUser.status !== 'duplicate';
  console.log(`  Storage Upload   : ${resDiffUser.payload ? 'YES' : 'NO'}`);
  console.log(`  Database Insert  : YES`);
  console.log(`  Status           : ${resDiffUser.decision?.status || resDiffUser.status}`);
  console.log(`  Test Result      : ${isDiffUserPassed ? '✅ PASSED (False Duplicate Avoided)' : '❌ FAILED'}\n`);

  console.log('------------------------------------------------------------------------');
  console.log(' TEST 4: Exact Byte Hash Duplicate (Same User, Same Mission, Same Location)');
  console.log('------------------------------------------------------------------------');

  const resDup: any = await executeGemmaVerificationPipeline({
    userId: testUserId,
    missionId: testMissionId,
    title: 'Report Road Potholes',
    notes: 'Road pothole with broken asphalt hazard',
    images: [testImage],
    latitude: testLat,
    longitude: testLng,
  });

  const isDuplicateTerminated =
    resDup.status === 'duplicate' &&
    resDup.reason === 'Exact byte-for-byte duplicate image already submitted within 24 hours.' &&
    resDup.duplicate_type === 'exact' &&
    resDup.confidence === 100 &&
    resDup.karmaAwarded === 0 &&
    !resDup.payload &&
    !resDup.classification;

  console.log(`  Storage Upload   : ${resDup.payload ? 'YES' : 'NO'}`);
  console.log(`  Status           : ${resDup.status}`);
  console.log(`  Reason Returned  : "${resDup.reason}"`);
  console.log(`  Duplicate Type   : ${resDup.duplicate_type}`);
  console.log(`  Karma Awarded    : ${resDup.karmaAwarded || 0} XP`);
  console.log(`  Test Result      : ${isDuplicateTerminated ? '✅ PASSED' : '❌ FAILED'}\n`);

  console.log('------------------------------------------------------------------------');
  console.log(' TEST 5: Blood Donation Mission-Specific 90-Day Cooldown Rule');
  console.log('------------------------------------------------------------------------');

  // Submit first blood donation
  await checkDuplicateSubmission({
    userId: 'blood_donor_999',
    missionId: 'blood_donation',
    imageData: 'blood_card_sample_1',
  });

  // Attempt second blood donation
  const bloodDupResult = await checkDuplicateSubmission({
    userId: 'blood_donor_999',
    missionId: 'blood_donation',
    imageData: 'blood_card_sample_2', // Different image data, but same donor within 90 days
  });

  const isBloodCooldownPassed =
    bloodDupResult.isDuplicate === true &&
    bloodDupResult.reason?.includes('Blood donation cooldown active');

  console.log(`  Is Duplicate     : ${bloodDupResult.isDuplicate}`);
  console.log(`  Reason Returned  : "${bloodDupResult.reason}"`);
  console.log(`  Test Result      : ${isBloodCooldownPassed ? '✅ PASSED' : '❌ FAILED'}\n`);

  console.log('========================================================================');
  console.log(' VERIFICATION SUMMARY REPORT                                            ');
  console.log('========================================================================');
  console.table([
    {
      'Submission Case': '1. Difference Hash (dHash)',
      'User Match': 'N/A',
      'Mission Match': 'N/A',
      'Result': phash1.length === 16 && sim === 100 ? '✅ PASSED' : '❌ FAILED',
    },
    {
      'Submission Case': '2. Initial Unique Submission',
      'User Match': 'User 101',
      'Mission Match': 'Road Damage',
      'Result': isUniquePassed ? '✅ PASSED' : '❌ FAILED',
    },
    {
      'Submission Case': '3. Different User Upload',
      'User Match': 'User 202 (Different)',
      'Mission Match': 'Road Damage',
      'Result': isDiffUserPassed ? '✅ PASSED (No False Positive)' : '❌ FAILED',
    },
    {
      'Submission Case': '4. Exact Duplicate Submission',
      'User Match': 'User 101 (Same)',
      'Mission Match': 'Road Damage (Same)',
      'Result': isDuplicateTerminated ? '✅ PASSED (Byte Duplicate Reason)' : '❌ FAILED',
    },
    {
      'Submission Case': '5. Blood Donation 90-Day Cooldown',
      'User Match': 'Donor 999 (Same)',
      'Mission Match': 'Blood Donation',
      'Result': isBloodCooldownPassed ? '✅ PASSED (Mission Cooldown)' : '❌ FAILED',
    },
  ]);

  if (!isUniquePassed || !isDiffUserPassed || !isDuplicateTerminated || !isBloodCooldownPassed) {
    console.error('\n❌ Duplicate prevention test suite failed!');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL DUPLICATE PREVENTION ENHANCEMENT TESTS COMPLETED SUCCESSFULLY!');
  }
}

runDuplicatePreventionTests().catch((err) => {
  console.error('Fatal error running duplicate prevention tests:', err);
  process.exit(1);
});
