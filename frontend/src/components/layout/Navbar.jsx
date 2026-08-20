import React, { useState } from 'react';
import { Menu, LogOut, RefreshCw, Sparkles, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const Navbar = ({ onOpenSidebar }) => {
  const { user, profile, logout, isSuperAdmin } = useAuth();
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSync = async () => {
    try {
      setSyncing(true);
      if (isSuperAdmin) {
        const res = await api.post('/members/sync-all');
        showToast(res.data?.message || 'All member platform metrics refreshed!', 'success');
      } else if (profile?._id) {
        const res = await api.post(`/members/${profile._id}/sync`);
        showToast(res.data?.message || 'Your platform statistics have been updated!', 'success');
      }
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      showToast('Sync request failed. Please check network connection.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-900/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-4 sm:px-6">
      {/* Left section: mobile toggle + club indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Live Workspace</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">{profile?.department || 'BX Club'} • Year {profile?.year || 1}</span>
        </div>
      </div>

      {/* Right section: Sync, Notifications, Profile dropdown */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-dark-800 hover:bg-dark-700 text-indigo-300 border border-indigo-500/30 transition-all hover:border-indigo-500/60 shadow-sm"
          title={isSuperAdmin ? 'Sync All Club Members' : 'Sync My Platform Profiles'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-indigo-400' : ''}`} />
          <span>{syncing ? 'Syncing...' : isSuperAdmin ? 'Sync All Data' : 'Sync Profiles'}</span>
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition-all"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
              alt={user?.name}
              className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/40 object-cover"
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-white leading-tight">{user?.name}</p>
              <p className="text-[10px] text-indigo-400 font-medium capitalize">{user?.role}</p>
            </div>
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-slate-700 bg-dark-900 shadow-2xl p-2 z-50 animate-scaleUp">
                <div className="p-3 border-b border-slate-800 mb-1">
                  <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] uppercase font-bold text-indigo-300">
                      {user?.role === 'superadmin' ? 'Super Admin' : user?.role}
                    </span>
                  </div>
                </div>

                <a
                  href="/profile"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile & Links</span>
                </a>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
