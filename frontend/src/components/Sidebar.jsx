import React from 'react';
import { 
  ShieldCheck,
  LayoutDashboard, 
  Search, 
  MessageSquareWarning, 
  FileText, 
  History
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'media', label: 'Media Analysis', icon: Search, badge: 'Live' },
    { id: 'text', label: 'Text Scam Scanner', icon: MessageSquareWarning },
    { id: 'reports', label: 'Risk Reports', icon: FileText, highlight: true },
    { id: 'audit', label: 'Audit Logs', icon: History },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 font-sans">
                Trust<span className="text-sky-600">Shield</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded border border-sky-100">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Multimodal Scam Defense</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Forensic Intelligence
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 shadow-sm border border-sky-100/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md border border-indigo-100">
                    PDF
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-slate-900 to-slate-850 p-3 rounded-xl text-white">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-300">Neural Engine v2.0</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">Supervised Multimodal Core (Text, Image, Video, Audio)</p>
        </div>
      </div>
    </aside>
  );
}
