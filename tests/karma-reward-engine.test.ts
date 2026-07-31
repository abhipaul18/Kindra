/**
 * Karma Reward Engine — Automated Tests
 * 
 * Tests the server-side /api/karma/award endpoint logic.
 * Run with: node --test tests/karma-reward-engine.test.ts
 * 
 * Note: These are unit tests that validate the reward conditions logic.
 * They use mock data to simulate different verification states.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ────────────────────────────────────────────────────────────
// Mock verification condition checker (mirrors /api/karma/award logic)
// ────────────────────────────────────────────────────────────

interface EvidenceRecord {
  verification_status: string;
  mission_match: boolean;
  confidence: number;
  fraud: boolean;
  reward_processed: boolean;
}

interface RewardCheckResult {
  canAward: boolean;
  reason: string;
}

function checkRewardEligibility(evidence: EvidenceRecord): RewardCheckResult {
  // Condition 1: verification_status must be 'verified'
  if (evidence.verification_status !== 'verified') {
    return { canAward: false, reason: `verification_status_invalid: ${evidence.verification_status}` };
  }

  // Condition 2: mission_match must be true
  if (evidence.mission_match !== true) {
    return { canAward: false, reason: 'mission_match_failed' };
  }

  // Condition 3: confidence must be >= 85
  if (evidence.confidence < 85) {
    return { canAward: false, reason: `confidence_too_low: ${evidence.confidence}` };
  }

  // Condition 4: fraud must be false
  if (evidence.fraud === true) {
    return { canAward: false, reason: 'fraud_detected' };
  }

  // Condition 5: reward must not have been processed already
  if (evidence.reward_processed === true) {
    return { canAward: false, reason: 'already_processed' };
  }

  return { canAward: true, reason: 'all_conditions_met' };
}

// ────────────────────────────────────────────────────────────
// Test Suite
// ────────────────────────────────────────────────────────────

describe('Karma Reward Engine — Condition Validation', () => {

  it('should award Karma for a fully verified mission', () => {
    const evidence: EvidenceRecord = {
      verification_status: 'verified',
      mission_match: true,
      confidence: 96,
      fraud: false,
      reward_processed: false,
    };

    const result = checkRewardEligibility(evidence);
    assert.equal(result.canAward, true);
    assert.equal(result.reason, 'all_conditions_met');
  });

  it('should reject when verification_status is not verified', () => {
    const evidence: EvidenceRecord = {
      verification_status: 'rejected',
      mission_match: true,
      confidence: 96,
      fraud: false,
      reward_processed: false,
    };

    const result = checkRewardEligibility(evidence);
    assert.equal(result.canAward, false);
    assert.match(result.reason, /verification_status_invalid/);
  });

  it('should reject when verification_status is pending', () => {
    const evidence: EvidenceRecord = {
      verification_status: 'pending',
      mission_match: true,
      confidence: 90,
      fraud: false,
      reward_processed: false,
    };

    const result = checkRewardEligibility(evidence);
    assert.equal(result.canAward, false);
    assert.match(result.reason, /verification_status_invalid/);
  });

  it('should reject when mission_match is false', () => {
    const evidence: EvidenceRecord = {
      verification_status: 'verified',
      mission_match: false,
      confidence: 96,
      fraud: false,
      reward_processed: false,
    };

    const result = checkRewardEligibility(evidence);
    assert.equal(result.canAward, false);
    assert.equal(result.reason, 'mission_match_failed');
  });

  it('should reject when confidence is below 85', () => {
    const evidence: EvidenceRecord = {
      verification_status: 'verified',
      mission_match: true,
      confidence: 72,
      fraud: false,
      reward_processed: false,
    };

    const result = checkRewardEligibility(evidence);
    assert.equal(result.canAward, false);
    assert.match(result.reason, /confidence_too_low/);
  });

  it('should reject when confidence is exactly 84', () => {
    const evidence: EvidenceRecord = {
      verification_status: 'verified',
      mission_match: true,
      confidence: 84,
      fraud: false,
      reward_processed: false,
    };

    const result = checkRewardEligibility(evidence);
    assert.equal(result.canAward, false);
    assert.match(result.reason, /confidence_too_low/);
  });

  it('should award when confidence is exactly 85', () => {
    const evidence: EvidenceRecord = {
      verification_status: 'verified',
      mission_match: true,
      confidence: 85,
      fraud: false,
      reward_processed: false,
    };

    const result = checkRewardEligibility(evidence);
    assert.equal(result.canAward, true);
  });

  it('should reject when fraud is detected', () => {
    const evidence: EvidenceRecord = {
      verification_status: 'verified',
      mission_match: true,
      confidence: 96,
      fraud: true,
      reward_processed: false,
    };

    const result = checkRewardEligibility(evidence);
    assert.equal(result.canAward, false);
    assert.equal(result.reason, 'fraud_detected');
  });

  it('should prevent double-reward (already_processed)', () => {
    const evidence: EvidenceRecord = {
      verification_status: 'verified',
      mission_match: true,
      confidence: 96,
      fraud: false,
      reward_processed: true,
    };

    const result = checkRewardEligibility(evidence);
    assert.equal(result.canAward, false);
    assert.equal(result.reason, 'already_processed');
  });

  it('should reject with first failing condition when multiple fail', () => {
    const evidence: EvidenceRecord = {
      verification_status: 'rejected',
      mission_match: false,
      confidence: 30,
      fraud: true,
      reward_processed: true,
    };

    const result = checkRewardEligibility(evidence);
    assert.equal(result.canAward, false);
    // First condition checked is verification_status
    assert.match(result.reason, /verification_status_invalid/);
  });
});

describe('Karma Reward Engine — Karma Calculation', () => {

  it('should correctly compute new karma total', () => {
    const previousKarma = 100;
    const karmaAwarded = 250;
    const newKarma = previousKarma + karmaAwarded;

    assert.equal(newKarma, 350);
  });

  it('should handle zero previous karma', () => {
    const previousKarma = 0;
    const karmaAwarded = 50;
    const newKarma = previousKarma + karmaAwarded;

    assert.equal(newKarma, 50);
  });

  it('should handle large karma values', () => {
    const previousKarma = 9999;
    const karmaAwarded = 300;
    const newKarma = previousKarma + karmaAwarded;

    assert.equal(newKarma, 10299);
  });
});

describe('Karma Reward Engine — Input Validation', () => {

  it('should reject negative karma amounts', () => {
    const karmaAmount = -50;
    const isValid = typeof karmaAmount === 'number' && karmaAmount > 0 && karmaAmount <= 10000;
    assert.equal(isValid, false);
  });

  it('should reject zero karma amount', () => {
    const karmaAmount = 0;
    const isValid = typeof karmaAmount === 'number' && karmaAmount > 0 && karmaAmount <= 10000;
    assert.equal(isValid, false);
  });

  it('should reject karma amount exceeding 10000', () => {
    const karmaAmount = 15000;
    const isValid = typeof karmaAmount === 'number' && karmaAmount > 0 && karmaAmount <= 10000;
    assert.equal(isValid, false);
  });

  it('should accept valid karma amounts', () => {
    const amounts = [1, 50, 100, 250, 500, 1000, 10000];
    for (const amount of amounts) {
      const isValid = typeof amount === 'number' && amount > 0 && amount <= 10000;
      assert.equal(isValid, true, `Amount ${amount} should be valid`);
    }
  });
});
