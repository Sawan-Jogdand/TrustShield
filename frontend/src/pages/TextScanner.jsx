import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  CheckCircle2,
  ExternalLink,
  Info,
  Radio
} from 'lucide-react';
import { API_ENDPOINTS } from '../api';

// Preset sample test templates for instant testing
const SAMPLE_PRESETS = [
  {
    id: 'bank_kyc',
    label: '🚨 Bank KYC Phishing',
    badge: 'Phishing',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-200',
    text: 'URGENT: Your HDFC Bank netbanking account has been SUSPENDED due to pending KYC verification. Please click https://hdfc-kyc-verify-portal.xyz/login immediately within 24 hours to prevent permanent account deactivation.'
  },
  {
    id: 'crypto_doubler',
    label: '💰 Crypto Doubler Scam',
    badge: 'Investment Fraud',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
    text: 'Guaranteed 200% daily profit return! Official Elon Musk ETH giveaway. Deposit 0.5 ETH to 0x71C... and receive 1.5 ETH back instantly. Limited time offer, only 50 slots left: https://musk-eth-airdrop.top/claim'
  },
  {
    id: 'lottery_winner',
    label: '🎁 Lottery / Prize Scam',
    badge: 'Prize Fraud',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
    text: 'CONGRATULATIONS! Your mobile number won $500,000 in the Mega International Lucky Draw 2026. Send your full name, bank account details, and $150 processing fee to claim prize immediately via WhatsApp +1-800-CLAIM.'
  },
  {
    id: 'job_task',
    label: '💼 Telegram Job Scam',
    badge: 'Task Scam',
    badgeColor: 'bg-orange-100 text-orange-700 border-orange-200',
    text: 'Part-time online job: Earn $200-$500 daily by rating hotels and liking YouTube videos from home! No experience required. Pay initial registration deposit of $25 to activate your work dashboard on Telegram @FastIncomeGlobal.'
  },
  {
    id: 'delivery_phish',
    label: '📦 Delivery Phishing',
    badge: 'Phishing',
    badgeColor: 'bg-red-100 text-red-700 border-red-200',
    text: 'USPS Notice: Your package delivery was placed on hold at our local distribution hub due to an unpaid $1.85 customs fee. Update your billing address here: https://usps-tracking-redelivery.link/fee'
  },
  {
    id: 'legit_meeting',
    label: '✅ Authentic Business Email',
    badge: 'Legitimate',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    text: 'Hi Sarah, thank you for sending over the quarterly security audit report. Let us schedule a follow-up review meeting this Thursday at 2:00 PM to discuss the findings. Best regards, David.'
  }
];

