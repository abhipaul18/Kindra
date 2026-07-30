'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';

interface EvidenceRow {
  id: string;
  user_id: string;
  mission_id: string;
  storage_path: string;
  public_url: string | null;
  image_hash: string;
  perceptual_hash: string | null;
  verification_status: string;
  mission_match: boolean | null;
  confidence: number | null;
  detected_activity: string | null;
  detected_objects: string[];
  fraud: boolean;
  ai_reasoning: string | null;
  model_used: string | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  notes: string | null;
  duplicate_of_id: string | null;
  duplicate_type: string | null;
  similarity_score: number | null;
  created_at: string;
  verified_at: string | null;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  verified:            { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: '✅ Verified' },
  rejected:            { bg: 'bg-rose-500/15',    text: 'text-rose-400',    label: '❌ Rejected' },
  duplicate_rejected:  { bg: 'bg-orange-500/15',  text: 'text-orange-400',  label: '🔁 Duplicate' },
  flagged_suspicious:  { bg: 'bg-amber-500/15',   text: 'text-amber-400',   label: '⚠️ Suspicious' },
  pending:             { bg: 'bg-slate-500/15',    text: 'text-slate-400',   label: '⏳ Pending' },
  manual_review:       { bg: 'bg-blue-500/15',     text: 'text-blue-400',    label: '👁️ Review' },
};

