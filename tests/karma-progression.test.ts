import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
// @ts-ignore
import { getLevelFromKarma, LEVEL_CONFIG } from '../src/lib/karmaProgression.ts';

describe('Karma Level & XP Progression Utility — getLevelFromKarma', () => {

  it('0 Karma -> Level 1 Civic Beginner (0 / 250 XP, 0%, 250 remaining)', () => {
    const info = getLevelFromKarma(0);
    assert.equal(info.level, 1);
    assert.equal(info.title, 'Civic Beginner');
    assert.equal(info.minimum, 0);
    assert.equal(info.maximum, 250);
    assert.equal(info.currentXP, 0);
    assert.equal(info.requiredXP, 250);
    assert.equal(info.remainingXP, 250);
    assert.equal(info.progressPercentage, 0);
    assert.equal(info.isMaxLevel, false);
  });

  it('120 Karma -> Level 1 Civic Beginner (120 / 250 XP, 48%, 130 remaining)', () => {
    const info = getLevelFromKarma(120);
    assert.equal(info.level, 1);
    assert.equal(info.title, 'Civic Beginner');
    assert.equal(info.currentXP, 120);
    assert.equal(info.requiredXP, 250);
    assert.equal(info.remainingXP, 130);
    assert.equal(info.progressPercentage, 48);
    assert.equal(info.isMaxLevel, false);
  });

  it('249 Karma -> Level 1 Civic Beginner (249 / 250 XP, 100%, 1 remaining)', () => {
    const info = getLevelFromKarma(249);
    assert.equal(info.level, 1);
    assert.equal(info.title, 'Civic Beginner');
    assert.equal(info.currentXP, 249);
    assert.equal(info.requiredXP, 250);
    assert.equal(info.remainingXP, 1);
    assert.equal(info.progressPercentage, 100);
    assert.equal(info.isMaxLevel, false);
  });

  it('250 Karma -> Level 2 Civic Advocate (0 / 250 XP, 0%, 250 remaining)', () => {
    const info = getLevelFromKarma(250);
    assert.equal(info.level, 2);
    assert.equal(info.title, 'Civic Advocate');
    assert.equal(info.minimum, 250);
    assert.equal(info.maximum, 500);
    assert.equal(info.currentXP, 0);
    assert.equal(info.requiredXP, 250);
    assert.equal(info.remainingXP, 250);
    assert.equal(info.progressPercentage, 0);
    assert.equal(info.isMaxLevel, false);
  });

  it('400 Karma -> Level 2 Civic Advocate (150 / 250 XP, 60%, 100 remaining)', () => {
    const info = getLevelFromKarma(400);
    assert.equal(info.level, 2);
    assert.equal(info.title, 'Civic Advocate');
    assert.equal(info.currentXP, 150);
    assert.equal(info.requiredXP, 250);
    assert.equal(info.remainingXP, 100);
    assert.equal(info.progressPercentage, 60);
    assert.equal(info.isMaxLevel, false);
  });

  it('499 Karma -> Level 2 Civic Advocate (249 / 250 XP, 100%, 1 remaining)', () => {
    const info = getLevelFromKarma(499);
    assert.equal(info.level, 2);
    assert.equal(info.title, 'Civic Advocate');
    assert.equal(info.currentXP, 249);
    assert.equal(info.requiredXP, 250);
    assert.equal(info.remainingXP, 1);
    assert.equal(info.progressPercentage, 100);
    assert.equal(info.isMaxLevel, false);
  });

  it('500 Karma -> Level 3 Community Hero (0 / 500 XP, 0%, 500 remaining)', () => {
    const info = getLevelFromKarma(500);
    assert.equal(info.level, 3);
    assert.equal(info.title, 'Community Hero');
    assert.equal(info.minimum, 500);
    assert.equal(info.maximum, 1000);
    assert.equal(info.currentXP, 0);
    assert.equal(info.requiredXP, 500);
    assert.equal(info.remainingXP, 500);
    assert.equal(info.progressPercentage, 0);
    assert.equal(info.isMaxLevel, false);
  });

  it('680 Karma -> Level 3 Community Hero (180 / 500 XP, 36%, 320 remaining)', () => {
    const info = getLevelFromKarma(680);
    assert.equal(info.level, 3);
    assert.equal(info.title, 'Community Hero');
    assert.equal(info.currentXP, 180);
    assert.equal(info.requiredXP, 500);
    assert.equal(info.remainingXP, 320);
    assert.equal(info.progressPercentage, 36);
    assert.equal(info.isMaxLevel, false);
  });

  it('999 Karma -> Level 3 Community Hero (499 / 500 XP, 100%, 1 remaining)', () => {
    const info = getLevelFromKarma(999);
    assert.equal(info.level, 3);
    assert.equal(info.title, 'Community Hero');
    assert.equal(info.currentXP, 499);
    assert.equal(info.requiredXP, 500);
    assert.equal(info.remainingXP, 1);
    assert.equal(info.progressPercentage, 100);
    assert.equal(info.isMaxLevel, false);
  });

  it('1000 Karma -> Level 4 Civic Champion (0 / 1000 XP, 0%, 1000 remaining)', () => {
    const info = getLevelFromKarma(1000);
    assert.equal(info.level, 4);
    assert.equal(info.title, 'Civic Champion');
    assert.equal(info.minimum, 1000);
    assert.equal(info.maximum, 2000);
    assert.equal(info.currentXP, 0);
    assert.equal(info.requiredXP, 1000);
    assert.equal(info.remainingXP, 1000);
    assert.equal(info.progressPercentage, 0);
    assert.equal(info.isMaxLevel, false);
  });

  it('1200 Karma -> Level 4 Civic Champion (200 / 1000 XP, 20%, 800 remaining)', () => {
    const info = getLevelFromKarma(1200);
    assert.equal(info.level, 4);
    assert.equal(info.title, 'Civic Champion');
    assert.equal(info.currentXP, 200);
    assert.equal(info.requiredXP, 1000);
    assert.equal(info.remainingXP, 800);
    assert.equal(info.progressPercentage, 20);
    assert.equal(info.isMaxLevel, false);
  });

  it('16000 Karma -> Level 10 KINDRA Ambassador (Max Level)', () => {
    const info = getLevelFromKarma(16000);
    assert.equal(info.level, 10);
    assert.equal(info.title, 'KINDRA Ambassador');
    assert.equal(info.minimum, 15000);
    assert.equal(info.maximum, null);
    assert.equal(info.remainingXP, 0);
    assert.equal(info.progressPercentage, 100);
    assert.equal(info.isMaxLevel, true);
  });

  it('Edge case: null/undefined/negative karma falls back gracefully to Level 1', () => {
    const infoNull = getLevelFromKarma(null as any);
    assert.equal(infoNull.level, 1);

    const infoUndefined = getLevelFromKarma(undefined as any);
    assert.equal(infoUndefined.level, 1);

    const infoNegative = getLevelFromKarma(-100);
    assert.equal(infoNegative.level, 1);
  });

  it('All 10 Level titles match configuration exactly', () => {
    assert.equal(LEVEL_CONFIG.length, 10);
    assert.equal(LEVEL_CONFIG[0].title, 'Civic Beginner');
    assert.equal(LEVEL_CONFIG[1].title, 'Civic Advocate');
    assert.equal(LEVEL_CONFIG[2].title, 'Community Hero');
    assert.equal(LEVEL_CONFIG[3].title, 'Civic Champion');
    assert.equal(LEVEL_CONFIG[4].title, 'Impact Leader');
    assert.equal(LEVEL_CONFIG[5].title, 'Change Maker');
    assert.equal(LEVEL_CONFIG[6].title, 'Guardian of Good');
    assert.equal(LEVEL_CONFIG[7].title, 'Civic Legend');
    assert.equal(LEVEL_CONFIG[8].title, 'National Hero');
    assert.equal(LEVEL_CONFIG[9].title, 'KINDRA Ambassador');
  });
});
