'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { fetchSettings, updateSetting } from '@/services/adminService';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    setLoading(true);
    const data = await fetchSettings();
    setSettings(data);
    setLoading(false);
  }

  function startEdit(setting: any) {
    setEditingKey(setting.key);
    setEditValue(typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value, null, 2));
  }

  async function handleSave(key: string) {
    try {
      let parsedValue: unknown;
      try { parsedValue = JSON.parse(editValue); } catch { parsedValue = editValue; }
      await updateSetting(key, parsedValue);
      setEditingKey(null);
      await loadSettings();
    } catch (err) { console.error(err); }
  }

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <h1 className="text-2xl font-black text-on-surface">System Settings</h1>

      {loading ? (
        <div className="flex flex-col gap-sm animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-surface-container-high rounded-xl" />)}
        </div>
      ) : settings.length === 0 ? (
        <Card className="p-xl text-center text-on-surface-variant border-dashed">
          <span className="material-symbols-outlined text-4xl mb-2 block">settings</span>
          <p className="text-sm font-semibold">No system settings configured</p>
          <p className="text-xs">Settings will appear here when added to the database</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-sm">
          {settings.map((setting) => (
            <Card key={setting.id} className="p-md flex flex-col gap-sm border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-on-surface font-mono">{setting.key}</h3>
                  {setting.description && (
                    <p className="text-xs text-on-surface-variant">{setting.description}</p>
                  )}
                </div>
                {editingKey === setting.key ? (
                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" onClick={() => handleSave(setting.key)}>Save</Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingKey(null)}>Cancel</Button>
                  </div>
                ) : (
                  <button onClick={() => startEdit(setting)} className="p-1.5 rounded-lg text-on-surface-variant hover:text-blue-600 hover:bg-blue-500/10 transition-colors">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                )}
              </div>

              {editingKey === setting.key ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 text-sm text-on-surface font-mono focus:outline-none focus:border-blue-500 resize-none"
                />
              ) : (
                <pre className="text-xs text-on-surface-variant bg-surface-container-high p-3 rounded-xl overflow-x-auto font-mono">
                  {typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value, null, 2)}
                </pre>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
