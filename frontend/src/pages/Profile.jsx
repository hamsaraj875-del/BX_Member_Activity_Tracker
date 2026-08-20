import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  Building,
  Calendar,
  Github,
  Globe,
  Linkedin,
  Flame,
  Binary,
  Award,
  Save,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RoleBadge, DepartmentBadge } from '../components/common/Badge';

export const Profile = () => {
  const { user, profile, checkAuth } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    department: 'CSE',
    year: 1,
    skills: '',
    github: '',
    leetcode: '',
    codeforces: '',
    kaggle: '',
    linkedin: '',
    portfolio: '',
    hackerrank: '',
    geeksforgeeks: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user && profile) {
      const getPlatformUsername = (name) => {
        const p = profile.platforms?.find((item) => item.name === name);
        return p?.username || '';
      };

      setFormData({
        name: user.name || '',
        bio: profile.bio || '',
        department: profile.department || 'CSE',
        year: profile.year || 1,
        skills: profile.skills?.join(', ') || '',
        github: getPlatformUsername('github'),
        leetcode: getPlatformUsername('leetcode'),
        codeforces: getPlatformUsername('codeforces'),
        kaggle: getPlatformUsername('kaggle'),
        linkedin: profile.socialLinks?.linkedin || '',
        portfolio: profile.socialLinks?.portfolio || '',
        hackerrank: profile.socialLinks?.hackerrank || '',
        geeksforgeeks: profile.socialLinks?.geeksforgeeks || '',
      });
    }
  }, [user, profile]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profile?._id) return;
    try {
      setSaving(true);
      const platforms = [
        { name: 'github', username: formData.github, profileUrl: formData.github ? `https://github.com/${formData.github}` : '' },
        { name: 'leetcode', username: formData.leetcode, profileUrl: formData.leetcode ? `https://leetcode.com/${formData.leetcode}` : '' },
        { name: 'codeforces', username: formData.codeforces, profileUrl: formData.codeforces ? `https://codeforces.com/profile/${formData.codeforces}` : '' },
        { name: 'kaggle', username: formData.kaggle, profileUrl: formData.kaggle ? `https://kaggle.com/${formData.kaggle}` : '' },
        { name: 'linkedin', username: formData.linkedin, profileUrl: formData.linkedin },
        { name: 'portfolio', username: formData.portfolio, profileUrl: formData.portfolio },
      ];

      const skillsArray = formData.skills.split(',').map((s) => s.trim()).filter(Boolean);

      const payload = {
        name: formData.name,
        bio: formData.bio,
        department: formData.department,
        year: Number(formData.year),
        skills: skillsArray,
        platforms,
        socialLinks: {
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
          hackerrank: formData.hackerrank,
          geeksforgeeks: formData.geeksforgeeks,
        },
      };

      const res = await api.put(`/members/${profile._id}`, payload);
      if (res.data?.success) {
        showToast('Profile and platform links updated!', 'success');
        await checkAuth();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    try {
      setUpdatingPassword(true);
      const res = await api.put('/auth/updatepassword', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.data?.success) {
        showToast('Password updated successfully!', 'success');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-7 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-indigo-400" />
          <span>My Profile & Coding Platform Links</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal BX club information, connected developer profiles, and account security.
        </p>
      </div>

      {/* Main Profile Form */}
      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-6">
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-indigo-500/40 object-cover shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{user?.name}</h3>
                <RoleBadge role={profile?.bxRole} />
              </div>
              <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Short Bio
            </label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell other BX members about your technical interests and projects..."
              className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Skills (Comma Separated)
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g. React, Docker, Python, Algorithms, Go"
              className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Platform Handles Section */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform Integrations & Handles</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-cyan-400" />
                  <span>GitHub Username</span>
                </label>
                <input
                  type="text"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="e.g. torvalds"
                  className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>LeetCode Username</span>
                </label>
                <input
                  type="text"
                  value={formData.leetcode}
                  onChange={(e) => setFormData({ ...formData, leetcode: e.target.value })}
                  placeholder="e.g. leetcode_master"
                  className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Binary className="w-3.5 h-3.5 text-rose-400" />
                  <span>Codeforces Handle</span>
                </label>
                <input
                  type="text"
                  value={formData.codeforces}
                  onChange={(e) => setFormData({ ...formData, codeforces: e.target.value })}
                  placeholder="e.g. tourist"
                  className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kaggle Username</span>
                </label>
                <input
                  type="text"
                  value={formData.kaggle}
                  onChange={(e) => setFormData({ ...formData, kaggle: e.target.value })}
                  placeholder="e.g. kaggle_expert"
                  className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>LinkedIn Profile URL</span>
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Portfolio Website URL</span>
                </label>
                <input
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  placeholder="https://myportfolio.dev"
                  className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo shadow-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Change Card */}
      <div className="rounded-3xl glass-card border border-slate-800 p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-400" />
          <span>Security & Password</span>
        </h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                New Password
              </label>
              <input
                type="password"
                minLength={6}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                minLength={6}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl bg-dark-950/70 border border-slate-700 text-white text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updatingPassword}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-dark-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50"
          >
            {updatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
