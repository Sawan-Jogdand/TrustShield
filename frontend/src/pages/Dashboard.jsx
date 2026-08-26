import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  MessageSquareWarning, 
  FileText, 
  ArrowUpRight, 
  Sparkles, 
  Activity, 
  Layers, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Play,
  Volume2,
  Image as ImageIcon,
  Cpu
} from 'lucide-react';

export default function Dashboard({ setActiveTab, onNavigateToReport, onSetCurrentReport }) {
  const recentThreats = [
    {
      id: 'REP-TS-510382',
      name: 'SMS Notification: Urgent KYC Update',
      modality: 'Text',
      prediction: 'SCAM',
      risk: 'CRITICAL',
      trustScore: 8,
      confidence: '98.4%',
      engine: 'TrustShield-ScamGuard-NLP-v2',
      time: '18 mins ago'
    },
    {
      id: 'REP-TS-738192',
      name: 'Video_2.mp4 (Face Swap Artifacts)',
      modality: 'Video',
      prediction: 'FAKE',
      risk: 'LOW',
      trustScore: 42,
      confidence: '57.8%',
      engine: 'EfficientNet-B0-Vision',
      time: '1 hour ago'
    },
    {
      id: 'REP-TS-849201',
      name: 'Image_1.jpeg (Portrait Photo)',
      modality: 'Image',
      prediction: 'REAL',
      risk: 'MEDIUM',
      trustScore: 63,
      confidence: '63.0%',
      engine: 'EfficientNet-B0-Vision',
      time: '2 hours ago'
    },
    {
      id: 'REP-TS-629401',
      name: 'Audio_3.wav (Customer Voice Verification)',
      modality: 'Audio',
      prediction: 'REAL',
      risk: 'LOW',
      trustScore: 96,
      confidence: '95.8%',
      engine: 'Wav2Vec2-Forensic',
      time: '3 hours ago'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-card-hover border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multimodal Neural Forensic Shield Active</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">
            Comprehensive AI Scam & Deepfake Protection
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Real-time supervised machine learning models inspecting linguistic manipulation, high-frequency image boundary errors, facial temporal jitter, and vocal spectral jitter.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('media')}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-sky-500/25 transition-all active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Launch Live Media Scan</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <MessageSquareWarning className="w-4 h-4 text-rose-400" />
              <span>Inspect Suspicious Text</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Media Scans</span>
            <Activity className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">1,482</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
            <span>↑ 18.4%</span>
            <span className="text-slate-400 font-normal">from last cycle</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Threat Interception</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">99.4%</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">328 Scams Neutralized</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Average Trust Score</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">78.2 / 100</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">Healthy Enterprise Fleet</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Supervised Model Latency</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">0.84s</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">GPU/CPU Edge Accelerated</div>
        </div>

      </div>

      {/* Modality Scanner Launchers */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <button
          onClick={() => setActiveTab('media')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:border-sky-300 hover:shadow-card-hover transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ImageIcon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Image Deepfake Scan</h3>
          <p className="text-[11px] text-slate-400 mt-1">ELA, FFT frequency ratios & PRNU sensor forensics.</p>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:border-indigo-300 hover:shadow-card-hover transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 ml-0.5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Video Frame Forensics</h3>
          <p className="text-[11px] text-slate-400 mt-1">Face-swap boundary jitter & temporal blink analysis.</p>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:border-amber-300 hover:shadow-card-hover transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Volume2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Audio Voice Clone Scan</h3>
          <p className="text-[11px] text-slate-400 mt-1">MFCC vocal jitter, harmonic distortion & neural vocoders.</p>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:border-rose-300 hover:shadow-card-hover transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <MessageSquareWarning className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Text Phishing Detector</h3>
          <p className="text-[11px] text-slate-400 mt-1">Linguistic urgency, spoofed domains & banking fraud.</p>
        </button>

      </div>

      {/* Recent Forensic Activity Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Forensic Investigations</h3>
            <p className="text-xs text-slate-400">Inspected multi-spectral media and communication logs</p>
          </div>
          <button
            onClick={() => setActiveTab('audit')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View All Logs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Subject Target</th>
                <th className="py-3 px-4">Modality</th>
                <th className="py-3 px-4">Prediction</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Trust Score</th>
                <th className="py-3 px-4">Analysis Engine</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {recentThreats.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-[10px]">{item.id}</span>
                    <span className="truncate max-w-[200px]">{item.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {item.modality}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      item.prediction === 'REAL' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {item.prediction}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.confidence}</td>
                  <td className="py-3 px-4 font-mono font-extrabold text-slate-900">{item.trustScore}/100</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px] truncate max-w-[150px]">{item.engine}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        if (onSetCurrentReport) {
                          onSetCurrentReport({
                            id: item.id,
                            timestamp: '2026-08-25 21:15:32',
                            modality: item.modality,
                            target: item.name,
                            prediction: item.prediction,
                            verdict: item.prediction === 'REAL' ? 'Authentic Content' : 'Deepfake / Scam Detected',
                            confidence: parseFloat(item.confidence),
                            trust_score: item.trustScore,
                            risk_level: item.risk,
                            fake_signal_strength: 100 - item.trustScore,
                            analysis_engine: item.engine,
                            processing_time: '0.84s',
                            operator: 'JD Enterprise Admin',
                            forensic_features: [
                              { name: 'Feature Alignment', value: item.prediction === 'REAL' ? 'Smooth' : 'Artificial', status: item.prediction === 'REAL' ? 'Smooth' : 'Artificial' },
                              { name: 'Sensor Noise', value: item.prediction === 'REAL' ? 'Organic' : 'Inconsistent', status: item.prediction === 'REAL' ? 'Consistent' : 'Inconsistent' }
                            ]
                          });
                        }
                        setActiveTab('reports');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      <span>PDF Report</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
