import type { ImpactScoreResult, ClassificationResult, VisionAnalysisResult, MultimodalIngestPayload } from './types';

export function runImpactCalculation(
  payload: MultimodalIngestPayload,
  classification: ClassificationResult,
  vision: VisionAnalysisResult
): ImpactScoreResult {
  let environmentalScore = 50;
  let communityScore = 60;
  let urgencyRating = 50;
  let difficultyRating = 50;
  let volunteerHours = 2.0;
  let beneficiariesCount = 10;
  let socialValueScore = 65;

  const category = classification.category;

  // Domain-specific score calibrations
  switch (category) {
    case 'Tree Plantation':
    case 'Water Conservation':
    case 'Garbage Cleanup':
    case 'Recycling':
    case 'Heritage Conservation':
      environmentalScore = 95;
      communityScore = 80;
      urgencyRating = 60;
      difficultyRating = 70;
      volunteerHours = 3.5;
      beneficiariesCount = 50;
      socialValueScore = 90;
      break;

    case 'Blood Donation':
    case 'Medicine Donation':
    case 'Food Donation':
    case 'Disaster Relief':
    case 'Animal Rescue':
      environmentalScore = 40;
      communityScore = 98;
      urgencyRating = 95;
      difficultyRating = 85;
      volunteerHours = 4.0;
      beneficiariesCount = 100;
      socialValueScore = 98;
      break;

    case 'Volunteer Teaching':
    case 'Book Donation':
    case 'NGO Volunteering':
    case 'Digital Public Service':
      environmentalScore = 30;
      communityScore = 90;
      urgencyRating = 50;
      difficultyRating = 75;
      volunteerHours = 5.0;
      beneficiariesCount = 35;
      socialValueScore = 88;
      break;

    case 'Road Damage':
    case 'Streetlight Failure':
    case 'Water Leakage':
    case 'Sewage':
    case 'Public Safety':
    case 'Government Assistance':
      environmentalScore = 70;
      communityScore = 85;
      urgencyRating = 85;
      difficultyRating = 65;
      volunteerHours = 1.5;
      beneficiariesCount = 200;
      socialValueScore = 85;
      break;

    default:
      environmentalScore = 50;
      communityScore = 50;
      urgencyRating = 50;
      difficultyRating = 50;
      volunteerHours = 1.0;
      beneficiariesCount = 10;
      socialValueScore = 50;
      break;
  }

  // Vision bonus adjustments
  if (vision.environment.trees || vision.environment.plants) environmentalScore += 5;
  if (vision.humans.volunteers) communityScore += 10;
  if (vision.humans.count > 1) beneficiariesCount += vision.humans.count * 5;
  if (vision.govtAssets.roadDamage || vision.govtAssets.drainage) urgencyRating += 10;

  // Normalize scores to 0-100
  environmentalScore = Math.min(100, Math.max(0, environmentalScore));
  communityScore = Math.min(100, Math.max(0, communityScore));
  urgencyRating = Math.min(100, Math.max(0, urgencyRating));
  difficultyRating = Math.min(100, Math.max(0, difficultyRating));
  socialValueScore = Math.min(100, Math.max(0, socialValueScore));

  const totalImpactScore = Math.min(
    100,
    Math.max(
      10,
      Number(
        (
          environmentalScore * 0.25 +
          communityScore * 0.30 +
          urgencyRating * 0.15 +
          difficultyRating * 0.15 +
          socialValueScore * 0.15
        ).toFixed(1)
      )
    )
  );

  return {
    environmentalScore,
    communityScore,
    urgencyRating,
    difficultyRating,
    volunteerHours,
    beneficiariesCount,
    socialValueScore,
    totalImpactScore,
  };
}
