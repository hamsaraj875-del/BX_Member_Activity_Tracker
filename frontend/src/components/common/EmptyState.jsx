import React from 'react';
import { FolderSearch, RefreshCw } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No records found',
  description = 'Try adjusting your search query or filters to find what you are looking for.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-card border border-slate-800 my-4">
      <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4 animate-float">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all glow-indigo shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
