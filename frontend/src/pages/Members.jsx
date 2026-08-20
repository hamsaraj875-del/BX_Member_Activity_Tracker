import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  LayoutGrid,
  List,
  GitCommit,
  Flame,
  Binary,
  Award,
  ExternalLink,
  ChevronRight,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RoleBadge, DepartmentBadge } from '../components/common/Badge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { exportToCSV } from '../utils/exportCsv';

export const Members = () => {
  const { isStaff, isSuperAdmin } = useAuth();
  const { showToast } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  
  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [year, setYear] = useState('all');
  const [role, setRole] = useState('all');
  const [sortBy, setSortBy] = useState('totalContributions');

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    password: 'password123',
    department: 'CSE',
    year: 1,
    bxRole: 'Member',
    github: '',
    leetcode: '',
    codeforces: '',
    kaggle: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        department,
        year,
        role,
        sortBy,
      };
      const res = await api.get('/members', { params });
      if (res.data?.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load member records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, department, year, role, sortBy]);

  const handleExportCSV = () => {
    if (!members.length) {
      showToast('No members to export.', 'warning');
      return;
    }
    const exportData = members.map((m) => ({
      Name: m.user?.name,
      Email: m.user?.email,
      Department: m.department,
      Year: m.year,
      BXRole: m.bxRole,
      GitHubCommits: m.statsSummary?.githubCommits || 0,
      LeetCodeSolved: m.statsSummary?.leetcodeSolved || 0,
      CodeforcesRating: m.statsSummary?.codeforcesRating || 0,
      AttendanceRate: `${m.statsSummary?.attendanceRate || 0}%`,
      TotalContributions: m.statsSummary?.totalContributions || 0,
    }));
    exportToCSV(exportData, `BX_Members_Roster_${Date.now()}.csv`);
    showToast('Members roster exported as CSV!', 'success');
  };

  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const platforms = [
        { name: 'github', username: newMember.github, profileUrl: newMember.github ? `https://github.com/${newMember.github}` : '' },
        { name: 'leetcode', username: newMember.leetcode, profileUrl: newMember.leetcode ? `https://leetcode.com/${newMember.leetcode}` : '' },
        { name: 'codeforces', username: newMember.codeforces, profileUrl: newMember.codeforces ? `https://codeforces.com/profile/${newMember.codeforces}` : '' },
        { name: 'kaggle', username: newMember.kaggle, profileUrl: newMember.kaggle ? `https://kaggle.com/${newMember.kaggle}` : '' },
      ];

      const res = await api.post('/auth/register', {
        ...newMember,
        year: Number(newMember.year),
        platforms,
      });

      if (res.data?.success) {
        showToast(`Member "${newMember.name}" created successfully!`, 'success');
        setIsAddModalOpen(false);
        setNewMember({
          name: '',
          email: '',
          password: 'password123',
          department: 'CSE',
          year: 1,
          bxRole: 'Member',
          github: '',
          leetcode: '',
          codeforces: '',
          kaggle: '',
        });
        fetchMembers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create member.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-400" />
            <span>Member Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Directory of BX club members, multi-platform coding links & verified contribution scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-dark-800 hover:bg-dark-700 text-slate-200 border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          {isStaff && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl glass-card border border-slate-800 p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, skills, or platform handles..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-dark-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-dark-950/70 p-1 rounded-xl border border-slate-700/80 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-dark-950/80 border border-slate-700 text-slate-300 text-xs focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="ISE">ISE</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="ME">ME</option>
              <option value="AIDS">AIDS</option>
              <option value="CSBS">CSBS</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Academic Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-dark-950/80 border border-slate-700 text-slate-300 text-xs focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              BX Club Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-dark-950/80 border border-slate-700 text-slate-300 text-xs focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="Lead">Lead</option>
              <option value="Core Team">Core Team</option>
              <option value="Senior Member">Senior Member</option>
              <option value="Member">Member</option>
              <option value="Alumni">Alumni</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-dark-950/80 border border-slate-700 text-slate-300 text-xs focus:border-indigo-500 focus:outline-none"
            >
              <option value="totalContributions">Total Score</option>
              <option value="githubCommits">GitHub Commits</option>
              <option value="leetcodeSolved">LeetCode Solved</option>
              <option value="attendanceRate">Attendance %</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <LoadingSkeleton type="table" count={8} />
      ) : members.length === 0 ? (
        <EmptyState
          title="No members match your criteria"
          description="Try modifying search keywords or resetting filters."
          actionLabel="Reset All Filters"
          onAction={() => {
            setSearch('');
            setDepartment('all');
            setYear('all');
            setRole('all');
          }}
        />
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-2xl glass-card border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase tracking-wider text-slate-400 bg-dark-950/80 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Member</th>
                  <th className="py-3.5 px-4 font-semibold">Dept & Year</th>
                  <th className="py-3.5 px-4 font-semibold">BX Role</th>
                  <th className="py-3.5 px-4 font-semibold text-center">GitHub</th>
                  <th className="py-3.5 px-4 font-semibold text-center">LeetCode</th>
                  <th className="py-3.5 px-4 font-semibold text-center">CF Rating</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Attendance</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Score</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {members.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 px-4">
                      <Link to={`/members/${m._id}`} className="flex items-center gap-3">
                        <img
                          src={m.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.user?.name}`}
                          alt={m.user?.name}
                          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 object-cover shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                            {m.user?.name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">{m.user?.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <DepartmentBadge department={m.department} />
                        <span className="text-xs text-slate-400">Yr {m.year}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <RoleBadge role={m.bxRole} />
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-cyan-400">
                      {m.statsSummary?.githubCommits || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-amber-400">
                      {m.statsSummary?.leetcodeSolved || 0}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-rose-400">
                      {m.statsSummary?.codeforcesRating || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs font-semibold text-slate-200">
                        {m.statsSummary?.attendanceRate || 0}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {m.statsSummary?.totalContributions || 0} pts
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        to={`/members/${m._id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors inline-block"
                        title="View Full Profile"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((m) => (
            <div
              key={m._id}
              className="rounded-2xl glass-card border border-slate-800 p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-all hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.user?.name}`}
                      alt={m.user?.name}
                      className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-white">{m.user?.name}</h3>
                      <p className="text-xs text-slate-400">{m.user?.email}</p>
                    </div>
                  </div>
                  <RoleBadge role={m.bxRole} />
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <DepartmentBadge department={m.department} />
                  <span className="text-xs text-slate-400">Year {m.year}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 px-2 bg-dark-950/60 rounded-xl border border-slate-800 text-center mb-4">
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 font-semibold">GitHub</p>
                    <p className="text-sm font-bold text-cyan-400 font-mono">{m.statsSummary?.githubCommits || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 font-semibold">LeetCode</p>
                    <p className="text-sm font-bold text-amber-400 font-mono">{m.statsSummary?.leetcodeSolved || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 font-semibold">Attend</p>
                    <p className="text-sm font-bold text-emerald-400 font-mono">{m.statsSummary?.attendanceRate || 0}%</p>
                  </div>
                </div>
              </div>

              <Link
                to={`/members/${m._id}`}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-dark-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 hover:border-indigo-500 transition-all"
              >
                <span>Inspect Full Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New BX Member"
      >
        <form onSubmit={handleCreateMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                required
                placeholder="e.g. Anand Krishna"
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                required
                placeholder="anand@bx.club"
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Department
              </label>
              <select
                value={newMember.department}
                onChange={(e) => setNewMember({ ...newMember, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="CSE">CSE</option>
                <option value="ISE">ISE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="ME">ME</option>
                <option value="AIDS">AIDS</option>
                <option value="CSBS">CSBS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Academic Year
              </label>
              <select
                value={newMember.year}
                onChange={(e) => setNewMember({ ...newMember, year: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                BX Role
              </label>
              <select
                value={newMember.bxRole}
                onChange={(e) => setNewMember({ ...newMember, bxRole: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              >
                <option value="Member">Member</option>
                <option value="Senior Member">Senior Member</option>
                <option value="Core Team">Core Team</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
              Platform Handles
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newMember.github}
                onChange={(e) => setNewMember({ ...newMember, github: e.target.value })}
                placeholder="GitHub username"
                className="px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                value={newMember.leetcode}
                onChange={(e) => setNewMember({ ...newMember, leetcode: e.target.value })}
                placeholder="LeetCode username"
                className="px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                value={newMember.codeforces}
                onChange={(e) => setNewMember({ ...newMember, codeforces: e.target.value })}
                placeholder="Codeforces handle"
                className="px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                value={newMember.kaggle}
                onChange={(e) => setNewMember({ ...newMember, kaggle: e.target.value })}
                placeholder="Kaggle username"
                className="px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-dark-800 text-slate-300 hover:bg-dark-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Save Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
