'use client';

import React, { useState } from 'react';
import VerificationDashboard from '@/components/verification/VerificationDashboard';
import type { CompleteVerificationPipelineOutput } from '@/src/lib/gemma/types';
import { Cpu, Upload, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CitizenVerificationPage() {
  const [title, setTitle] = useState('Tree Plantation Campaign Proof');
  const [notes, setNotes] = useState('Planted 2 neem saplings in community garden soil with proper fencing.');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompleteVerificationPipelineOutput | null>(null);

  const handleRunVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemma/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '00000000-0000-0000-0000-000000000001',
          title,
          notes,
          images: [imageUrl],
          latitude: 28.6139,
          longitude: 77.2090,
          locationAddress: 'New Delhi Civic Park',
        }),
      });

      const data = await response.json();
      if (data.success && data.verification) {
        setResult(data.verification);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Production Architecture Engine</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Gemma AI Verification Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Multimodal verification pipeline: Vision Analysis, OCR, GPS Spoofing, Image Hashing Fraud Detection, Impact Scoring & Smart Municipal Routing.
          </p>
        </div>
      </div>

      {/* Submission Simulator / Verification Trigger Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Upload className="w-5 h-5 text-emerald-400" />
          <span>Submit Verification Request</span>
        </h3>

        <form onSubmit={handleRunVerification} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Civic Report Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Proof Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Description / Location Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-3 flex justify-end mt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-emerald-600/20"
            >
              <Cpu className="w-4 h-4" />
              <span>{isLoading ? 'Executing Gemma AI Pipeline...' : 'Run Gemma AI Verification'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results Dashboard */}
      {(result || isLoading) && (
        <VerificationDashboard data={result} isLoading={isLoading} />
      )}
    </div>
  );
}
