'use client';

import React, { useState } from 'react';
import type { CompleteVerificationPipelineOutput } from '@/src/lib/gemma/types';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, MapPin, 
  FileText, Award, Layers, Sparkles, User, RefreshCw, Cpu, Activity, Send, X, Check
} from 'lucide-react';

interface Props {
  data?: CompleteVerificationPipelineOutput | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function VerificationDashboard({ data, isLoading, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'vision' | 'fraud' | 'ocr' | 'impact' | 'timeline'>('overview');

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <Sparkles className="w-6 h-6 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-wide">Gemma Mission-Aware Verification Active</h3>
          <p className="text-slate-400 text-sm max-w-md">
            Analyzing uploaded proof against selected mission requirements, evaluating GPS geofences, running perceptual image hashing & fraud engine...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p>No active Gemma AI verification output selected.</p>
      </div>
    );
  }

  const { decision, classification, vision, gps, ocr, fraud, impact, karma, routing, summaries, auditTrail } = data;

  const isVerified = decision.status === 'auto_verified' || decision.status === 'verified_low_confidence';
  const isRejected = decision.status === 'auto_rejected' || !decision.missionMatch;
  const confidencePct = Math.round(decision.confidenceScore * 100);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100 font-sans">
      {/* OpenRouter API Error Diagnostic Banner */}
      {decision.apiError && (
        <div className="bg-amber-950/90 border-b border-amber-800/90 p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold uppercase tracking-wider">
                  ⚠️ OpenRouter API Diagnostic Error ({decision.apiError.statusCode})
                </span>
                <span className="text-xs font-mono text-amber-400">Endpoint: {decision.apiError.endpoint}</span>
              </div>
              <h3 className="text-xl font-black text-white mt-2">
                OpenRouter Request Failed ({decision.apiError.statusCode} {decision.apiError.statusText})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs font-mono">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-sans">Selected Model:</span>
                  <strong className="text-amber-400 text-sm">{decision.apiError.model}</strong>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-sans">HTTP Method:</span>
                  <strong className="text-white text-sm">POST</strong>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-sans">Endpoint URL:</span>
                  <strong className="text-slate-300 text-xs truncate block">{decision.apiError.endpoint}</strong>
                </div>
              </div>
              <div className="mt-3 bg-slate-950/90 p-3 rounded-xl border border-slate-800 font-mono text-xs text-rose-300 whitespace-pre-wrap">
                {decision.apiError.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Mission-Aware Rejection / Approval Banner */}
      {!decision.apiError && isRejected ? (
        <div className="bg-rose-950/80 border-b border-rose-800/80 p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-2xl">
              <XCircle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-full text-xs font-bold uppercase tracking-wider">
                  ❌ Verification Failed
                </span>
                <span className="text-xs font-mono text-rose-400">Karma Awarded: 0 XP</span>
              </div>
              <h3 className="text-xl font-black text-white mt-2">
                Uploaded evidence does not match the selected mission
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 text-xs font-mono">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-sans">Expected Mission:</span>
                  <strong className="text-amber-400 text-sm">{decision.expectedActivity || classification.category}</strong>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-sans">Detected Activity:</span>
                  <strong className="text-rose-400 text-sm">{decision.detectedActivity || classification.category}</strong>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-sans">AI Confidence:</span>
                  <strong className="text-white text-sm">{confidencePct}%</strong>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-sans">Status:</span>
                  <strong className="text-rose-400 text-sm uppercase">Rejected</strong>
                </div>
              </div>
              <p className="text-xs text-rose-200 mt-3 font-sans">
                💡 <strong>Suggested Action:</strong> {decision.suggestedAction || `Please upload valid evidence matching "${decision.expectedActivity || classification.category}".`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/80 border-b border-emerald-800/80 p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-2xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold uppercase tracking-wider">
                  ✅ Mission Verified
                </span>
                <span className="text-sm font-black text-emerald-400">Karma Awarded: +{karma.finalKarmaAwarded} XP</span>
              </div>
              <h3 className="text-xl font-black text-white mt-2">
                Evidence verified for "{data.payload.title}"
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs font-mono">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-sans">Detected Activity:</span>
                  <strong className="text-emerald-400 text-sm">{decision.detectedActivity || classification.category}</strong>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-sans">Mission Match:</span>
                  <strong className="text-emerald-400 text-sm">PASSED</strong>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-sans">AI Confidence:</span>
                  <strong className="text-white text-sm">{confidencePct}%</strong>
                </div>
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block font-sans">GPS & Fraud Check:</span>
                  <strong className="text-emerald-400 text-sm">VERIFIED</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 overflow-x-auto">
        {[
          { id: 'overview', label: 'Engine Overview', icon: Cpu },
          { id: 'vision', label: 'Computer Vision', icon: Layers },
          { id: 'fraud', label: `Fraud Score (${fraud.fraudScore})`, icon: ShieldCheck },
          { id: 'ocr', label: 'OCR & Docs', icon: FileText },
          { id: 'impact', label: `Impact (${impact.totalImpactScore})`, icon: Activity },
          { id: 'timeline', label: 'Audit Timeline', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mission Match Status Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Mission Match Validation</span>
                  {decision.missionMatch ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-rose-400" />
                  )}
                </div>
                <div className="text-xl font-black text-white">
                  {decision.missionMatch ? 'Passed' : 'Failed'}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Expected: <strong className="text-amber-400">{decision.expectedActivity}</strong>
                </p>
                <p className="text-xs text-slate-400">
                  Detected: <strong className={decision.missionMatch ? 'text-emerald-400' : 'text-rose-400'}>{decision.detectedActivity}</strong>
                </p>
              </div>
            </div>

            {/* Confidence Meter */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>AI Confidence Score</span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-white">{confidencePct}%</span>
                  <span className="text-xs text-slate-400">Target: ≥85%</span>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 mt-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    confidencePct >= 85 && decision.missionMatch ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${confidencePct}%` }}
                ></div>
              </div>
            </div>

            {/* Dynamic Karma Award */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Karma Awarded</span>
                  <Award className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className={`text-4xl font-black ${isRejected ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isRejected ? '0 XP' : `+${karma.finalKarmaAwarded}`}
                  </span>
                  <span className="text-xs text-slate-400">Baseline: {karma.baselineKarma}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 truncate">{karma.reasoning}</p>
            </div>

            {/* Executive AI Summary Box */}
            <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Gemma Executive Reasoning & Summary</span>
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 font-mono">
                "{summaries.executiveSummary}"
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-slate-700">
                  Routing Target: <strong className="text-emerald-400">{routing.destinationDepartment}</strong>
                </span>
                <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-slate-700">
                  GPS Geofence: <strong className={gps.isWithinGeofence ? 'text-emerald-400' : 'text-rose-400'}>{gps.isWithinGeofence ? 'Verified (within 500m)' : 'Breached'}</strong>
                </span>
              </div>
            </div>

            {/* Smart Routing Destination Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 mb-3">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Smart Municipal Dispatch</span>
                </h4>
                <div className="text-lg font-bold text-white">{routing.destinationDepartment}</div>
                <div className="text-xs text-emerald-400 font-semibold mt-1">Target Entity: {routing.routingTargetEntity}</div>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">{routing.routingReasoning}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vision' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Detected Object Taxonomy</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {vision.detectedObjects.map((obj, i) => (
                    <span key={i} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-medium">
                      ✓ {obj}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Human & Infrastructure Vision Scan</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Volunteers Detected:</span>
                    <strong className="text-emerald-400 text-sm">{vision.humans.volunteers ? 'Yes' : 'No'}</strong>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Human Count:</span>
                    <strong className="text-emerald-400 text-sm">{vision.humans.count}</strong>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Road / Asphalt Damage:</span>
                    <strong className="text-emerald-400 text-sm">{vision.govtAssets.roadDamage ? 'Detected' : 'Clear'}</strong>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block">Trees / Saplings:</span>
                    <strong className="text-emerald-400 text-sm">{vision.environment.trees ? 'Verified' : 'None'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fraud' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-base font-bold text-white mb-4">Forensic Fraud Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Duplicate Image Match', val: fraud.isDuplicate },
                { label: 'Synthetic AI Media', val: fraud.isAiGenerated },
                { label: 'Edited / Photoshop', val: fraud.isEditedOrTampered },
                { label: 'GPS Location Spoofing', val: fraud.isFakeGps },
                { label: 'Internet Stock Photo', val: fraud.isInternetStockPhoto },
                { label: 'Screenshot Upload', val: fraud.isScreenshot },
                { label: 'Metadata Tampered', val: fraud.metadataTamperFlag },
                { label: 'Timestamp Mismatch', val: fraud.timestampMismatchFlag },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block">{item.label}</span>
                  <span className={`text-sm font-bold ${item.val ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {item.val ? 'FLAGGED' : 'PASSED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ocr' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-base font-bold text-white mb-2">OCR Document Processing</h4>
            <p className="text-xs text-slate-400 mb-4">Document Classification: <strong className="text-emerald-400 uppercase">{ocr.documentType}</strong></p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 whitespace-pre-wrap">
              {ocr.extractedText}
            </div>
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-base font-bold text-white mb-4">Impact Calculation Matrix (Total: {impact.totalImpactScore}/100)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Environmental Score</span>
                <strong className="text-emerald-400 text-lg">{impact.environmentalScore}/100</strong>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Community Impact</span>
                <strong className="text-emerald-400 text-lg">{impact.communityScore}/100</strong>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Urgency Rating</span>
                <strong className="text-amber-400 text-lg">{impact.urgencyRating}/100</strong>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-base font-bold text-white mb-4">Verification Audit Timeline</h4>
            <div className="space-y-4">
              {auditTrail.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5"></div>
                  <div>
                    <span className="font-bold text-white uppercase tracking-wider">{item.stage.replace(/_/g, ' ')}</span>
                    <span className="text-slate-500 ml-2">({new Date(item.completedAt).toLocaleTimeString()})</span>
                    <p className="text-slate-300 mt-0.5">{item.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
