import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { analyzeCivicReport, type AIReportAnalysis } from '../../lib/openrouter';
import { submitCivicReport } from '@/services/reportService';
import { useAuth } from '@/hooks/useAuth';

import type { CivicReport } from '@/src/types/database';

interface ReportIssueViewProps {
  onAddReport?: (report: CivicReport) => void;
  onNavigate?: (tab: string) => void;
}

export const ReportIssueView: React.FC<ReportIssueViewProps> = ({ onAddReport, onNavigate }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'analyzing' | 'success'>('form');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Roads & Infrastructure');
  const [locationName, setLocationName] = useState('MG Road, Near Central Metro Station');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AIReportAnalysis | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Roads & Infrastructure',
    'Sanitation & Waste',
    'Public Safety & Utilities',
    'Parks & Recreation',
  ];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsSubmitting(true);
    setStep('analyzing');

    try {
      const analysis = await analyzeCivicReport(title, description, locationName, imageUrl || undefined);
      setAiResult(analysis);
      
      const newReport = await submitCivicReport({
        title,
        description,
        category: analysis?.category || category,
        status: 'approved',
        priority: 'medium',
        location_name: locationName,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        reporter_id: user?.id || undefined,
      });

      if (onAddReport) onAddReport(newReport);
      setStep('success');
    } catch (err) {
      console.warn('AI analysis error:', err);
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-lg pb-xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-on-surface">Report a Civic Issue</h1>
        <p className="text-sm text-on-surface-variant">Snap photo, describe the issue, and verify with Gemma AI.</p>
      </div>

      <Card className="p-lg gap-md border-outline-variant/30">
        <form onSubmit={handleAnalyze} className="flex flex-col gap-md">
          <Input
            label="Issue Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Large pothole on main road"
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-on-surface">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    category === cat
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface text-on-surface border-outline-variant hover:bg-surface-container-high'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-on-surface">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the issue location and severity..."
              className="w-full p-3 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm font-medium"
              required
            />
          </div>

          <Input
            label="Location Name"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Address or location details"
          />

          <Button type="submit" variant="primary" isLoading={isSubmitting} icon="send" className="w-full font-bold py-3 mt-2">
            Analyze & Submit Report
          </Button>
        </form>
      </Card>
    </div>
  );
};
