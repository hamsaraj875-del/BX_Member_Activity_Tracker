import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Filter,
  CheckCircle2,
  GitPullRequest,
  Code2,
  Calendar,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { RoleBadge, DepartmentBadge } from '../components/common/Badge';

export const Contributions = () => {
  const { user, isStaff } = useAuth();
  const { showToast } = useToast();

  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('all');

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContrib, setNewContrib] = useState({
    title: '',
    source: 'github',
    type: 'pr_merge',
    description: '',
    impactScore: 25,
    link: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contributions', {
        params: { source: sourceFilter },
      });
      if (res.data?.success) {
        setContributions(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load contributions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [sourceFilter]);

  const handleAddContribution = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/contributions', newContrib);
      if (res.data?.success) {
        showToast('Contribution logged and calculated into your score!', 'success');
        setIsAddModalOpen(false);
        setNewContrib({
          title: '',
          source: 'github',
          type: 'pr_merge',
          description: '',
          impactScore: 25,
          link: '',
        });
        fetchContributions();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to log contribution.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVerify = async (id, currentStatus) => {
    try {
      const res = await api.put(`/contributions/${id}/verify`, {
        verified: !currentStatus,
      });
      if (res.data?.success) {
        showToast('Verification status updated.', 'success');
        fetchContributions();
      }
    } catch (err) {
      showToast('Failed to update verification status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-7 h-7 text-amber-400" />
            <span>Club Contributions & Impact</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Verified technical contributions, open-source PRs, workshops conducted, and community leadership.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo shadow-lg self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Contribution</span>
        </button>
      </div>

      {/* Source Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {['all', 'github', 'bx_event', 'project', 'hackathon', 'leetcode', 'kaggle'].map((s) => (
          <button
            key={s}
            onClick={() => setSourceFilter(s)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              sourceFilter === s
                ? 'bg-indigo-600 text-white shadow-md glow-indigo'
                : 'bg-dark-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Contributions Feed */}
      {loading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : contributions.length === 0 ? (
        <EmptyState
          title="No contributions found"
          description="There are currently no contributions matching this filter."
        />
      ) : (
        <div className="rounded-2xl glass-card border border-slate-800 p-4 sm:p-6 space-y-3.5">
          {contributions.map((c) => {
            const memberUser = c.member?.user;
            return (
              <div
                key={c._id}
                className="p-4 rounded-xl bg-dark-950/60 border border-slate-800/80 hover:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-white">{c.title}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-mono font-bold bg-dark-800 text-indigo-300 border border-slate-700">
                        {c.source?.replace('_', ' ')}
                      </span>
                      {c.verified && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mb-1.5">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>By: <strong className="text-slate-300">{memberUser?.name || 'BX Member'}</strong></span>
                      {c.member?.department && (
                        <>
                          <span>•</span>
                          <DepartmentBadge department={c.member.department} />
                        </>
                      )}
                      <span>•</span>
                      <span>{new Date(c.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    +{c.impactScore} Score Points
                  </span>

                  {isStaff && (
                    <button
                      onClick={() => handleToggleVerify(c._id, c.verified)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        c.verified
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-rose-500/10 hover:text-rose-400'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                    >
                      {c.verified ? 'Revoke' : 'Verify'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Contribution Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Concrete Technical Contribution"
      >
        <form onSubmit={handleAddContribution} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Contribution Title *
            </label>
            <input
              type="text"
              value={newContrib.title}
              onChange={(e) => setNewContrib({ ...newContrib, title: e.target.value })}
              required
              placeholder="e.g. Conducted Hands-on System Design Workshop on Caching"
              className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Source Domain
              </label>
              <select
                value={newContrib.source}
                onChange={(e) => setNewContrib({ ...newContrib, source: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="github">GitHub PR / Open Source</option>
                <option value="bx_event">BX Workshop / Speaker</option>
                <option value="project">Club Engineering Project</option>
                <option value="hackathon">Hackathon Achievement</option>
                <option value="leetcode">LeetCode Solution Article</option>
                <option value="kaggle">Kaggle Medal / Dataset</option>
                <option value="mentorship">Junior Mentorship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Impact Points Value
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={newContrib.impactScore}
                onChange={(e) => setNewContrib({ ...newContrib, impactScore: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Description & Evidence *
            </label>
            <textarea
              rows={3}
              value={newContrib.description}
              onChange={(e) => setNewContrib({ ...newContrib, description: e.target.value })}
              required
              placeholder="Detail what was completed, audience reached, and technical artifacts created..."
              className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-dark-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Submit Contribution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
