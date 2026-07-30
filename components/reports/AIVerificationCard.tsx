'use client';

import React, { useEffect, useState } from 'react';
import { verifyCivicReport } from '@/services/aiVerificationService';
import type { AIVerificationResult } from '@/src/lib/openrouter';
import { Card } from '@/src/components/ui/Card';
import { ProgressBar } from '@/src/components/ui/ProgressBar';

interface AIVerificationCardProps {
  reportId: string;
  onCompleted?: (result: AIVerificationResult) => void;
}

export function AIVerificationCard({ reportId, onCompleted }: AIVerificationCardProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiData, setAiData] = useState<AIVerificationResult | null>(null);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [karmaAwarded, setKarmaAwarded] = useState<number>(50);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function runVerification() {
      try {
        setStep(2); // Analyzing image
        await new Promise((r) => setTimeout(r, 600));

        setStep(3); // Classifying & Checking duplicates
        await new Promise((r) => setTimeout(r, 600));

        setStep(4); // Calculating Karma
        const result = await verifyCivicReport(reportId);

        if (isMounted) {
          setAiData(result.aiResult);
          setIsDuplicate(result.isDuplicate);
          setKarmaAwarded(result.finalKarma);
          setStep(5); // Complete
          setLoading(false);
          if (onCompleted) onCompleted(result.aiResult);
        }
      } catch (err: any) {
        console.error('AI Verification card error:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'AI processing encountered an issue');
          setLoading(false);
        }
      }
    }

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [reportId]);

  return (
    <Card className="w-full p-md flex flex-col gap-md border-primary-container/30 bg-surface-container-lowest shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">smart_toy</span>
          </div>
          <span className="font-extrabold text-sm text-on-surface">OpenRouter Gemma Vision Verification</span>
        </div>
        <span className="text-[11px] font-bold text-secondary bg-secondary-container/20 border border-secondary/30 px-2.5 py-0.5 rounded-full">
          AI Engine Active
        </span>
      </div>

      {/* Progress Timeline */}
      {loading ? (
        <div className="flex flex-col gap-sm py-sm">
          <div className="flex justify-between items-center text-xs font-bold text-primary">
            <span>
              {step === 2 && 'Analyzing image with Gemma Vision...'}
              {step === 3 && 'Classifying issue & checking 500m duplicates...'}
              {step === 4 && 'Calculating severity & Karma reward...'}
            </span>
            <span>Step {step} of 5</span>
          </div>
          <ProgressBar value={step * 20} color="blue" showPercentage={false} />
        </div>
      ) : errorMsg ? (
        <div className="bg-error-container text-on-error-container p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">warning</span>
          <span>{errorMsg}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-md">
          {/* Verdict Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm text-center">
            <div className="bg-surface-container-high/60 p-2.5 rounded-xl border border-outline-variant/30">
              <span className="text-[10px] text-on-surface-variant font-bold block">AI Confidence</span>
              <span className="font-extrabold text-sm text-primary">
                {Math.round((aiData?.confidence || 0.92) * 100)}% Match
              </span>
            </div>

            <div className="bg-surface-container-high/60 p-2.5 rounded-xl border border-outline-variant/30">
              <span className="text-[10px] text-on-surface-variant font-bold block">Severity Rating</span>
              <span className="font-extrabold text-sm text-on-surface">
                {aiData?.severity || 'Medium'}
              </span>
            </div>

            <div className="bg-surface-container-high/60 p-2.5 rounded-xl border border-outline-variant/30">
              <span className="text-[10px] text-on-surface-variant font-bold block">Duplicate Check</span>
              <span className={`font-extrabold text-sm ${isDuplicate ? 'text-tertiary' : 'text-secondary'}`}>
                {isDuplicate ? 'Potential Duplicate' : 'Unique Issue'}
              </span>
            </div>

            <div className="bg-surface-container-high/60 p-2.5 rounded-xl border border-outline-variant/30">
              <span className="text-[10px] text-on-surface-variant font-bold block">Karma Awarded</span>
              <span className="font-extrabold text-sm text-secondary">+{karmaAwarded} XP</span>
            </div>
          </div>

          {/* AI Reasoning Box */}
          {aiData?.reasoning && (
            <div className="bg-primary-container/10 p-md rounded-xl border border-primary/20 flex flex-col gap-1 text-xs">
              <span className="font-bold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">psychology</span>
                Gemma Vision Reasoning:
              </span>
              <p className="text-on-surface-variant leading-relaxed">{aiData.reasoning}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