export default function EvidenceReviewPanel() {
  const [evidence, setEvidence] = useState<EvidenceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRow | null>(null);

  useEffect(() => {
    loadEvidence();
  }, [filter]);

  async function loadEvidence() {
    setLoading(true);
    try {
      let query = supabase
        .from('mission_evidence')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('verification_status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[Evidence Review] Load error:', error.message);
        setEvidence([]);
      } else {
        setEvidence((data as EvidenceRow[]) || []);
      }
    } catch (err) {
      console.error('[Evidence Review] Unexpected error:', err);
    }
    setLoading(false);
  }

  const statusStyle = (status: string) =>
    STATUS_STYLES[status] || { bg: 'bg-slate-500/15', text: 'text-slate-400', label: status };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100 font-sans">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">image_search</span>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">Evidence Review Panel</h2>
              <p className="text-xs text-slate-500">{evidence.length} records loaded</p>
            </div>
          </div>
          <button
            onClick={loadEvidence}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {['all', 'verified', 'rejected', 'duplicate_rejected', 'flagged_suspicious', 'pending'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                filter === f
                  ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {f === 'all' ? 'All' : (STATUS_STYLES[f]?.label || f)}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Loading evidence records...</p>
          </div>
        ) : evidence.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <span className="material-symbols-outlined text-4xl text-slate-700 mb-2 block">folder_open</span>
            <p className="text-sm">No evidence records found.</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-slate-900/80">
              <tr className="text-slate-500 text-left uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Image</th>
                <th className="px-4 py-3 font-semibold">Mission</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Confidence</th>
                <th className="px-4 py-3 font-semibold">Detected</th>
                <th className="px-4 py-3 font-semibold">Duplicate</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {evidence.map((row) => {
                const style = statusStyle(row.verification_status);
                return (
                  <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      {row.public_url ? (
                        <img
                          src={row.public_url}
                          alt="Evidence"
                          className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600">
                          <span className="material-symbols-outlined text-lg">image</span>
                        </div>
                      )}
                    </td>
                    {/* Mission */}
                    <td className="px-4 py-3">
                      <span className="text-slate-200 font-semibold block">{row.mission_id}</span>
                      <span className="text-slate-500 text-[10px] font-mono">{row.user_id.slice(0, 8)}...</span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                    </td>
                    {/* Confidence */}
                    <td className="px-4 py-3">
                      {row.confidence != null ? (
                        <span className={`font-bold ${row.confidence >= 80 ? 'text-emerald-400' : row.confidence >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                          {row.confidence.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    {/* Detected Activity */}
                    <td className="px-4 py-3 text-slate-300">{row.detected_activity || '—'}</td>
                    {/* Duplicate info */}
                    <td className="px-4 py-3">
                      {row.duplicate_type ? (
                        <div>
                          <span className="text-orange-400 font-bold text-[10px] uppercase">{row.duplicate_type}</span>
                          {row.similarity_score != null && (
                            <span className="text-slate-500 block">{row.similarity_score.toFixed(1)}%</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    {/* Created */}
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      {new Date(row.created_at).toLocaleDateString()}
                      <br />
                      {new Date(row.created_at).toLocaleTimeString()}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedEvidence(row)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-semibold border border-slate-700 transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setSelectedEvidence(null)}>
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Evidence Detail</h3>
              <button onClick={() => setSelectedEvidence(null)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image */}
              {selectedEvidence.public_url && (
                <img
                  src={selectedEvidence.public_url}
                  alt="Evidence"
                  className="w-full max-h-64 object-contain rounded-xl border border-slate-700 bg-slate-800"
                />
              )}

              {/* Status */}
              <div className="flex items-center gap-2">
                {(() => {
                  const s = statusStyle(selectedEvidence.verification_status);
                  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>{s.label}</span>;
                })()}
                {selectedEvidence.fraud && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400">🚨 Fraud Flagged</span>
                )}
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <DetailItem label="Evidence ID" value={selectedEvidence.id} mono />
                <DetailItem label="User ID" value={selectedEvidence.user_id} mono />
                <DetailItem label="Mission ID" value={selectedEvidence.mission_id} />
                <DetailItem label="Confidence" value={selectedEvidence.confidence != null ? `${selectedEvidence.confidence.toFixed(1)}%` : '—'} />
                <DetailItem label="Detected Activity" value={selectedEvidence.detected_activity || '—'} />
                <DetailItem label="Model Used" value={selectedEvidence.model_used || '—'} mono />
                <DetailItem label="SHA-256" value={selectedEvidence.image_hash} mono />
                <DetailItem label="Perceptual Hash" value={selectedEvidence.perceptual_hash || '—'} mono />
                <DetailItem label="Storage Path" value={selectedEvidence.storage_path} mono />
                <DetailItem label="Duplicate Type" value={selectedEvidence.duplicate_type || 'None'} />
                <DetailItem label="Similarity Score" value={selectedEvidence.similarity_score != null ? `${selectedEvidence.similarity_score.toFixed(1)}%` : '—'} />
                <DetailItem label="Duplicate Of" value={selectedEvidence.duplicate_of_id || '—'} mono />
                {selectedEvidence.gps_latitude && (
                  <DetailItem label="GPS" value={`${selectedEvidence.gps_latitude?.toFixed(4)}, ${selectedEvidence.gps_longitude?.toFixed(4)}`} />
                )}
                <DetailItem label="Created" value={new Date(selectedEvidence.created_at).toLocaleString()} />
                <DetailItem label="Verified" value={selectedEvidence.verified_at ? new Date(selectedEvidence.verified_at).toLocaleString() : '—'} />
              </div>

              {/* AI Reasoning */}
              {selectedEvidence.ai_reasoning && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-500 text-[10px] uppercase font-semibold mb-1">AI Reasoning</p>
                  <p className="text-slate-300 text-xs whitespace-pre-wrap">{selectedEvidence.ai_reasoning}</p>
                </div>
              )}

              {/* Notes */}
              {selectedEvidence.notes && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-500 text-[10px] uppercase font-semibold mb-1">User Notes</p>
                  <p className="text-slate-300 text-xs">{selectedEvidence.notes}</p>
                </div>
              )}

              {/* Detected Objects */}
              {selectedEvidence.detected_objects && selectedEvidence.detected_objects.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <p className="text-slate-500 text-[10px] uppercase font-semibold mb-2">Detected Objects</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedEvidence.detected_objects.map((obj, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-[10px] font-mono">{obj}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-slate-800/30 rounded-lg p-2.5 border border-slate-800">
      <p className="text-slate-500 text-[10px] uppercase font-semibold">{label}</p>
      <p className={`text-slate-200 text-xs break-all ${mono ? 'font-mono' : ''}`}>
        {value.length > 40 ? value.slice(0, 18) + '...' + value.slice(-18) : value}
      </p>
    </div>
  );
}
