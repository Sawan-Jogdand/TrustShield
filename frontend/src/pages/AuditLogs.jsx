import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';

export default function AuditLogs({ onNavigateToReport, onSetCurrentReport }) {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalityFilter, setModalityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/reports/history');
        if (res.ok) {
          setLogs(await res.json());
        }
      } catch (e) {
        console.log('Error fetching audit logs:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      (log.target || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.verdict || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModality = modalityFilter === 'ALL' || (log.modality || '').toUpperCase() === modalityFilter;
    return matchesSearch && matchesModality;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <History className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Forensic Investigation Audit Logs</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident chronological logs of all scanned images, video frames, voice clips, and text messages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-500">
            Total Audited Records: {logs.length}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search report ID, target media, verdict..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400">Modality:</span>
          {['ALL', 'IMAGE', 'VIDEO', 'AUDIO', 'TEXT'].map((mod) => (
            <button
              key={mod}
              onClick={() => setModalityFilter(mod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                modalityFilter === mod
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Audit Certificate</th>
                <th className="py-3 px-4">Subject Media</th>
                <th className="py-3 px-4">Modality</th>
                <th className="py-3 px-4">Prediction</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Trust Score</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((item, idx) => {
                  const isFake = item.prediction === 'FAKE' || item.prediction === 'SCAM';
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 max-w-[200px] truncate">
                        {item.target || item.filename || 'Input Media'}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {item.modality}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            isFake ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {item.prediction}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.confidence}%</td>
                      <td className="py-3 px-4 font-mono font-extrabold text-slate-900">{item.trust_score}/100</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-xs">
                          {item.risk_level === 'CRITICAL' ? '🔴 CRITICAL' :
                           item.risk_level === 'HIGH' ? '🟠 HIGH' :
                           item.risk_level === 'MEDIUM' ? '🟡 MEDIUM' : '🟢 LOW'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{item.timestamp}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (onSetCurrentReport) onSetCurrentReport(item);
                            if (onNavigateToReport) onNavigateToReport(item);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors inline-flex items-center gap-1 border border-sky-200"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>PDF Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No matching audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
