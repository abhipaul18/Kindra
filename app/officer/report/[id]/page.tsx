'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { fetchReportDetail, updateReportStatus, assignReportDepartment, fetchDepartments } from '@/services/officerService';
import type { ReportStatus } from '@/src/types/database';

const STATUS_TRANSITIONS: ReportStatus[] = ['submitted', 'approved', 'in_progress', 'resolved', 'rejected'];

export default function OfficerReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;

  const [report, setReport] = useState<any>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!reportId) return;
    async function load() {
      try {
        const [detail, depts] = await Promise.all([
          fetchReportDetail(reportId),
          fetchDepartments(),
        ]);
        setReport(detail.report);
        setAiResult(detail.aiResult);
        setImages(detail.images);
        setDepartments(depts);
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    load();
  }, [reportId]);

  async function handleStatusChange(newStatus: ReportStatus) {
    setUpdating(true);
    try {
      await updateReportStatus(reportId, newStatus);
      setReport((prev: any) => ({ ...prev, status: newStatus }));
    } catch (err) { console.error(err); }
    setUpdating(false);
  }

  async function handleDeptChange(deptId: string) {
    setUpdating(true);
    try {
      await assignReportDepartment(reportId, deptId);
      setReport((prev: any) => ({ ...prev, assigned_department_id: deptId }));
    } catch (err) { console.error(err); }
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-md animate-pulse">
        <div className="h-12 bg-surface-container-high rounded-xl w-48" />
        <div className="h-64 bg-surface-container-high rounded-2xl" />
        <div className="h-40 bg-surface-container-high rounded-2xl" />
      </div>
    );
  }

  if (!report) {
    return (
      <Card className="p-xl text-center">
        <span className="material-symbols-outlined text-4xl text-error mb-2 block">error</span>
        <p className="font-bold text-on-surface">Report not found</p>
        <Button variant="primary" size="sm" onClick={() => router.push('/officer/queue')} className="mt-4">
          Back to Queue
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-lg pb-xl">
      {/* Header */}
      <div className="flex items-center gap-md">
        <button onClick={() => router.push('/officer/queue')} className="p-2 rounded-xl hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-xl text-on-surface">arrow_back</span>
        </button>
        <div>
          <h1 className="text-xl font-black text-on-surface">{report.title}</h1>
          <p className="text-xs text-on-surface-variant">Report ID: {reportId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Left Column — Report Details */}
        <div className="lg:col-span-2 flex flex-col gap-md">
          {/* Image */}
          {images.length > 0 && (
            <Card className="overflow-hidden border-outline-variant/30">
              <img src={images[0].image_url} alt="Report" className="w-full h-64 object-cover" />
            </Card>
          )}

          {/* Description */}
          <Card className="p-lg flex flex-col gap-sm border-outline-variant/30">
            <h2 className="font-bold text-on-surface">Description</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">{report.description}</p>
          </Card>

          {/* Location */}
          <Card className="p-lg flex items-center gap-md border-outline-variant/30">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface">Location</h3>
              <p className="text-xs text-on-surface-variant">{report.location_name}</p>
              {report.latitude && report.longitude && (
                <p className="text-[10px] text-on-surface-variant/60">{report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}</p>
              )}
            </div>
          </Card>

          {/* AI Verification Result */}
          {aiResult && (
            <Card className="p-lg flex flex-col gap-sm border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">smart_toy</span>
                <h2 className="font-bold text-on-surface">Gemma AI Verification</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
                <div className="text-center p-2 rounded-xl bg-surface/80">
                  <p className="text-lg font-black text-purple-600">{Math.round((aiResult.confidence_score || 0) * 100)}%</p>
                  <p className="text-[10px] text-on-surface-variant font-semibold">Confidence</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-surface/80">
                  <p className="text-sm font-bold text-on-surface">{aiResult.severity_rating || 'N/A'}</p>
                  <p className="text-[10px] text-on-surface-variant font-semibold">Severity</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-surface/80">
                  <p className="text-sm font-bold text-on-surface">{aiResult.suggested_category || 'N/A'}</p>
                  <p className="text-[10px] text-on-surface-variant font-semibold">Category</p>
                </div>
                <div className="text-center p-2 rounded-xl bg-surface/80">
                  <p className="text-sm font-bold text-on-surface">{aiResult.is_duplicate ? 'Yes' : 'No'}</p>
                  <p className="text-[10px] text-on-surface-variant font-semibold">Duplicate</p>
                </div>
              </div>
              {aiResult.ai_summary && (
                <p className="text-xs text-on-surface-variant bg-surface/80 p-3 rounded-xl">{aiResult.ai_summary}</p>
              )}
            </Card>
          )}

          {/* Internal Notes */}
          <Card className="p-lg flex flex-col gap-sm border-outline-variant/30">
            <h2 className="font-bold text-on-surface">Internal Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add officer notes about this report..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-blue-500 resize-none"
            />
          </Card>
        </div>

        {/* Right Column — Actions */}
        <div className="flex flex-col gap-md">
          {/* Status Card */}
          <Card className="p-lg flex flex-col gap-sm border-outline-variant/30">
            <h2 className="font-bold text-on-surface">Current Status</h2>
            <span className="text-sm font-extrabold text-blue-600 bg-blue-500/10 px-3 py-1.5 rounded-full text-center">
              {(report.status || '').replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-sm font-extrabold text-on-surface">Priority: <span className="capitalize">{report.priority}</span></span>
          </Card>

          {/* Change Status */}
          <Card className="p-lg flex flex-col gap-sm border-outline-variant/30">
            <h2 className="font-bold text-on-surface text-sm">Change Status</h2>
            <div className="flex flex-col gap-2">
              {STATUS_TRANSITIONS.map((s) => (
                <Button
                  key={s}
                  variant={report.status === s ? 'primary' : 'outline'}
                  size="sm"
                  disabled={updating || report.status === s}
                  onClick={() => handleStatusChange(s)}
                  className="w-full capitalize"
                >
                  {s.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </Card>

          {/* Assign Department */}
          <Card className="p-lg flex flex-col gap-sm border-outline-variant/30">
            <h2 className="font-bold text-on-surface text-sm">Assign Department</h2>
            <select
              value={report.assigned_department_id || ''}
              onChange={(e) => handleDeptChange(e.target.value)}
              disabled={updating}
              className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface focus:outline-none focus:border-blue-500"
            >
              <option value="">Unassigned</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </Card>

          {/* Karma Awarded */}
          {report.karma_awarded && (
            <Card className="p-lg flex items-center gap-md border-secondary/20 bg-secondary-container/10">
              <span className="material-symbols-outlined text-secondary text-2xl">eco</span>
              <div>
                <p className="font-bold text-on-surface text-sm">Karma Awarded</p>
                <p className="text-lg font-black text-secondary">+{report.karma_awarded}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
