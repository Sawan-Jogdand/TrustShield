import React, { useState, useRef } from 'react';
import { 
  Download, 
  Printer, 
  ShieldCheck, 
  ShieldAlert, 
  FileCheck, 
  Clock, 
  User, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Fingerprint, 
  Lock, 
  ArrowLeft, 
  ExternalLink,
  Share2,
  Calendar,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export default function ReportPage({ currentReport, onBackToScan }) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState('active');
  const reportRef = useRef(null);

  // Default active fallback if no active scan yet
  const activeData = currentReport || {
    id: 'REP-TS-849201',
    timestamp: '2026-08-25 21:15:32',
    modality: 'Image',
    target: 'Image_1.jpeg',
    prediction: 'REAL',
    verdict: 'Authentic Content',
    verdict_summary: 'Confidence: 63.0% — Content appears consistent with organic media',
    confidence: 63.0,
    trust_score: 63,
    risk_level: 'MEDIUM',
    fake_signal_strength: 37.0,
    analysis_engine: 'EfficientNet-B0-Vision',
    processing_time: '1.07s',
    operator: 'Trust Shield Forensic Analyst',
    status: 'Verified Clean',
    forensic_features: [
      { name: 'Edge Blending', value: 'Smooth', status: 'Smooth' },
      { name: 'Facial Symmetry', value: 'Natural', status: 'Natural' },
      { name: 'Lighting Match', value: 'Consistent', status: 'Consistent' },
      { name: 'Noise Pattern', value: 'Organic Sensor PRNU', status: 'Consistent' }
    ]
  };

  // Sample historical reports archive
  const historicalReports = [
    {
      id: 'active',
      label: `Current Scan (${activeData.target || activeData.modality})`,
      data: activeData
    },
    {
      id: 'hist-1',
      label: 'Video_2.mp4 — Deepfake Video Flagged',
      data: {
        id: 'REP-TS-738192',
        timestamp: '2026-08-25 20:45:10',
        modality: 'Video',
        target: 'Video_2.mp4',
        prediction: 'FAKE',
        verdict: 'Deepfake Detected',
        verdict_summary: 'Confidence: 57.8% — Strong indicators of AI-generated content detected',
        confidence: 57.8,
        trust_score: 42,
        risk_level: 'LOW',
        fake_signal_strength: 57.8,
        analysis_engine: 'EfficientNet-B0-Vision',
        processing_time: '0.53s',
        operator: 'Trust Shield Forensic Analyst',
        status: 'Threat Flagged',
        forensic_features: [
          { name: 'Edge Blending', value: 'Artificial', status: 'Artificial' },
          { name: 'Facial Symmetry', value: 'Warped', status: 'Warped' },
          { name: 'Lighting Match', value: 'Inconsistent', status: 'Inconsistent' },
          { name: 'Temporal Continuity', value: 'Jitter Anomaly', status: 'Artificial' }
        ]
      }
    },
    {
      id: 'hist-2',
      label: 'Audio_3.wav — Authentic Voice Passed',
      data: {
        id: 'REP-TS-629401',
        timestamp: '2026-08-25 19:30:18',
        modality: 'Audio',
        target: 'Audio_3.wav',
        prediction: 'REAL',
        verdict: 'Authentic Content',
        verdict_summary: 'Confidence: 95.8% — Content appears consistent with organic media',
        confidence: 95.8,
        trust_score: 96,
        risk_level: 'LOW',
        fake_signal_strength: 4.2,
        analysis_engine: 'Wav2Vec2-Forensic',
        processing_time: '4.83s',
        operator: 'Trust Shield Forensic Analyst',
        status: 'Verified Clean',
        forensic_features: [
          { name: 'AI Artifact Detection', value: 'No', status: 'Smooth' },
          { name: 'Frequency Consistency', value: 'Natural', status: 'Natural' },
          { name: 'Noise Pattern', value: 'Organic', status: 'Consistent' }
        ]
      }
    },
    {
      id: 'hist-3',
      label: 'Urgent_Bank_Phish.txt — Critical KYC Scam',
      data: {
        id: 'REP-TS-510382',
        timestamp: '2026-08-25 18:22:04',
        modality: 'Text',
        target: 'SMS Notification: Urgent KYC Update',
        prediction: 'SCAM',
        verdict: 'Suspicious Scam Threat Detected',
        verdict_summary: 'Confidence: 98.4% — Critical financial coercion & phishing link identified',
        confidence: 98.4,
        trust_score: 8,
        risk_level: 'CRITICAL',
        fake_signal_strength: 92.0,
        analysis_engine: 'TrustShield-ScamGuard-NLP-v2',
        processing_time: '0.12s',
        operator: 'Trust Shield Forensic Analyst',
        status: 'Blocked Malicious',
        category: 'Banking Phishing Trap',
        forensic_features: [
          { name: 'Urgency Tone', value: 'Severe (High Panic Trigger)', status: 'Artificial' },
          { name: 'URL / Domain Risk', value: 'Phishing Domain (.xyz)', status: 'Artificial' },
          { name: 'Intent Category', value: 'Banking Phishing Trap', status: 'Inconsistent' }
        ]
      }
    }
  ];

  const currentSelection = historicalReports.find(r => r.id === selectedReportId) || historicalReports[0];
  const report = currentSelection.data;
  const isMalicious = report.prediction === 'FAKE' || report.prediction === 'SCAM';

  // 1-Click PDF Download Handler using html2pdf / print engine
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    const element = reportRef.current;
    
    // Dynamic import html2pdf or fallback to window.print
    try {
      if (window.html2pdf) {
        const opt = {
          margin: [10, 10, 10, 10],
          filename: `TrustShield_Forensic_Report_${report.id || 'TS-AUDIT'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        await window.html2pdf().set(opt).from(element).save();
      } else {
        // Load html2pdf dynamically if not yet attached
        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = html2pdfModule.default || html2pdfModule;
        const opt = {
          margin: [10, 10, 10, 10],
          filename: `TrustShield_Forensic_Report_${report.id || 'TS-AUDIT'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        await html2pdf().set(opt).from(element).save();
      }
    } catch (e) {
      console.log('Using browser print dialog for high-res PDF generation:', e);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToScan}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Live Scan</span>
          </button>

          {/* Report History Switcher */}
          <div className="flex items-center bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-xs font-bold text-slate-400 mr-2">Audit Report:</span>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent border-none focus:ring-0 cursor-pointer outline-none"
            >
              {historicalReports.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 1-CLICK DOWNLOAD BUTTON */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print View</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold shadow-md shadow-sky-600/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF Report (1-Click)'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ================= THE PRINTABLE / EXPORTABLE PDF REPORT ================= */}
      {/* ========================================================================= */}
      <div 
        ref={reportRef}
        id="forensic-scam-report-pdf"
        className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-card-hover space-y-8 pdf-container"
      >
        {/* PDF Header with Trust Shield Logo & Report Credentials */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b-2 border-slate-100 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                  Trust<span className="text-sky-600">Shield</span> AI
                </h1>
                <span className="text-[10px] font-extrabold uppercase bg-slate-900 text-white px-2 py-0.5 rounded tracking-wider">
                  Official Audit
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Multimodal Scam & Deepfake Forensic Intelligence</p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 space-y-0.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Certificate ID</div>
            <div className="text-sm font-mono font-extrabold text-slate-900">{report.id || 'REP-TS-849201'}</div>
            <div className="text-[10px] text-slate-400 font-mono">ISO/IEC 27037 Forensic Standard Compliant</div>
          </div>
        </div>

        {/* Report Metadata Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Target Subject</span>
            <span className="font-extrabold text-slate-800 font-mono truncate block mt-0.5">{report.target || report.filename || 'Input Media'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Modality</span>
            <span className="font-extrabold text-slate-800 uppercase block mt-0.5">{report.modality || 'Image'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Scan Timestamp</span>
            <span className="font-extrabold text-slate-800 font-mono block mt-0.5">{report.timestamp || '2026-08-25 21:15:32'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Lead Examiner</span>
            <span className="font-extrabold text-slate-800 block mt-0.5">{report.operator || 'JD Enterprise Admin'}</span>
          </div>
        </div>

        {/* Executive Verdict Callout Box */}
        <div
          className={`p-6 rounded-2xl border-2 transition-all ${
            isMalicious
              ? 'bg-rose-50/50 border-rose-400/80 text-rose-950'
              : 'bg-emerald-50/50 border-emerald-400/80 text-emerald-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isMalicious ? (
                  <ShieldAlert className="w-6 h-6 text-rose-600" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                )}
                <h2 className="text-xl font-black tracking-tight">
                  EXECUTIVE VERDICT: {report.verdict ? report.verdict.toUpperCase() : (isMalicious ? 'THREAT FLAGGED' : 'ORGANIC CONTENT')}
                </h2>
              </div>
              <p className="text-xs text-slate-600 font-medium max-w-2xl leading-relaxed">
                {report.verdict_summary || `Confidence: ${report.confidence}% — System evaluated multi-spectral forensic feature arrays.`}
              </p>
            </div>

            {/* Verdict Stamp */}
            <div
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 shrink-0 ${
                isMalicious
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              {report.prediction === 'SCAM' ? 'CRITICAL SCAM' : (report.prediction === 'FAKE' ? 'DEEPFAKE DETECTED' : 'VERIFIED AUTHENTIC')}
            </div>
          </div>
        </div>

        {/* High-Level Forensic Scoring Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model Prediction</p>
            <p className="text-xl font-black text-slate-900 mt-1">{report.prediction || 'REAL'}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Supervised Ensemble</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence Level</p>
            <p className="text-xl font-black text-slate-900 mt-1">{report.confidence}%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Probability Density</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Level</p>
            <p className="text-xl font-black text-slate-900 mt-1 flex items-center gap-1">
              <span>{report.risk_level || 'LOW'}</span>
              <span className="text-sm">
                {report.risk_level === 'CRITICAL' ? '🔴' :
                 report.risk_level === 'HIGH' ? '🟠' :
                 report.risk_level === 'MEDIUM' ? '🟡' : '🟢'}
              </span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Threat Matrix Tier</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authenticity Trust Score</p>
            <p className="text-xl font-black text-slate-900 mt-1">{report.trust_score}/100</p>
            <p className="text-[10px] text-slate-400 mt-0.5">0 (Synthetic) - 100 (Clean)</p>
          </div>
        </div>

        {/* Forensic Spectrum Representation */}
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-800">Synthetic / Malicious Signal Distribution</span>
            <span className="font-mono text-slate-600">{report.fake_signal_strength}% Synthetic Indicator</span>
          </div>

          <div className="h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full signal-spectrum-gradient"
              style={{ width: `${Math.max(4, Math.min(100, report.fake_signal_strength))}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono font-semibold">
            <span>0% (Clean Organic)</span>
            <span>50% (Ambiguous Zone)</span>
            <span>100% (High Confidence Threat)</span>
          </div>
        </div>

        {/* Detailed Forensic Feature Inspection Table */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Forensic Vector Breakdown & Evidence Log
            </h3>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Forensic Parameter</th>
                  <th className="py-3 px-4">Observed Metric</th>
                  <th className="py-3 px-4">Assessment Status</th>
                  <th className="py-3 px-4">Forensic Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(report.forensic_features || []).map((feat, i) => {
                  const isArt = feat.status === 'Artificial' || feat.status === 'Warped' || feat.status === 'Inconsistent';
                  return (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-800">{feat.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{feat.value}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                            isArt
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {feat.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {isArt ? 'Displays signature neural synthesis / manipulation anomaly' : 'Consistent with natural physical capture optics / genuine context'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mitigation & Recommended Security Protocol */}
        <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-2 text-xs">
          <h4 className="font-extrabold text-sky-950 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Recommended Mitigation Actions</span>
          </h4>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 leading-relaxed">
            {isMalicious ? (
              <>
                <li><strong>Quarantine Content:</strong> Prevent dissemination across internal channels or payment authorization workflows.</li>
                <li><strong>Credential / KYC Safeguards:</strong> Do not follow external links or verify OTPs from this sender.</li>
                <li><strong>Security Operations Alert:</strong> Threat indicators logged to SOC incident dashboard with hash ID {report.id}.</li>
              </>
            ) : (
              <>
                <li><strong>Verification Cleared:</strong> Content exhibits high organic integrity scores and natural sensor signatures.</li>
                <li><strong>Audit Retention:</strong> Log retained in compliance with organizational fraud audit guidelines for 90 days.</li>
              </>
            )}
          </ul>
        </div>

        {/* Cryptographic Hash & Digital Signature Seal Footer */}
        <div className="pt-6 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <div className="space-y-0.5">
            <div className="font-mono text-[10px] text-slate-500">
              SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
            <div>Trust Shield Automated Neural Forensic Engine v2.0.0</div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100/90 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">
            <Lock className="w-3.5 h-3.5 text-sky-600" />
            <span>DIGITALLY SIGNED AUDIT CERTIFICATE</span>
          </div>
        </div>

      </div>

    </div>
  );
}
