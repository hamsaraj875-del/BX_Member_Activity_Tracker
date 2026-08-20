import React from 'react';

export const Badge = ({ children, variant = 'indigo', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const variantClasses = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.indigo} ${className}`}>
      {children}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  switch (role?.toLowerCase()) {
    case 'superadmin':
      return <Badge variant="rose">Super Admin</Badge>;
    case 'lead':
      return <Badge variant="purple">Lead</Badge>;
    case 'core team':
    case 'core':
      return <Badge variant="indigo">Core Team</Badge>;
    case 'senior member':
      return <Badge variant="cyan">Senior Member</Badge>;
    case 'alumni':
      return <Badge variant="amber">Alumni</Badge>;
    default:
      return <Badge variant="slate">{role || 'Member'}</Badge>;
  }
};

export const DepartmentBadge = ({ department }) => {
  const colors = {
    CSE: 'indigo',
    ISE: 'cyan',
    ECE: 'amber',
    EEE: 'rose',
    ME: 'purple',
    AIDS: 'emerald',
    CSBS: 'cyan',
  };
  return <Badge variant={colors[department] || 'slate'}>{department}</Badge>;
};
