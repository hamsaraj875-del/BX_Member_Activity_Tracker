import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  color = 'indigo',
  onClick,
}) => {
  const colorStyles = {
    indigo: {
      border: 'hover:border-indigo-500/40',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      gradient: 'from-indigo-500/5 to-transparent',
    },
    cyan: {
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
      gradient: 'from-cyan-500/5 to-transparent',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      gradient: 'from-emerald-500/5 to-transparent',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      gradient: 'from-amber-500/5 to-transparent',
    },
    rose: {
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      gradient: 'from-rose-500/5 to-transparent',
    },
    purple: {
      border: 'hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      gradient: 'from-purple-500/5 to-transparent',
    },
  };

  const currentStyle = colorStyles[color] || colorStyles.indigo;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl glass-card p-5 border transition-all duration-300 ${currentStyle.border} ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${currentStyle.gradient} pointer-events-none`} />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${currentStyle.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend !== undefined) && (
        <div className="relative z-10 mt-3.5 flex items-center gap-2 text-xs">
          {trend !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                trend >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend >= 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {trendLabel && !subtitle && <span className="text-slate-400">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
};
