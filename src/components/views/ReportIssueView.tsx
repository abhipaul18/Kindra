import React, { useState } from 'react';
import type { CivicReport } from '../../types/database';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Chip } from '../ui/Chip';
import { analyzeCivicReport, type AIReportAnalysis } from '../../lib/openrouter';

export interface ReportIssueViewProps {
  onAddReport: (report: CivicReport) => void;
  onNavigate: (tab: string) => void;
}

export const ReportIssueView: React.FC<ReportIssueViewProps> = ({ onAddReport, onNavigate }) => {
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [category, setCategory] = useState('Roads & Infrastructure');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [aiResult, setAiResult] = useState<AIReportAnalysis | null>(null);

  const handleAnalyzeAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !locationName) return;

    setIsVerifying(true);
    setAiResult(null);

    // Call OpenRouter Gemma 4 AI analysis
    const analysis = await analyzeCivicReport(title, description, locationName);
    setAiResult(analysis);
    setIsVerifying(false);
  };

  const handleFinalSubmit = () => {
    if (!title || !description || !locationName) return;

    const newReport: CivicReport = {
      id: `rep-${Date.now()}`,
      title,
      description,
      category: aiResult?.category || category,
      status: 'approved',
      priority: aiResult?.priority || 'medium',
      location_name: locationName,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      karma_awarded: 50,
      ai_analysis: {
        suggested_category: aiResult?.category,
        confidence: aiResult?.confidence,
        severity_rating: aiResult?.priority,
        summary: aiResult?.summary,
        tags: aiResult?.tags,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onAddReport(newReport);
    onNavigate('dashboard');
  };

  return (
    <div className="flex flex-col gap-md py-md px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon="arrow_back" onClick={() => onNavigate('dashboard')}>
          Back
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
            Report a Civic Issue
          </h1>
          <p className="text-sm text-on-surface-variant">
            Describe the problem. Our Gemma AI engine will categorize and route your report to the right department.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Form Column */}
        <div className="md:col-span-2 flex flex-col gap-md">
          <Card className="gap-md p-lg">
            <form onSubmit={handleAnalyzeAndSubmit} className="flex flex-col gap-md">
              <Input
                label="Issue Title"
                placeholder="e.g. Hazardous Pothole on Main Street"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                icon="title"
                required
              />

              <Input
                label="Location & Address"
                placeholder="e.g. 5th Ave & Pine St Corner"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                icon="location_on"
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface-variant">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                >
                  <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                  <option value="Sanitation & Waste">Sanitation & Waste</option>
                  <option value="Public Safety & Utilities">Public Safety & Utilities</option>
                  <option value="Parks & Recreation">Parks & Recreation</option>
                  <option value="Water & Drainage">Water & Drainage</option>
                  <option value="Other">Other Civic Issue</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface-variant">Detailed Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide clear details (size, severity, hazards, surrounding landmarks)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 text-base focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
                  required
                />
              </div>

              <Input
                label="Photo Image URL (Optional)"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                icon="image"
              />

              <Button
                type="submit"
                variant="primary"
                icon="auto_awesome"
                isLoading={isVerifying}
                disabled={!title || !description || !locationName}
                className="w-full font-bold"
              >
                Submit for AI Verification
              </Button>
            </form>
          </Card>
        </div>

        {/* AI Analysis Sidebar */}
        <div className="flex flex-col gap-md">
          <Card className="gap-md border-primary-container/40 bg-surface-container-lowest">
            <div className="flex items-center gap-2 text-primary font-bold text-base">
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              AI Verification Engine
            </div>

            {isVerifying && (
              <div className="flex flex-col items-center py-lg text-center gap-2 animate-pulse">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
                <span className="font-semibold text-sm text-on-surface">Gemma AI analyzing report...</span>
                <span className="text-xs text-on-surface-variant">Classifying severity & department routing</span>
              </div>
            )}

            {!isVerifying && !aiResult && (
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Once you fill out the form and submit, Gemma AI will inspect your report details, assign an initial urgency rating, and dispatch it to the correct department.
              </p>
            )}

            {aiResult && (
              <div className="flex flex-col gap-sm animate-fade-in bg-surface-container-low p-md rounded-xl border border-outline-variant/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-outline uppercase tracking-wider">AI Verdict</span>
                  <Chip variant="primary">{Math.round(aiResult.confidence * 100)}% Match</Chip>
                </div>

                <div>
                  <div className="text-xs text-on-surface-variant font-medium">Recommended Department:</div>
                  <div className="font-bold text-on-surface text-sm">{aiResult.recommendedDepartment}</div>
                </div>

                <div>
                  <div className="text-xs text-on-surface-variant font-medium">Priority Rating:</div>
                  <Chip
                    variant={aiResult.priority === 'urgent' ? 'error' : aiResult.priority === 'high' ? 'amber' : 'primary'}
                    className="mt-1"
                  >
                    {aiResult.priority.toUpperCase()}
                  </Chip>
                </div>

                <div>
                  <div className="text-xs text-on-surface-variant font-medium">Summary:</div>
                  <p className="text-xs text-on-surface italic mt-0.5">{aiResult.summary}</p>
                </div>

                <div className="pt-2 border-t border-outline-variant/30 flex flex-col gap-2">
                  <span className="text-xs font-semibold text-secondary flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">workspace_premium</span>
                    Earn +50 Karma Points upon submit!
                  </span>
                  <Button variant="secondary" icon="check_circle" onClick={handleFinalSubmit} className="w-full font-bold">
                    Confirm & Publish Report
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
