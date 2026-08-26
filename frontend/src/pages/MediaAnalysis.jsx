import React, { useState, useRef } from 'react';
import {
  FolderOpen,
  Sparkles,
  Play,
  Pause,
  Volume2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  UploadCloud,
  FileCheck,
  Activity,
  Sliders,
  ChevronRight,
  Download,
  Search,
  Trash2,
  File,
  Image as ImageIcon,
  Video,
  Music
} from 'lucide-react';

export default function MediaAnalysis({ onNavigateToReport, onSetCurrentReport }) {
  const [activeModality, setActiveModality] = useState('IMG'); // IMG, VID, AUD, TEXT
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  // Switch Modality Tab
  const handleModalityTab = (mod) => {
    setActiveModality(mod);
    // Reset file if changing modality type to avoid mismatch
    if (uploadedFile) {
      const isImg = uploadedFile.type.startsWith('image/');
      const isVid = uploadedFile.type.startsWith('video/');
      const isAud = uploadedFile.type.startsWith('audio/');
      if ((mod === 'IMG' && !isImg) || (mod === 'VID' && !isVid) || (mod === 'AUD' && !isAud)) {
        handleRemoveFile();
      }
    }
  };

  // Handle File Selection
  const handleFileChange = (file) => {
    if (!file) return;
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setFilePreviewUrl(url);
    setActiveAnalysis(null);

    // Auto-detect modality tab
    if (file.type.startsWith('image/')) {
      setActiveModality('IMG');
    } else if (file.type.startsWith('video/')) {
      setActiveModality('VID');
    } else if (file.type.startsWith('audio/')) {
      setActiveModality('AUD');
    } else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      setActiveModality('TXT');
    } else if (file.type.startsWith('text/')) {
      setActiveModality('TEXT');
      const reader = new FileReader();
      reader.onload = (e) => setInputText(e.target.result);
      reader.readAsText(file);
    }
  };

  const handleRemoveFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setUploadedFile(null);
    setFilePreviewUrl(null);
    setInputText('');
    setActiveAnalysis(null);
    setIsPlayingAudio(false);
    setIsPlayingVideo(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Run Forensic Neural Analysis
  const handleRunAnalysis = async () => {
    if (!uploadedFile && (!inputText.trim() || activeModality !== 'TEXT')) return;
    setIsScanning(true);
    setScanProgress(0);

    const progressTimer = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + 18;
      });
    }, 120);

    try {
      if (activeModality === 'TEXT') {
        const textToAnalyze = inputText.trim();
        const res = await fetch('/api/analyze/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToAnalyze })
        });
        if (res.ok) {
          const data = await res.json();
          setActiveAnalysis(data);
          if (onSetCurrentReport) onSetCurrentReport(data);
        }
      } else {
        const formData = new FormData();
        formData.append('modality', activeModality);
        formData.append('filename', uploadedFile ? uploadedFile.name : `file_${Date.now()}`);
        if (uploadedFile) {
          formData.append('file', uploadedFile);
        }
        const res = await fetch('/api/analyze/media', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          setActiveAnalysis(data);
          if (onSetCurrentReport) onSetCurrentReport(data);
        }
      }
    } catch (e) {
      console.log('Error during neural scan:', e);
    } finally {
      setTimeout(() => {
        setScanProgress(100);
        setIsScanning(false);
      }, 500);
    }
  };

  const isFakeOrScam = activeAnalysis && (activeAnalysis.prediction === 'FAKE' || activeAnalysis.prediction === 'SCAM');

  const getAcceptedExtensions = () => {
    switch (activeModality) {
      case 'IMG': return 'image/jpeg,image/png,image/webp,image/bmp';
      case 'VID': return 'video/mp4,video/webm,video/ogg,video/quicktime';
      case 'AUD': return 'audio/wav,audio/mp3,audio/mpeg,audio/ogg';
      case 'TXT': return 'text/plain,.txt,.csv';
      default: return '*/*';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">

      {/* Main Grid: Left Upload/Preview Pane vs Right Forensic Analysis Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ================= LEFT PANE: UPLOAD & PREVIEW (5 Cols) ================= */}
        <div className="lg:col-span-5 space-y-5">

          {/* Upload Media Card (Matching Reference Image Layout) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">

            {/* Top Card Header with Tabs */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                <h3 className="font-bold text-slate-900 text-base">Upload Media</h3>
              </div>

              {/* Modality Tabs (IMG / VID / AUD / TXT) */}
              <div className="flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/60">
                {['IMG', 'VID', 'AUD', 'TXT'].map((mod) => (
                  <button
                    key={mod}
                    onClick={() => handleModalityTab(mod)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${activeModality === mod
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                  >
                    {mod}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Box: Upload Dropzone vs Active Media Preview */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-850 flex items-center justify-center min-h-[260px] max-h-[320px]">

              {/* 1. NO FILE UPLOADED STATE: UPLOAD DROPZONE */}
              {!uploadedFile && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-[270px] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all border-2 border-dashed ${isDragOver
                    ? 'border-sky-400 bg-sky-950/40 text-sky-200'
                    : 'border-slate-750 hover:border-sky-500/60 bg-slate-900 hover:bg-slate-850 text-slate-300'
                    }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3 border border-sky-500/20 shadow-inner">
                    {activeModality === 'IMG' && <ImageIcon className="w-7 h-7" />}
                    {activeModality === 'VID' && <Video className="w-7 h-7" />}
                    {activeModality === 'AUD' && <Music className="w-7 h-7" />}
                    {activeModality === 'TXT' && <FileText className="w-7 h-7" />}
                  </div>

                  <p className="text-sm font-bold text-white mb-1">
                    Upload {activeModality === 'IMG' ? 'Image' : activeModality === 'VID' ? 'Video' : activeModality === 'AUD' ? 'Audio' : 'Text File'}
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mb-3">
                    Drag and drop file here or click the upload button to select from your device.
                  </p>

                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload {activeModality} File</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    className="hidden"
                    accept={getAcceptedExtensions()}
                  />
                </div>
              )}

              {/* 2. IMAGE PREVIEW */}
              {uploadedFile && activeModality === 'IMG' && filePreviewUrl && (
                <div className="relative w-full h-[270px] flex items-center justify-center bg-slate-900">
                  <img
                    src={filePreviewUrl}
                    alt="Uploaded Media Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-sky-500/10 border-b-2 border-sky-400 animate-scan pointer-events-none"></div>
                  )}
                </div>
              )}

              {/* 3. VIDEO PREVIEW */}
              {uploadedFile && activeModality === 'VID' && filePreviewUrl && (
                <div className="relative w-full h-[270px] bg-slate-900 flex flex-col items-center justify-center">
                  <video
                    src={filePreviewUrl}
                    controls
                    className="max-h-full max-w-full object-contain"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-sky-500/10 border-b-2 border-sky-400 animate-scan pointer-events-none"></div>
                  )}
                </div>
              )}

              {/* 4. AUDIO PREVIEW */}
              {uploadedFile && activeModality === 'AUD' && filePreviewUrl && (
                <div className="w-full h-[270px] bg-slate-900 p-6 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-sky-400" />
                      <span className="font-mono text-slate-200">Audio Waveform Stream</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400">{uploadedFile.name}</span>
                  </div>

                  {/* Synthetic Audio Waveform Graphic */}
                  <div className="py-4 flex items-center justify-center gap-1 h-20">
                    {[12, 28, 45, 80, 55, 95, 40, 20, 65, 90, 110, 75, 45, 85, 95, 60, 30, 70, 85, 40, 15, 35, 60, 25].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-300 ${isPlayingAudio ? 'bg-sky-400 animate-pulse' : 'bg-emerald-400/80'
                          }`}
                        style={{ height: `${isPlayingAudio ? Math.min(90, h + (i % 3) * 15) : h}%` }}
                      ></div>
                    ))}
                  </div>

                  {/* Native Audio Player */}
                  <audio
                    src={filePreviewUrl}
                    controls
                    onPlay={() => setIsPlayingAudio(true)}
                    onPause={() => setIsPlayingAudio(false)}
                    className="w-full h-10 accent-sky-500"
                  />
                </div>
              )}

              {/* 5. TEXT INPUT / PREVIEW */}
              {activeModality === 'TEXT' && (
                <div className="w-full h-[270px] bg-slate-900 p-4 flex flex-col justify-between text-white font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-sky-400" />
                      <span>Text / Message Content</span>
                    </div>
                    <span className="text-[10px] text-sky-400 font-sans">Type or Paste Text Below</span>
                  </div>



                  <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                    <span>Length: {inputText.length} characters</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sky-400 hover:text-sky-300 font-sans font-bold flex items-center gap-1"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload .txt file</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Target Filename & Replace Trigger */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-semibold text-slate-700 font-mono truncate max-w-[220px]">
                {uploadedFile ? uploadedFile.name : (inputText ? 'Text Input Buffer' : 'No File Selected')}
              </span>

              <div className="flex items-center gap-3">
                {(uploadedFile || inputText) && (
                  <button
                    onClick={handleRemoveFile}
                    className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}

                <label className="text-sky-600 hover:text-sky-700 font-bold cursor-pointer hover:underline flex items-center gap-1">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{uploadedFile ? 'Replace' : 'Upload File'}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    className="hidden"
                    accept={getAcceptedExtensions()}
                  />
                </label>
              </div>
            </div>

            {/* "Initialize Neural Analysis" Button (Matching Reference Design) */}
            <button
              onClick={handleRunAnalysis}
              disabled={isScanning || (!uploadedFile && !inputText.trim())}
              className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 ${isScanning
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : (!uploadedFile && !inputText.trim())
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-[#DDE5F0] hover:bg-[#CFDBE9] text-slate-700 hover:text-slate-900 border border-slate-300/60 active:scale-[0.99]'
                }`}
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                  <span>Scanning Forensic Vectors ({scanProgress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>Scan For Scam/Deepfake</span>
                </>
              )}
            </button>
          </div>

          {/* System Metrics Card (Matching Reference Images 1, 2, 3) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <Activity className="w-4.5 h-4.5 text-sky-500" />
              <h3 className="font-bold text-slate-900 text-sm">System Metrics</h3>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Processing Time</p>
                <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                  {activeAnalysis ? activeAnalysis.processing_time : '--'}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Analysis Engine</p>
                <p className="text-sm font-extrabold text-slate-800 mt-0.5 truncate">
                  {activeAnalysis
                    ? activeAnalysis.analysis_engine
                    : (activeModality === 'AUD' ? 'Wav2Vec2-Forensic' : activeModality === 'TEXT' ? 'TrustShield-ScamGuard-NLP-v2' : 'EfficientNet-B0-Vision')}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Model Confidence</p>
                <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                  {activeAnalysis ? `${activeAnalysis.confidence}%` : '--'}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trust Score</p>
                <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                  {activeAnalysis ? `${activeAnalysis.trust_score}/100` : '--'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT PANE: FORENSIC VERDICT & METRICS (7 Cols) ================= */}
        <div className="lg:col-span-7 space-y-5">

          {activeAnalysis ? (
            <>
              {/* 1. Big Verdict Banner (Matching Reference Design) */}
              <div
                className={`bg-white rounded-2xl p-7 border transition-all duration-300 shadow-card ${isFakeOrScam
                  ? 'border-t-4 border-t-rose-500 border-slate-200/80 shadow-verdict-fake'
                  : 'border-t-4 border-t-emerald-500 border-slate-200/80 shadow-verdict-real'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {activeAnalysis.verdict}
                      </h2>
                      {isFakeOrScam ? (
                        <span className="text-2xl">⚠️</span>
                      ) : (
                        <span className="text-2xl">✅</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">
                      {activeAnalysis.verdict_summary}
                    </p>
                  </div>

                  {/* Quick Report Link */}
                  <button
                    onClick={() => {
                      if (onSetCurrentReport) onSetCurrentReport(activeAnalysis);
                      if (onNavigateToReport) onNavigateToReport(activeAnalysis);
                    }}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors border border-sky-200/80 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF Report</span>
                  </button>
                </div>
              </div>

              {/* 2. Key Metrics Grid: Prediction, Confidence, Risk Level, Trust Score */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">

                {/* Prediction */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prediction</p>
                  <div className="text-lg font-black mt-1 text-slate-900 font-sans tracking-tight">
                    {activeAnalysis.prediction}
                  </div>
                </div>

                {/* Confidence */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence</p>
                  <div className="text-lg font-black mt-1 text-slate-900 font-sans tracking-tight">
                    {activeAnalysis.confidence}%
                  </div>
                </div>

                {/* Risk Level */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Level</p>
                  <div className="flex items-center gap-1.5 text-lg font-black mt-1 text-slate-900 font-sans tracking-tight">
                    <span>{activeAnalysis.risk_level}</span>
                    <span>
                      {activeAnalysis.risk_level === 'CRITICAL' ? '🔴' :
                        activeAnalysis.risk_level === 'HIGH' ? '🟠' :
                          activeAnalysis.risk_level === 'MEDIUM' ? '🟡' : '🟢'}
                    </span>
                  </div>
                </div>

                {/* Trust Score */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trust Score</p>
                  <div className="text-lg font-black mt-1 text-slate-900 font-sans tracking-tight">
                    {activeAnalysis.trust_score}
                  </div>
                </div>
              </div>

              {/* 3. Fake Signal Strength Section */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📊</span>
                    <h3 className="font-bold text-slate-900 text-sm">Fake Signal Strength</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600">
                    {activeAnalysis.fake_signal_strength}% Synthetic / Scam Indicator
                  </span>
                </div>

                {/* Spectrum Bar */}
                <div className="space-y-2">
                  <div className="relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/70">
                    <div
                      className="h-full rounded-full signal-spectrum-gradient transition-all duration-700"
                      style={{ width: `${Math.max(4, Math.min(100, activeAnalysis.fake_signal_strength))}%` }}
                    ></div>
                  </div>

                  {/* Labels matching reference */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 font-mono">
                    <span>0% (Organic)</span>
                    <span className="font-extrabold text-slate-800 text-xs">{activeAnalysis.fake_signal_strength}%</span>
                    <span>100% (Synthetic)</span>
                  </div>
                </div>
              </div>

              {/* 4. Forensic Feature Analysis Chips Grid */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                  <Search className="w-4.5 h-4.5 text-sky-500" />
                  <h3 className="font-bold text-slate-900 text-sm">Forensic Feature Analysis</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(activeAnalysis.forensic_features || []).map((feat, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-slate-600 truncate pr-2">{feat.name}</span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-md text-sky-700 bg-sky-50 border border-sky-100 shrink-0">
                        {feat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. 1-Click Action to Open Full PDF Report */}
              <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md shadow-sky-700/10">
                <div>
                  <h4 className="font-bold text-sm text-white">Generate Official Forensic Scam Audit Report</h4>
                  <p className="text-xs text-sky-100 mt-0.5">
                    Export complete cryptographic hash, evidence breakdown, and supervised ML confidence in 1 click.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onSetCurrentReport) onSetCurrentReport(activeAnalysis);
                    if (onNavigateToReport) onNavigateToReport(activeAnalysis);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-sky-50 text-sky-800 font-extrabold text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 shrink-0"
                >
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>View Report & Export PDF</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            /* Empty State Waiting for Upload */
            <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-card text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center border border-sky-100 shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="font-bold text-slate-800 text-base">Awaiting Neural Forensic Scan</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload an image, video, audio file, or enter text on the left, then click <strong>"Initialize Neural Analysis"</strong> to run supervised machine learning scam detection.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
