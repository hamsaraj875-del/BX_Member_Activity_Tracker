import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Lock, Mail, User, Building, Calendar, ArrowRight, Github } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'CSE',
    year: 1,
    bxRole: 'Member',
    github: '',
    leetcode: '',
    codeforces: '',
    kaggle: '',
  });

  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const platforms = [
      { name: 'github', username: formData.github, profileUrl: formData.github ? `https://github.com/${formData.github}` : '' },
      { name: 'leetcode', username: formData.leetcode, profileUrl: formData.leetcode ? `https://leetcode.com/${formData.leetcode}` : '' },
      { name: 'codeforces', username: formData.codeforces, profileUrl: formData.codeforces ? `https://codeforces.com/profile/${formData.codeforces}` : '' },
      { name: 'kaggle', username: formData.kaggle, profileUrl: formData.kaggle ? `https://kaggle.com/${formData.kaggle}` : '' },
    ];

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      department: formData.department,
      year: Number(formData.year),
      bxRole: formData.bxRole,
      platforms,
    };

    const res = await register(payload);
    setLoading(false);
    if (res?.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] flex items-center justify-center p-4 py-8 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-xl glow-indigo mb-2">
            <Code2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Join BX Analytics</h1>
          <p className="text-xs text-slate-400">Register as a club member to aggregate your developer metrics</p>
        </div>

        <div className="rounded-3xl glass-card border border-slate-800/90 p-6 sm:p-8 shadow-2xl bg-dark-900/90 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Hamsaraj"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-950/60 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. hamsaraj@bx.club"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-950/60 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-dark-950/60 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950/60 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="CSE">CSE</option>
                  <option value="ISE">ISE</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="ME">ME</option>
                  <option value="AIDS">AIDS</option>
                  <option value="CSBS">CSBS</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Academic Year
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950/60 border border-slate-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
                Coding Platform Handles (Optional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="GitHub username"
                  className="px-3 py-1.5 rounded-xl bg-dark-950/60 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
                />
                <input
                  type="text"
                  name="leetcode"
                  value={formData.leetcode}
                  onChange={handleChange}
                  placeholder="LeetCode username"
                  className="px-3 py-1.5 rounded-xl bg-dark-950/60 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
                />
                <input
                  type="text"
                  name="codeforces"
                  value={formData.codeforces}
                  onChange={handleChange}
                  placeholder="Codeforces handle"
                  className="px-3 py-1.5 rounded-xl bg-dark-950/60 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
                />
                <input
                  type="text"
                  name="kaggle"
                  value={formData.kaggle}
                  onChange={handleChange}
                  placeholder="Kaggle username"
                  className="px-3 py-1.5 rounded-xl bg-dark-950/60 border border-slate-700 text-white placeholder-slate-500 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo shadow-lg mt-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Member Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 ml-1">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