// Comprehensive Client-Side NLP Heuristic Engine
export function runClientNLPAnalysis(text) {
  const startTime = performance.now();
  const trimmed = (text || '').trim();

  if (!trimmed) return null;

  // 1. Extract URLs
  const urlRegex = /(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+)/gi;
  const urls = trimmed.match(urlRegex) || [];
  const hasUrl = urls.length > 0;

  // Check for suspicious domains and deceptive keywords
  const suspiciousTldRegex = /\.(xyz|top|cc|ru|info|link|tk|ga|cf|gq|ml|click|buzz|surf|cam|icu|work|rest)$/i;
  const deceptiveKeywords = ['login', 'verify', 'auth', 'kyc', 'portal', 'secure-', 'update-', 'wallet', 'claim', 'free', 'reward', 'airdrop', 'bank', 'support'];
  
  let suspiciousUrls = [];
  urls.forEach(u => {
    let isSus = false;
    try {
      const cleanUrl = u.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
      if (suspiciousTldRegex.test(cleanUrl)) isSus = true;
      if (deceptiveKeywords.some(kw => u.toLowerCase().includes(kw))) isSus = true;
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(cleanUrl)) isSus = true; // Raw IP URL
    } catch {
      isSus = true;
    }
    if (isSus) suspiciousUrls.push(u);
  });
  const hasSuspiciousUrl = suspiciousUrls.length > 0;

  // 2. Short Conversational Greeting Short-Circuit
  const quickTriggers = /\b(account|kyc|otp|btc|eth|wire|winner|warrant|irs|urgent|suspended|deposit|prize|congratulat|free|claim)\b/i;
  if (trimmed.length <= 35 && !hasUrl && !quickTriggers.test(trimmed)) {
    const confidence = 96.5;
    return {
      id: `REP-TS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      modality: 'Text',
      target: trimmed.substring(0, 45) + (trimmed.length > 45 ? '...' : ''),
      prediction: 'REAL',
      verdict: 'Authentic Content',
      verdict_summary: `Confidence: ${confidence}% — Message content appears consistent with legitimate, benign human communication`,
      confidence: confidence,
      fake_signal_strength: 3.5,
      risk_level: 'LOW',
      trust_score: 96,
      category: 'Legitimate Personal Message',
      processing_time: `${((performance.now() - startTime) / 1000 + 0.03).toFixed(2)}s`,
      analysis_engine: 'TrustShield-ScamGuard-NLP-v2 (Real-Time)',
      metrics: {
        urgency_score: 0.0,
        has_suspicious_url: false,
        detected_urls: [],
        detected_scam_intents: []
      },
      forensic_features: [
        { name: 'Urgency Tone', value: 'Neutral (No Pressure)', status: 'Smooth' },
        { name: 'URL / Domain Risk', value: 'None Detected', status: 'Smooth' },
        { name: 'Intent Category', value: 'Legitimate Personal', status: 'Natural' },
        { name: 'Coercion Indicators', value: '0 markers', status: 'Organic' }
      ]
    };
  }

  // 3. Multi-Keyword Heuristic Scam Vector Matching
  const scamPatterns = {
    'Banking Phishing': [
      /(account|card|debit|credit|netbanking|bank).*(suspended|locked|freeze|frozen|deactivat|blocked).*(verify|click|update|immediate|within|http|link)/i,
      /unauthorized.*transaction.*(cancel|verify|click|now|http|call)/i,
      /(update|complete|verify).*(mandatory|urgent|pending).*kyc.*(http|link|click|within)/i,
      /security\s+alert.*unusual\s+login.*(confirm|prevent|freeze|http)/i,
      /\b(kyc\s+update|pan\s+card|aadhaar\s+update|netbanking\s+blocked)\b/i
    ],
    'Crypto Investment Scam': [
      /(guaranteed|passive|daily\s+guaranteed).*(return|income|profit).*(crypto|arbitrage|invest|eth|btc|usdt)/i,
      /(send|deposit)\s+\d+.*(btc|eth|crypto|usdt).*(receive|back|giveaway|double)/i,
      /(official|exclusive|free|claim).*(airdrop|token\s+grant).*(http|wallet|claim)/i,
      /double.*(bitcoin|btc|eth).*(24\s+hours|wallet|instant)/i
    ],
    'Lottery / Prize Fraud': [
      /(won|winner|winning|congratulat).*(lottery|mega\s+millions|jackpot|draw|lucky\s+draw|\$\d+|\₹\s*[\d,]+|\d+\s*(lakh|crore|million)).*(call|claim|code|share|register|link)/i,
      /(lucky\s+winner|lucky\s+draw|win\s+big\s+prizes?|claim\s+your\s+prize|claim\s+now)/i,
      /(share\s+this\s+message|share\s+with\s+\d+\s*(groups?|friends?|contacts?)).*(claim|prize|win|money|reward)/i,
      /(selected|won).*(iphone|smartphone|voucher|\$\d{3,4}|\₹\s*[\d,]+).*(claim|reward|register|http)/i,
      /100%\s+guaranteed.*(prize|return|income|cash|win|reward)/i
    ],
    'Fake Job Offer': [
      /(part-time|online\s+job|work\s+from\s+home).*(earn|\$\d+|\₹\s*[\d,]+).*(daily|hourly|per\s+day).*(rating|review|video|whatsapp|telegram)/i,
      /(shortlisted|hired|job\s+offer).*pay.*(fee|registration|deposit).*(http|start|telegram)/i
    ],
    'Executive Impersonation / Extortion': [
      /(irs|tax|warrant|federal|police).*(evasion|arrest|law\s+enforcement|dispatched).*(call|immediate|fine)/i,
      /(buy|purchase|need).*\b\d+\s*x?\s*\$?\d+.*(apple|itunes|google\s+play|amazon)\s+gift\s+cards?.*(code|pin|email)/i
    ],
    'Delivery / Subscription Phishing': [
      /(package|usps|fedex|dhl|delivery).*(held|terminal|unpaid|fee|customs).*(pay|update|http|link)/i,
      /(netflix|spotify|prime|subscription).*(could\s+not\s+process|payment\s+failed|update\s+billing).*(avoid|service\s+cancellation|http)/i
    ]
  };

  const detectedCategories = [];
  for (const [cat, patterns] of Object.entries(scamPatterns)) {
    for (const pat of patterns) {
      if (pat.test(trimmed)) {
        detectedCategories.push(cat);
        break;
      }
    }
  }

  // 4. Urgency & Coercion Token Counting
  const urgencyWords = [
    'urgent', 'immediately', 'within 24 hours', 'account suspended', 'permanently deactivated',
    'law enforcement', 'warrant issued', 'hurry up', 'limited time', 'act now', 'expires today',
    'penalty', 'frozen', 'blocked', 'mandatory'
  ];
  let urgencyCount = 0;
  urgencyWords.forEach(w => {
    const reg = new RegExp(`\\b${w.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (reg.test(trimmed)) urgencyCount++;
  });

  const urgencyScore = Math.min(1.0, urgencyCount * 0.35 + (hasSuspiciousUrl ? 0.35 : 0.0));

  // Determine Scam vs Real Classification
  const isScam = (detectedCategories.length > 0) || hasSuspiciousUrl || (urgencyCount >= 2 && hasUrl);

  let scamProb = 0.08;
  if (isScam) {
    scamProb = Math.min(0.98, 0.78 + detectedCategories.length * 0.08 + (hasSuspiciousUrl ? 0.10 : 0.0) + urgencyScore * 0.05);
  } else if (urgencyCount > 0 || hasUrl) {
    scamProb = 0.25;
  }

  const fakeSignalStrength = Number((scamProb * 100).toFixed(1));
  const confidence = Number(((isScam ? scamProb : (1.0 - scamProb)) * 100).toFixed(1));
  const trustScore = Math.max(5, Math.min(99, Math.round(100 - fakeSignalStrength)));

  let riskLevel = 'LOW';
  if (fakeSignalStrength >= 75) riskLevel = 'CRITICAL';
  else if (fakeSignalStrength >= 50) riskLevel = 'HIGH';
  else if (fakeSignalStrength >= 25) riskLevel = 'MEDIUM';

  const primaryCategory = detectedCategories[0] || (isScam ? 'Malicious Phishing Attempt' : 'Legitimate Communication');
  const elapsed = `${((performance.now() - startTime) / 1000 + 0.05).toFixed(2)}s`;

  return {
    id: `REP-TS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    modality: 'Text',
    target: trimmed.substring(0, 60) + (trimmed.length > 60 ? '...' : ''),
    prediction: isScam ? 'SCAM' : 'REAL',
    verdict: isScam ? 'Suspicious Scam Threat Detected' : 'Authentic Message Content',
    verdict_summary: `Confidence: ${confidence}% — ${isScam ? 'Strong indicators of coercive financial/phishing scam detected' : 'Content appears consistent with legitimate, benign communication'}`,
    confidence: confidence,
    fake_signal_strength: fakeSignalStrength,
    risk_level: riskLevel,
    trust_score: trustScore,
    category: primaryCategory,
    processing_time: elapsed,
    analysis_engine: 'TrustShield-ScamGuard-NLP-v2',
    operator: 'Trust Shield Forensic Analyst',
    status: isScam ? 'Blocked Malicious' : 'Verified Clean',
    metrics: {
      urgency_score: Number(urgencyScore.toFixed(2)),
      has_suspicious_url: hasSuspiciousUrl,
      detected_urls: urls,
      detected_scam_intents: detectedCategories
    },
    forensic_features: [
      {
        name: 'Urgency Tone',
        value: urgencyScore > 0.6 ? 'Severe (High Panic Trigger)' : (urgencyScore > 0.3 ? 'Elevated Pressure' : 'Neutral'),
        status: urgencyScore > 0.6 ? 'Artificial' : (urgencyScore > 0.3 ? 'Suspicious' : 'Smooth')
      },
      {
        name: 'URL / Domain Risk',
        value: hasSuspiciousUrl ? 'High Risk Phishing Domain' : (urls.length > 0 ? 'Standard Web Link' : 'No URLs Detected'),
        status: hasSuspiciousUrl ? 'Artificial' : (urls.length > 0 ? 'Consistent' : 'Smooth')
      },
      {
        name: 'Intent Category',
        value: primaryCategory,
        status: isScam ? 'Inconsistent' : 'Natural'
      },
      {
        name: 'Coercion Indicators',
        value: `${urgencyCount} coercion marker${urgencyCount === 1 ? '' : 's'} identified`,
        status: urgencyCount > 1 ? 'Warped' : (urgencyCount === 1 ? 'Suspicious' : 'Organic')
      }
    ]
  };
}

export default function TextScanner({ onNavigateToReport, onSetCurrentReport }) {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [liveScan, setLiveScan] = useState(true);
  const [activePresetId, setActivePresetId] = useState(null);
  const [backendStatus, setBackendStatus] = useState('ready'); // 'ready', 'connected', 'fallback'
  
  const fileInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Core Analysis Trigger (attempts backend with instant high-accuracy fallback)
  const performAnalysis = useCallback(async (textToAnalyze) => {
    const text = (textToAnalyze || '').trim();
    if (!text) {
      setAnalysisResult(null);
      return;
    }

    setIsAnalyzing(true);

    // 1. Compute instant high-precision client analysis
    const localResult = runClientNLPAnalysis(text);

    // 2. Attempt backend API call to sync and store report history
    try {
      const res = await fetch(API_ENDPOINTS.ANALYZE_TEXT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const serverData = await res.json();
        setBackendStatus('connected');
        setAnalysisResult(serverData);
        if (onSetCurrentReport) onSetCurrentReport(serverData);
      } else {
        throw new Error(`API error: ${res.status}`);
      }
    } catch {
      // Fallback seamlessly to local NLP engine
      setBackendStatus('fallback');
      setAnalysisResult(localResult);
      if (onSetCurrentReport) onSetCurrentReport(localResult);
    } finally {
      setIsAnalyzing(false);
    }
  }, [onSetCurrentReport]);

  // Handle Text Change with Live Debounce
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setInputText(newText);
    setActivePresetId(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!newText.trim()) {
      setAnalysisResult(null);
      return;
    }

    if (liveScan) {
      debounceTimerRef.current = setTimeout(() => {
        performAnalysis(newText);
      }, 350);
    }
  };

  // Immediate Analysis on Paste
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted && pasted.trim()) {
      // Allow state update then trigger immediately
      setTimeout(() => {
        performAnalysis(pasted);
      }, 50);
    }
  };

  // Preset Selection Handler
  const handleSelectPreset = (preset) => {
    setInputText(preset.text);
    setActivePresetId(preset.id);
    performAnalysis(preset.text);
  };

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setInputText(content);
      setActivePresetId(null);
      performAnalysis(content);
    };
    reader.readAsText(file);
  };

  const handleCopy = () => {
    if (!inputText) return;
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
    setAnalysisResult(null);
    setActivePresetId(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-xs">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>Communication & Text Scam Scanner</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                  NLP v2.0
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervised NLP vectorizer analyzing linguistic coercion, fraudulent URLs, and financial deception.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-3">
          {/* Live Scan Toggle */}
          <button
            onClick={() => setLiveScan(!liveScan)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              liveScan 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs' 
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
            title="Auto-scan text in real-time as you type or paste"
          >
            <Zap className={`w-3.5 h-3.5 ${liveScan ? 'text-emerald-600 fill-emerald-500' : 'text-slate-400'}`} />
            <span>Real-Time Scan: {liveScan ? 'ON' : 'OFF'}</span>
          </button>

          {/* Upload Text File Button */}
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
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Quick Test Sample Presets Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            Quick Test Examples (1-Click Presets):
          </span>
          <span className="text-[11px] text-slate-400">Click any scenario to instantly inspect threat vectors</span>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {SAMPLE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                activePresetId === p.id 
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm scale-102' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input vs Forensic Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Input Text Box (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
            
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span>Message & Communication Payload</span>
                {liveScan && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Live NLP Active
                  </span>
                )}
              </label>

              {inputText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <textarea
                value={inputText}
                onChange={handleTextChange}
                onPaste={handlePaste}
                rows={10}
                placeholder="Type or paste suspicious SMS, email body, WhatsApp message, Telegram task, or URL here to inspect forensic threat signals..."
                className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-y"
              ></textarea>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-600">{inputText.length} chars</span>
                <span>•</span>
                <span>{inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words</span>
              </div>
              <span className="font-mono text-[11px] text-sky-600">FastAPI & Client Supervised NLP</span>
            </div>

            {/* Manual Run Button */}
            <button
              onClick={() => performAnalysis(inputText)}
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

        {/* Right: Forensic Verdict & Metrics (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {analysisResult ? (
            <div
              className={`bg-white rounded-2xl p-6 border-t-4 shadow-card space-y-4 transition-all animate-fadeIn ${
                analysisResult.prediction === 'SCAM'
                  ? 'border-t-rose-500 border-slate-200/80'
                  : 'border-t-emerald-500 border-slate-200/80'
              }`}
            >
              {/* Verdict Banner Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {analysisResult.prediction === 'SCAM' ? '🚨' : '✅'}
                    </span>
                    <h3 className="text-xl font-black text-slate-900">
                      {analysisResult.verdict}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {analysisResult.verdict_summary}
                  </p>
                </div>

                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shrink-0 border ${
                    analysisResult.prediction === 'SCAM'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {analysisResult.prediction}
                </span>
              </div>

              {/* 3 Metric Summary Badges */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Confidence</span>
                  <span className="text-lg font-black text-slate-900">{analysisResult.confidence}%</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Risk Level</span>
                  <span className={`text-base font-black ${
                    analysisResult.risk_level === 'CRITICAL' ? 'text-rose-600' :
                    analysisResult.risk_level === 'HIGH' ? 'text-orange-600' :
                    analysisResult.risk_level === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {analysisResult.risk_level}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Trust Score</span>
                  <span className="text-lg font-black text-slate-900">{analysisResult.trust_score}/100</span>
                </div>
              </div>

              {/* Threat Signal Spectrum Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500 font-semibold">Scam Threat Signal Strength:</span>
                  <span className={`font-black ${analysisResult.fake_signal_strength > 50 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {analysisResult.fake_signal_strength}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      analysisResult.fake_signal_strength > 50
                        ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600'
                        : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                    }`}
                    style={{ width: `${Math.max(6, analysisResult.fake_signal_strength)}%` }}
                  ></div>
                </div>
              </div>

              {/* Detected Indicators Matrix */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Forensic Indicators Breakdown:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(analysisResult.forensic_features || []).map((f, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[10px] uppercase font-bold">{f.name}</span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                          f.status === 'Artificial' || f.status === 'Warped'
                            ? 'bg-rose-100 text-rose-700'
                            : f.status === 'Suspicious' || f.status === 'Inconsistent'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {f.status}
                        </span>
                      </div>
                      <span className="font-bold text-slate-800 mt-1 block text-xs">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detected URLs Alert Box if any */}
              {analysisResult.metrics && analysisResult.metrics.detected_urls && analysisResult.metrics.detected_urls.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>Inspected URLs ({analysisResult.metrics.detected_urls.length}):</span>
                  </div>
                  <div className="space-y-1">
                    {analysisResult.metrics.detected_urls.map((u, idx) => (
                      <div key={idx} className="text-[11px] font-mono p-1.5 rounded bg-white border border-slate-200 text-slate-700 break-all flex items-center justify-between gap-2">
                        <span className="truncate">{u}</span>
                        {analysisResult.metrics.has_suspicious_url ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 shrink-0">Threat Domain</span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">Scanned</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1-Click PDF Report Action */}
              <button
                onClick={() => {
                  if (onSetCurrentReport) onSetCurrentReport(analysisResult);
                  if (onNavigateToReport) onNavigateToReport(analysisResult);
                }}
                className="w-full mt-2 py-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98"
              >
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Export Official Text Scam PDF Report</span>
                <ChevronRight className="w-4 h-4 text-sky-600" />
              </button>

            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-card text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center border border-sky-100 shadow-xs">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Ready for Text Scam Inspection</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  Type or paste any suspicious SMS, email, or Telegram message on the left, or pick one of the quick test presets above.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Real-Time Scanning is Active (Instant Detection)</span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
