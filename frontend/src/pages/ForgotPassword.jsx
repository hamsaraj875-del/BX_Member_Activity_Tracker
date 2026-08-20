import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Mail, ArrowLeft, Send } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgotpassword', { email });
      setSubmitted(true);
      showToast(res.data?.message || 'Reset link instructions sent!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'User with this email not found.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a12] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-xl glow-indigo mb-2">
            <Code2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enter your registered email to receive access credentials
          </p>
        </div>

        <div className="rounded-3xl glass-card border border-slate-800/90 p-7 sm:p-8 shadow-2xl bg-dark-900/90">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl text-xs leading-relaxed">
                Reset instructions simulated! For demonstration, you can log in using password <strong>password123</strong> for demo accounts or registered credentials.
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. hamsaraj@bx.club"
                    required
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-dark-950/60 border border-slate-700 text-white placeholder-slate-500 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo shadow-lg disabled:opacity-50"
              >
                {loading ? 'Processing...' : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
