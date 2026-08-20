import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Lock, Mail, ArrowRight, Shield, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res?.success) {
      navigate('/');
    }
  };

  const handleQuickDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#070a12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-xl glow-indigo mb-3 animate-float">
            <Code2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            BX ANALYTICS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Member Activity, Coding Intelligence & Analytics
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl glass-card border border-slate-800/90 p-7 sm:p-8 shadow-2xl bg-dark-900/90 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. hamsaraj@bx.club"
                  required
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-dark-950/60 border border-slate-700/70 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-dark-950/60 border border-slate-700/70 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo shadow-lg mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Demo Logins (Password: password123)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@bx.club')}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-800/50 hover:bg-indigo-950/50 border border-slate-700 hover:border-indigo-500/50 text-[11px] font-medium text-slate-300 hover:text-white transition-all text-center"
              >
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('lead@bx.club')}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-800/50 hover:bg-indigo-950/50 border border-slate-700 hover:border-indigo-500/50 text-[11px] font-medium text-slate-300 hover:text-white transition-all text-center"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Core Lead</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('member@bx.club')}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-800/50 hover:bg-indigo-950/50 border border-slate-700 hover:border-indigo-500/50 text-[11px] font-medium text-slate-300 hover:text-white transition-all text-center"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Club Member</span>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 ml-1">
              Join BX Club
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
