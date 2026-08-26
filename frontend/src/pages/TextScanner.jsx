import React, { useState, useRef } from 'react';
import { 
  MessageSquareWarning, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  FileText, 
  UploadCloud,
  Trash2,
  ChevronRight
} from 'lucide-react';

export default function TextScanner({ onNavigateToReport, onSetCurrentReport }) {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setInputText(event.target.result);
      setAnalysisResult(null);
    };
    reader.readAsText(file);
  };

  const handleScanText = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/analyze/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
        if (onSetCurrentReport) onSetCurrentReport(data);
      }
    } catch (e) {
      console.log('Error analyzing text:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!inputText) return;
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <MessageSquareWarning className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Communication & Text Scam Scanner</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervised NLP vectorizer analyzing linguistic coercion, fraudulent URLs, and financial deception.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept=".txt,.csv,.doc,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
          >
            <UploadCloud className="w-4 h-4 text-slate-500" />
            <span>Upload Text File</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Input vs Forensic Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Input Text Box */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
            {inputText && (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => { setInputText(''); setAnalysisResult(null); }}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 ml-2"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            <textarea
              value={inputText}
              onChange={(e) => { setInputText(e.target.value); setAnalysisResult(null); }}
              rows={9}
              placeholder="Type or paste suspicious SMS, email body, Telegram message, or URL here to inspect..."
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            ></textarea>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{inputText.length} characters</span>
              <span>FastAPI Supervised NLP Ready</span>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleScanText}
              disabled={isAnalyzing || !inputText.trim()}
              className={`w-full py-3.5 rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 ${
                !inputText.trim() 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Classifying Tokens & Threat Vectors...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run NLP Scam Detection</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Forensic Verdict & Metrics */}
        <div className="lg:col-span-6 space-y-4">
          {analysisResult ? (
            <>
              {/* Verdict Banner */}
              <div
                className={`bg-white rounded-2xl p-6 border-t-4 shadow-card space-y-3 ${
                  analysisResult.prediction === 'SCAM'
                    ? 'border-t-rose-500 border-slate-200/80'
                    : 'border-t-emerald-500 border-slate-200/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900">
                        {analysisResult.verdict}
                      </h3>
                      <span>{analysisResult.prediction === 'SCAM' ? '🚨' : '✅'}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {analysisResult.verdict_summary}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                      analysisResult.prediction === 'SCAM'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {analysisResult.prediction}
                  </span>
                </div>

                {/* Score Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Confidence</span>
                    <span className="text-base font-black text-slate-900">{analysisResult.confidence}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Risk Level</span>
                    <span className="text-base font-black text-slate-900">{analysisResult.risk_level}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Trust Score</span>
                    <span className="text-base font-black text-slate-900">{analysisResult.trust_score}/100</span>
                  </div>
                </div>

                {/* Threat Spectrum */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-500">Scam Signal Strength:</span>
                    <span className="font-extrabold text-slate-800">{analysisResult.fake_signal_strength}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className="h-full rounded-full signal-spectrum-gradient"
                      style={{ width: `${Math.max(5, analysisResult.fake_signal_strength)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Forensic Tags */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-2">Detected Indicators:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(analysisResult.forensic_features || []).map((f, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 text-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">{f.name}</span>
                        <span className="font-bold text-slate-800 mt-0.5 block">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 1-Click PDF Report Action */}
                <button
                  onClick={() => {
                    if (onSetCurrentReport) onSetCurrentReport(analysisResult);
                    if (onNavigateToReport) onNavigateToReport(analysisResult);
                  }}
                  className="w-full mt-3 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>Export Official Text Scam PDF Report</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-10 border border-slate-200/80 shadow-card text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Ready for Text Analysis</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Paste message contents on the left or upload a .txt file, then click "Run NLP Scam Detection".
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
