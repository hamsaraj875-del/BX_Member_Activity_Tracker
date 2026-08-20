import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  RefreshCw,
  Sliders,
  Database,
  Save,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const Settings = () => {
  const { isSuperAdmin } = useAuth();
  const { showToast } = useToast();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data?.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load system settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/settings', settings);
      if (res.data?.success) {
        showToast('Settings saved successfully!', 'success');
      }
    } catch (err) {
      showToast('Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      const res = await api.post('/members/sync-all');
      showToast(res.data?.message || 'Synchronized all platform profiles!', 'success');
    } catch (err) {
      showToast('Club-wide sync failed.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="cards" count={3} />;
  }

  return (
    <div className="space-y-7 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-indigo-400" />
          <span>System & Platform Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure club rules, platform ingestion engines, and attendance thresholds.
        </p>
      </div>

      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Automated Ingestion Engine</h3>
            <p className="text-xs text-slate-400">Status of platform scrapers & mock fallbacks</p>
          </div>

          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Synchronizing...' : 'Force Club Sync'}</span>
          </button>
        </div>

        {settings && (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Club Official Name
                </label>
                <input
                  type="text"
                  value={settings.clubName || ''}
                  onChange={(e) => setSettings({ ...settings, clubName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Min Attendance Threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.minAttendanceThreshold || 75}
                  onChange={(e) => setSettings({ ...settings, minAttendanceThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Club Mission / Tagline
              </label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Architecture Details Badge */}
            <div className="p-4 bg-dark-950/80 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Extensible Multi-Platform Architecture Active</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Platform modules (`githubService.js`, `leetcodeService.js`, `codeforcesService.js`, `kaggleService.js`) are running with fallback mock data mode (`USE_MOCK_DATA=true`).
              </p>
            </div>

            {isSuperAdmin && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo shadow-lg disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
