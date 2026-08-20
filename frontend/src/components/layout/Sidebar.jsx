import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  QrCode,
  CalendarDays,
  Award,
  User,
  Settings,
  X,
  Code2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isStaff } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Members', path: '/members', icon: Users },
    { label: 'Attendance & QR', path: '/attendance', icon: QrCode },
    { label: 'Club Events', path: '/events', icon: CalendarDays },
    { label: 'Contributions', path: '/contributions', icon: Award },
  ];

  const bottomItems = [
    { label: 'My Profile', path: '/profile', icon: User },
    ...(isStaff ? [{ label: 'Settings', path: '/settings', icon: Settings }] : []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-dark-900 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top brand header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg glow-indigo">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                  BX ANALYTICS
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-cyan-400/90 block">
                Technical Club
              </span>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-lg glow-indigo'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 pt-5 mb-2">
            Preferences
          </p>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-lg glow-indigo'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User badge footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-dark-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
              alt={user?.name}
              className="w-9 h-9 rounded-lg bg-indigo-950 border border-indigo-500/30 object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-400 shrink-0" />
                <p className="text-[11px] font-medium text-slate-400 capitalize truncate">
                  {user?.role === 'superadmin' ? 'Super Admin' : user?.role || 'Member'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
