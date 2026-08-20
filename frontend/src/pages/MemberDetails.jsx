import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  ArrowLeft,
  RefreshCw,
  GitCommit,
  Flame,
  Binary,
  Award,
  Calendar,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RoleBadge, DepartmentBadge, Badge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const MemberDetails = () => {
  const { id } = useParams();
  const { user: currentUser, isStaff } = useAuth();
  const { showToast } = useToast();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/members/${id}`);
      if (res.data?.success) {
        setMember(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load member profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await api.post(`/members/${id}/sync`);
      if (res.data?.success) {
        showToast('Platform statistics synced successfully!', 'success');
        fetchMember();
      }
    } catch (err) {
      showToast('Sync failed. Please check network connection.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="cards" count={3} />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-12 text-center rounded-2xl glass-card border border-rose-500/20">
        <p className="text-rose-400 font-semibold mb-4">Member profile not found.</p>
        <Link to="/members" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Return to Members Roster
        </Link>
      </div>
    );
  }

  const { statsSummary = {}, platforms = [], contributions = [], attendances = [] } = member;

  // Find platform stats
  const githubPlatform = platforms.find((p) => p.name === 'github');
  const leetcodePlatform = platforms.find((p) => p.name === 'leetcode');
  const codeforcesPlatform = platforms.find((p) => p.name === 'codeforces');
  const kagglePlatform = platforms.find((p) => p.name === 'kaggle');

  return (
    <div className="space-y-7">
      {/* Back Button & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/members"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members Roster</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing Platforms...' : 'Sync Platform Data'}</span>
          </button>
        </div>
      </div>

      {/* Member Hero Header Card */}
      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 bg-gradient-to-r from-dark-900 via-dark-850 to-indigo-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <img
              src={member.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.user?.name}`}
              alt={member.user?.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-dark-950 border-2 border-indigo-500/40 object-cover shadow-xl shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{member.user?.name}</h1>
                <RoleBadge role={member.bxRole} />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Rank #{member.rank}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-3">
                <span className="font-mono">{member.user?.email}</span>
                <span>•</span>
                <DepartmentBadge department={member.department} />
                <span>•</span>
                <span>Year {member.year}</span>
                <span>•</span>
                <span className="text-indigo-400 font-semibold">{statsSummary.totalContributions || 0} pts</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {member.bio || 'Active BX club contributor and technical problem solver.'}
              </p>
            </div>
          </div>

          {/* Social Profile Links */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            {member.socialLinks?.linkedin && (
              <a
                href={member.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-dark-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-cyan-400" />
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-slate-500 ml-auto" />
              </a>
            )}
            {member.socialLinks?.portfolio && (
              <a
                href={member.socialLinks.portfolio}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-dark-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Portfolio</span>
                <ExternalLink className="w-3 h-3 text-slate-500 ml-auto" />
              </a>
            )}
          </div>
        </div>

        {/* Skills Pills */}
        {member.skills?.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">Skills:</span>
            {member.skills.map((s, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800/80 text-slate-300 border border-slate-700"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Platform Activity Cards Grid */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Connected Platform Profiles & Live Metrics</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* GitHub Card */}
          <div className="rounded-2xl glass-card border border-cyan-500/30 p-5 bg-gradient-to-b from-cyan-950/20 to-dark-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Github className="w-5 h-5" />
                  <span className="font-bold text-sm">GitHub</span>
                </div>
                {githubPlatform?.verified && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Synced
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400 truncate mb-4">
                @{githubPlatform?.username || 'Not Linked'}
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Public Commits:</span>
                  <span className="font-mono font-bold text-white">{statsSummary.githubCommits || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Public Repositories:</span>
                  <span className="font-mono font-bold text-white">{githubPlatform?.stats?.publicRepos || 12}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stars Earned:</span>
                  <span className="font-mono font-bold text-white">{githubPlatform?.stats?.starsReceived || 8}</span>
                </div>
              </div>
            </div>

            {githubPlatform?.profileUrl && (
              <a
                href={githubPlatform.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-dark-950/80 hover:bg-cyan-950 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-colors"
              >
                <span>View GitHub Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* LeetCode Card */}
          <div className="rounded-2xl glass-card border border-amber-500/30 p-5 bg-gradient-to-b from-amber-950/20 to-dark-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <Flame className="w-5 h-5" />
                  <span className="font-bold text-sm">LeetCode</span>
                </div>
                {leetcodePlatform?.verified && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Synced
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400 truncate mb-4">
                @{leetcodePlatform?.username || 'Not Linked'}
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Solved:</span>
                  <span className="font-mono font-bold text-white">{statsSummary.leetcodeSolved || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Easy / Med / Hard:</span>
                  <span className="font-mono font-bold text-white">
                    {statsSummary.leetcodeEasy || 0} / {statsSummary.leetcodeMedium || 0} / {statsSummary.leetcodeHard || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contest Rating:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {leetcodePlatform?.stats?.contestRating || 1550}
                  </span>
                </div>
              </div>
            </div>

            {leetcodePlatform?.profileUrl && (
              <a
                href={leetcodePlatform.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-dark-950/80 hover:bg-amber-950 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors"
              >
                <span>View LeetCode Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Codeforces Card */}
          <div className="rounded-2xl glass-card border border-rose-500/30 p-5 bg-gradient-to-b from-rose-950/20 to-dark-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-rose-400">
                  <Binary className="w-5 h-5" />
                  <span className="font-bold text-sm">Codeforces</span>
                </div>
                {codeforcesPlatform?.verified && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Synced
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400 truncate mb-4">
                @{codeforcesPlatform?.username || 'Not Linked'}
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Rating:</span>
                  <span className="font-mono font-bold text-white">{statsSummary.codeforcesRating || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rank Tier:</span>
                  <span className="font-bold text-rose-300">
                    {codeforcesPlatform?.stats?.rank || (statsSummary.codeforcesRating >= 1600 ? 'Expert' : 'Specialist')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contests Count:</span>
                  <span className="font-mono font-bold text-white">{codeforcesPlatform?.stats?.contestsCount || 8}</span>
                </div>
              </div>
            </div>

            {codeforcesPlatform?.profileUrl && (
              <a
                href={codeforcesPlatform.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-dark-950/80 hover:bg-rose-950 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
              >
                <span>View Codeforces Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Kaggle Card */}
          <div className="rounded-2xl glass-card border border-emerald-500/30 p-5 bg-gradient-to-b from-emerald-950/20 to-dark-900 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Award className="w-5 h-5" />
                  <span className="font-bold text-sm">Kaggle</span>
                </div>
                {kagglePlatform?.verified && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Synced
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400 truncate mb-4">
                @{kagglePlatform?.username || 'Not Linked'}
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Competitions:</span>
                  <span className="font-mono font-bold text-white">{statsSummary.kaggleCompetitions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Notebooks:</span>
                  <span className="font-mono font-bold text-white">{statsSummary.kaggleNotebooks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kaggle Tier:</span>
                  <span className="font-bold text-emerald-300">{kagglePlatform?.stats?.tier || 'Expert'}</span>
                </div>
              </div>
            </div>

            {kagglePlatform?.profileUrl && (
              <a
                href={kagglePlatform.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-dark-950/80 hover:bg-emerald-950 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
              >
                <span>View Kaggle Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Contribution Timeline & Attendance History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verified Contributions Timeline */}
        <div className="rounded-2xl glass-card border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Concrete Contribution Records</h3>
            </div>
            <span className="text-xs text-slate-400">{contributions.length} recorded</span>
          </div>

          <div className="space-y-3.5">
            {contributions.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No contribution entries logged yet.</p>
            ) : (
              contributions.map((c) => (
                <div key={c._id} className="p-3.5 rounded-xl bg-dark-950/70 border border-slate-800/80 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {c.source}
                      </span>
                      <h4 className="text-xs font-bold text-white">{c.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug">{c.description}</p>
                    <span className="text-[10px] text-slate-500 mt-1.5 block">
                      {new Date(c.date).toLocaleDateString()}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                    +{c.impactScore} pts
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Club Attendance History */}
        <div className="rounded-2xl glass-card border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Event Attendance History</h3>
            </div>
            <span className="text-xs text-emerald-400 font-bold">
              {statsSummary.attendanceRate}% Attendance Rate ({statsSummary.eventsAttended || 0} / {statsSummary.totalEvents || 0})
            </span>
          </div>

          <div className="space-y-3.5">
            {attendances.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No attendance records found.</p>
            ) : (
              attendances.map((a) => (
                <div key={a._id} className="p-3.5 rounded-xl bg-dark-950/70 border border-slate-800/80 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">{a.event?.title || 'Club Meeting'}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{a.event?.location || 'BX Hub'}</span>
                      <span>•</span>
                      <span>{new Date(a.markedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      a.status === 'present'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {a.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      via {a.method}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
