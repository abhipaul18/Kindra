'use client';

import React, { useState, useEffect } from 'react';
import ManualReviewerDashboard from '@/components/verification/ManualReviewerDashboard';
import EvidenceReviewPanel from '@/components/verification/EvidenceReviewPanel';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';

export default function OfficerVerificationReviewPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'reviews' | 'evidence'>('reviews');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data: rawReviews } = await supabase
        .from('manual_reviews')
        .select('*')
        .eq('status', 'pending');

      if (rawReviews && rawReviews.length > 0) {
        const formatted = await Promise.all(
          rawReviews.map(async (r) => {
            let vRes: any = null;
            if (r.verification_result_id) {
              const { data } = await supabase
                .from('verification_results')
                .select('*')
                .eq('id', r.verification_result_id)
                .maybeSingle();
              vRes = data;
            }

            let sub: any = null;
            if (r.submission_id) {
              const { data } = await supabase
                .from('mission_submissions')
                .select('*')
                .eq('id', r.submission_id)
                .maybeSingle();
              sub = data;
            }

            return {
              reviewId: r.id,
              submissionId: r.submission_id,
              reportId: r.report_id,
              title: sub?.title || 'Civic Mission Proof',
              category: 'Civic Contribution',
              reporterName: 'Citizen Participant',
              notes: sub?.notes,
              primaryImageUrl: sub?.primary_image_url || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60',
              gpsAddress: sub?.location_address || 'Verified GPS Spot',
              confidenceScore: vRes?.confidence_score ?? 0.75,
              fraudScore: vRes?.overall_fraud_score ?? 15,
              calculatedKarma: vRes?.calculated_karma ?? 100,
              aiReasoning: vRes?.reasoning_text || 'Confidence below 80% threshold. Requires human review.',
              createdAt: r.created_at,
            };
          })
        );
        setReviews(formatted);
      } else {
        setReviews([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center space-x-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <span>Officer & NGO Verification Review</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review pending submissions flagged by Gemma AI for manual decision, approval, or evidence requests.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl transition-all flex items-center space-x-2 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Section toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveSection('reviews')}
          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
            activeSection === 'reviews'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          Manual Reviews
        </button>
        <button
          onClick={() => setActiveSection('evidence')}
          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
            activeSection === 'evidence'
              ? 'bg-violet-500/15 text-violet-400 border-violet-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          Evidence Storage & Hashes
        </button>
      </div>

      {activeSection === 'reviews' ? (
        <ManualReviewerDashboard reviews={reviews} onActionComplete={fetchReviews} />
      ) : (
        <EvidenceReviewPanel />
      )}
    </div>
  );
}

