import React from 'react';

export const LoadingSkeleton = ({ type = 'cards', count = 4 }) => {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-dark-850 border border-slate-800/80 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-slate-700/60 rounded" />
              <div className="h-8 w-8 bg-slate-700/60 rounded-xl" />
            </div>
            <div className="h-8 w-20 bg-slate-700/60 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="rounded-2xl glass-card border border-slate-800 p-4 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-700/60 rounded" />
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-12 w-full bg-slate-800/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 rounded-2xl glass-card border border-slate-800 p-6 animate-pulse flex items-center justify-center">
      <div className="h-8 w-40 bg-slate-700/60 rounded" />
    </div>
  );
};
