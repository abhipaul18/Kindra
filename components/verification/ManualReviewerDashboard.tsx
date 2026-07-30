'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, HelpCircle, MapPin, Eye, FileText, Send, Sparkles } from 'lucide-react';

interface ManualReviewItem {
  reviewId: string;
  submissionId: string;
  reportId?: string;
  title: string;
  category: string;
  reporterName: string;
  notes?: string;
  primaryImageUrl: string;
  gpsAddress: string;
  confidenceScore: number;
  fraudScore: number;
  calculatedKarma: number;
  aiReasoning: string;
  ocrText?: string;
  createdAt: string;
}

interface Props {
  reviews?: ManualReviewItem[];
  onActionComplete?: () => void;
}

export default function ManualReviewerDashboard({ reviews = [], onActionComplete }: Props) {
  const [selectedReview, setSelectedReview] = useState<ManualReviewItem | null>(reviews[0] || null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (action: 'approve' | 'reject' | 'request_info') => {
    if (!selectedReview) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/gemma/manual-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: selectedReview.reviewId,
          reviewerId: '00000000-0000-0000-0000-000000000001',
          action,
          reviewerNotes,
        }),
      });

      if (response.ok) {
        alert(`Review action [${action.toUpperCase()}] recorded successfully.`);
        setReviewerNotes('');
        if (onActionComplete) onActionComplete();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-100 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <span>Gemma AI — Manual Review Queue</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Review civic submissions queued due to confidence &lt; 80% or flagged fraud metrics.
          </p>
        </div>
        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold">
          {reviews.length} Pending
        </span>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
          <CheckCircle className="w-12 h-12 mx-auto text-emerald-500/40 mb-3" />
          <p className="font-semibold text-slate-300">Review Queue is Clear!</p>
          <p className="text-xs text-slate-500 mt-1">All submissions have been automatically verified or resolved.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Review List Sidebar */}
          <div className="space-y-3 lg:col-span-1 border-r border-slate-800 pr-4">
            {reviews.map((rev) => (
              <div
                key={rev.reviewId}
                onClick={() => setSelectedReview(rev)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedReview?.reviewId === rev.reviewId
                    ? 'bg-slate-900 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-400">{rev.category}</span>
                  <span className="text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-sm truncate">{rev.title}</h4>
                <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{rev.gpsAddress}</span>
                </p>
                <div className="flex items-center space-x-2 mt-3 text-xs">
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                    Conf: {(rev.confidenceScore * 100).toFixed(0)}%
                  </span>
                  <span className={`px-2 py-0.5 rounded font-mono ${rev.fraudScore > 25 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    Fraud: {rev.fraudScore}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Review Detail & Decision Actions */}
          {selectedReview && (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{selectedReview.category}</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{selectedReview.title}</h3>
                    <p className="text-xs text-slate-400">Reporter: {selectedReview.reporterName}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold">
                    Karma: +{selectedReview.calculatedKarma}
                  </span>
                </div>

                {/* Proof Image */}
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-4 relative">
                  <img src={selectedReview.primaryImageUrl} alt="Proof" className="w-full h-full object-cover" />
                </div>

                {/* AI Reasoning Box */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs mb-4">
                  <span className="font-bold text-slate-300 block mb-1 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gemma AI Verdict Reasoning:</span>
                  </span>
                  <p className="text-slate-400 leading-relaxed font-mono">{selectedReview.aiReasoning}</p>
                </div>

                {/* Reviewer Action Buttons */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <textarea
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="Enter reviewer decision notes or additional evidence instructions..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    rows={2}
                  />

                  <div className="flex items-center space-x-3">
                    <button
                      disabled={isSubmitting}
                      onClick={() => handleAction('approve')}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Award Karma</span>
                    </button>

                    <button
                      disabled={isSubmitting}
                      onClick={() => handleAction('reject')}
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Submission</span>
                    </button>

                    <button
                      disabled={isSubmitting}
                      onClick={() => handleAction('request_info')}
                      className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all"
                    >
                      <HelpCircle className="w-4 h-4 text-amber-400" />
                      <span>Request Evidence</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
