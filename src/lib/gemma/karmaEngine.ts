import type {
  KarmaEvaluationResult,
  ClassificationResult,
  ImpactScoreResult,
  FraudDetectionResult,
} from './types';

export function evaluateDynamicKarma(
  classification: ClassificationResult,
  impact: ImpactScoreResult,
  fraud: FraudDetectionResult,
  verificationConfidence: number
): KarmaEvaluationResult {
  // 1. Establish Category Baseline Rewards
  let baselineKarma = 100;

  switch (classification.category) {
    case 'Animal Rescue':
      baselineKarma = 1000;
      break;
    case 'Disaster Relief':
      baselineKarma = 700;
      break;
    case 'Volunteer Teaching':
      baselineKarma = 300;
      break;
    case 'Blood Donation':
      baselineKarma = 250;
      break;
    case 'Tree Plantation':
      baselineKarma = 100;
      break;
    case 'Garbage Cleanup':
    case 'Recycling':
      baselineKarma = 80;
      break;
    case 'Water Conservation':
    case 'Medicine Donation':
    case 'Food Donation':
    case 'Book Donation':
      baselineKarma = 150;
      break;
    case 'Road Damage':
    case 'Streetlight Failure':
    case 'Water Leakage':
    case 'Sewage':
    case 'Public Safety':
      baselineKarma = 90;
      break;
    default:
      baselineKarma = 50;
      break;
  }

  // 2. Multipliers derived from verification analytics
  const impactMultiplier = Number((0.8 + (impact.totalImpactScore / 100) * 0.5).toFixed(2)); // 0.8 to 1.3
  const difficultyMultiplier = Number((0.9 + (impact.difficultyRating / 100) * 0.3).toFixed(2)); // 0.9 to 1.2
  const confidenceMultiplier = Number(Math.max(0.2, verificationConfidence).toFixed(2)); // 0.2 to 1.0
  const repeatParticipationBonus = 15;
  const communityNeedMultiplier = impact.urgencyRating > 75 ? 1.25 : 1.0;

  // If Fraud Score >= 50 or confidence is low, set Karma award to 0 (Strict policy: Never award Karma before successful verification)
  if (fraud.fraudScore >= 50 || verificationConfidence < 0.80) {
    return {
      baselineKarma,
      impactMultiplier,
      difficultyMultiplier,
      confidenceMultiplier: 0,
      repeatParticipationBonus: 0,
      communityNeedMultiplier: 1.0,
      finalKarmaAwarded: 0,
      reasoning: `Karma withheld: Verification confidence is below required threshold or fraud risk flagged (${fraud.riskLevel} risk). Karma is only awarded upon successful verification.`,
    };
  }

  const rawKarma = Math.round(
    (baselineKarma * impactMultiplier * difficultyMultiplier * confidenceMultiplier + repeatParticipationBonus) * communityNeedMultiplier
  );

  const finalKarmaAwarded = Math.max(10, Math.min(1500, rawKarma));

  return {
    baselineKarma,
    impactMultiplier,
    difficultyMultiplier,
    confidenceMultiplier,
    repeatParticipationBonus,
    communityNeedMultiplier,
    finalKarmaAwarded,
    reasoning: `Dynamically calculated +${finalKarmaAwarded} Karma Points based on baseline category reward (${baselineKarma}), impact factor (${impactMultiplier}x), difficulty (${difficultyMultiplier}x), and high AI verification confidence (${(verificationConfidence * 100).toFixed(0)}%).`,
  };
}
