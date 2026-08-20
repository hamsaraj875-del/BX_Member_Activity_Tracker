import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  Award,
  TrendingUp,
  GitCommit,
  Code,
  Flame,
  Binary,
  ArrowUpRight,
  Sparkles,
  QrCode,
  PlusCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { DepartmentBadge, RoleBadge } from '../components/common/Badge';

export const Dashboard = () => {
  const { user, isStaff } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/analytics/dashboard');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="cards" count={6} />
        <LoadingSkeleton type="table" count={5} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-card border border-rose-500/20">
        <p className="text-rose-400 font-semibold mb-3">{error || 'Unable to load dashboard.'}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { stats, topMembers = [] } = data;

  return (
    <div className="space-y-7">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 bg-gradient-to-r from-dark-900 via-dark-850 to-indigo-950/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                BX Intelligence
              </span>
              <span className="text-xs text-slate-400">Live Pulse</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{user?.name}</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Member records, platform activity, attendance tracking, and club contributions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/attendance"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-dark-800 hover:bg-dark-700 text-white border border-slate-700 hover:border-slate-600 transition-all shadow-sm"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Mark QR Attendance</span>
            </Link>

            {isStaff && (
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Event</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 1. Main Club KPIs */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Core Club Health Metrics</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            icon={Users}
            color="indigo"
            subtitle="Registered in BX"
          />
          <StatCard
            title="Active Members"
            value={stats.activeMembers}
            icon={UserCheck}
            color="emerald"
            subtitle="Engaged recently"
          />
          <StatCard
            title="Inactive"
            value={stats.inactiveMembers}
            icon={UserX}
            color="rose"
            subtitle="Needs attention"
          />
          <StatCard
            title="Club Events"
            value={stats.totalEvents}
            icon={Calendar}
            color="cyan"
            subtitle="Hosted & upcoming"
          />
          <StatCard
            title="Avg Attendance"
            value={`${stats.averageAttendance}%`}
            icon={TrendingUp}
            color="purple"
            subtitle="Across all cohorts"
          />
          <StatCard
            title="Contributions"
            value={stats.totalContributions}
            icon={Award}
            color="amber"
            subtitle="Verified actions"
          />
        </div>
      </div>

      {/* 2. Coding Platform Aggregates */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-2">
          <Code className="w-4 h-4 text-cyan-400" />
          <span>Coding Platform Aggregates</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl glass-card border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-dark-900 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <GitCommit className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">GitHub Commits</p>
              <h4 className="text-2xl font-bold text-white">{stats.codingStats.githubCommits}</h4>
              <p className="text-[11px] text-cyan-400/90 font-medium">Across member repositories</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-dark-900 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">LeetCode Solved</p>
              <h4 className="text-2xl font-bold text-white">{stats.codingStats.leetcodeSolved}</h4>
              <p className="text-[11px] text-amber-400/90 font-medium">Easy, Medium & Hard DSA</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-rose-500/20 bg-gradient-to-br from-rose-950/20 to-dark-900 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <Binary className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Codeforces Solved</p>
              <h4 className="text-2xl font-bold text-white">{stats.codingStats.codeforcesSolved}</h4>
              <p className="text-[11px] text-rose-400/90 font-medium">Contest rated submissions</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-card border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-dark-900 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Kaggle Artifacts</p>
              <h4 className="text-2xl font-bold text-white">{stats.codingStats.kaggleCompetitions}</h4>
              <p className="text-[11px] text-emerald-400/90 font-medium">Notebooks & competitions</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top Members Leaderboard Table */}
      <div className="rounded-3xl glass-card border border-slate-800 p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Top BX Club Contributors Leaderboard</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked dynamically by verified platform commits, solved problems, contest ratings & event participation.
            </p>
          </div>
          <Link
            to="/members"
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
          >
            <span>View Full Roster</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wider text-slate-400 bg-dark-950/60 border-y border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Rank</th>
                <th className="py-3.5 px-4 font-semibold">Member</th>
                <th className="py-3.5 px-4 font-semibold">Department</th>
                <th className="py-3.5 px-4 font-semibold text-center">GitHub Commits</th>
                <th className="py-3.5 px-4 font-semibold text-center">LeetCode Solved</th>
                <th className="py-3.5 px-4 font-semibold text-center">CF Rating</th>
                <th className="py-3.5 px-4 font-semibold text-center">Attendance</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {topMembers.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                  onClick={() => window.location.href = `/members/${m.id}`}
                >
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        m.rank === 1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : m.rank === 2
                          ? 'bg-slate-400/20 text-slate-200 border border-slate-400/40'
                          : m.rank === 3
                          ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                          : 'text-slate-400'
                      }`}
                    >
                      #{m.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.name}`}
                        alt={m.name}
                        className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 object-cover shrink-0"
                      />
                      <div>
                        <div className="font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                          <span>{m.name}</span>
                          <RoleBadge role={m.bxRole} />
                        </div>
                        <span className="text-xs text-slate-400">Year {m.year}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <DepartmentBadge department={m.department} />
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-cyan-400">
                    {m.githubCommits}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-amber-400">
                    {m.leetcodeSolved}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-rose-400">
                    {m.codeforcesRating || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-semibold text-slate-200">{m.attendanceRate}%</span>
                      <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, m.attendanceRate)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                      {m.totalContributions} pts
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
