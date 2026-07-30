'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { fetchAllDepartments, createDepartment, updateDepartment } from '@/services/adminService';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { loadDepartments(); }, []);

  async function loadDepartments() {
    setLoading(true);
    const data = await fetchAllDepartments();
    setDepartments(data);
    setLoading(false);
  }

  async function handleCreate() {
    setSaving(true);
    try {
      if (editingId) {
        await updateDepartment(editingId, form);
      } else {
        await createDepartment(form.name, form.description);
      }
      setShowForm(false);
      setForm({ name: '', description: '' });
      setEditingId(null);
      await loadDepartments();
    } catch (err) { console.error(err); }
    setSaving(false);
  }

  function handleEdit(dept: any) {
    setEditingId(dept.id);
    setForm({ name: dept.name, description: dept.description || '' });
    setShowForm(true);
  }

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-on-surface">Departments</h1>
        <Button variant="primary" size="sm" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', description: '' }); }}>
          {showForm ? 'Cancel' : '+ New Department'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-lg flex flex-col gap-md border-green-500/20">
          <h2 className="font-bold text-on-surface">{editingId ? 'Edit Department' : 'Create Department'}</h2>
          <input
            placeholder="Department Name"
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-green-500"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
            className="px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-green-500 resize-none"
          />
          <Button variant="primary" onClick={handleCreate} disabled={saving || !form.name}>
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </Button>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col gap-sm animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-surface-container-high rounded-xl" />)}
        </div>
      ) : departments.length === 0 ? (
        <Card className="p-xl text-center text-on-surface-variant border-dashed">
          <p className="text-sm font-semibold">No departments created yet</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-sm">
          {departments.map((dept) => (
            <Card key={dept.id} className="p-md flex items-center gap-md border-outline-variant/30">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-xl">business</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-on-surface">{dept.name}</h3>
                <p className="text-xs text-on-surface-variant truncate">{dept.description || 'No description'}</p>
              </div>
              <span className="text-xs text-on-surface-variant">{dept.officer_count || 0} officers</span>
              <button
                onClick={() => handleEdit(dept)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
