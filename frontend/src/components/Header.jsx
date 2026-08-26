import React from 'react';

export default function Header({ activeTab }) {
  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview / Global Threat Intelligence';
      case 'media':
        return 'Media Analysis / Live Forensic Scan';
      case 'text':
        return 'Communication Defense / Text Scam & Phishing';
      case 'reports':
        return 'Forensic Intelligence / Risk Reports & PDF Export';
      case 'audit':
        return 'Audit Logs / Forensic Investigation History';
      case 'settings':
        return 'Configuration / Forensic Engine Parameters';
      default:
        return 'Media Analysis / Live Forensic Scan';
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400">
          {getBreadcrumb().split(' / ')[0]}
        </span>
        <span className="text-slate-300 text-xs">/</span>
        <span className="text-xs font-bold text-slate-800 tracking-tight">
          {getBreadcrumb().split(' / ')[1]}
        </span>
      </div>

      {/* Right Controls: Only the ENGINE: ACTIVE indicator */}
      <div className="flex items-center">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] uppercase tracking-wider">ENGINE: ACTIVE</span>
        </div>
      </div>
    </header>
  );
}
