import React from 'react';
import { Menu } from 'lucide-react';

export default function Header({ activeTab, onOpenMobileMenu }) {
  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return ['Overview', 'Global Threat Intelligence'];
      case 'media':
        return ['Media Analysis', 'Live Forensic Scan'];
      case 'text':
        return ['Communication Defense', 'Text Scam & Phishing'];
      case 'reports':
        return ['Forensic Intelligence', 'Risk Reports & PDF Export'];
      case 'audit':
        return ['Audit Logs', 'Forensic Investigation History'];
      case 'settings':
        return ['Configuration', 'Forensic Engine Parameters'];
      default:
        return ['Media Analysis', 'Live Forensic Scan'];
    }
  };

  const [category, title] = getBreadcrumb();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Menu Trigger & Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 -ml-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 truncate">
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
            {category}
          </span>
          <span className="text-slate-300 text-xs hidden sm:inline">/</span>
          <span className="text-xs font-bold text-slate-800 tracking-tight truncate">
            {title}
          </span>
        </div>
      </div>

      {/* Right Controls: Engine Status Badge */}
      <div className="flex items-center shrink-0 ml-2">
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider">ENGINE: ACTIVE</span>
        </div>
      </div>
    </header>
  );
}
