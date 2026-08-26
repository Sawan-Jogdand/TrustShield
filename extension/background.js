// TrustShield — Unified Background Service Worker (Manifest V3)

const DEFAULT_API_URL = 'http://127.0.0.1:8000/api/analyze/text';

// ─── In-memory result cache ───────────────────────────────────────────────────
// Key: trimmed message text  |  Value: API response object
// Prevents repeat network calls for the exact same string across channels.
const MAX_CACHE = 500;
const responseCache = new Map();

function cacheSet(text, result) {
  if (responseCache.size >= MAX_CACHE) {
    // Evict oldest entry (Map preserves insertion order)
    responseCache.delete(responseCache.keys().next().value);
  }
  responseCache.set(text, result);
}

// ─── Stats helpers ────────────────────────────────────────────────────────────

async function bumpStats(isScam, report, source = 'whatsapp') {
  const normSource = source.toLowerCase().includes('email') ? 'email' : 'whatsapp';

  return new Promise(resolve => {
    chrome.storage.local.get([
      'scannedCount',
      'whatsappScanned',
      'emailScanned',
      'flaggedCount',
      'whatsappFlagged',
      'emailFlagged'
    ], data => {
      const update = {
        scannedCount: (data.scannedCount || 0) + 1,
        whatsappScanned: (data.whatsappScanned || 0) + (normSource === 'whatsapp' ? 1 : 0),
        emailScanned: (data.emailScanned || 0) + (normSource === 'email' ? 1 : 0)
      };

      if (isScam) {
        update.flaggedCount = (data.flaggedCount || 0) + 1;
        if (normSource === 'whatsapp') {
          update.whatsappFlagged = (data.whatsappFlagged || 0) + 1;
        } else {
          update.emailFlagged = (data.emailFlagged || 0) + 1;
        }

        update.lastScamReport = {
          text:       (report.input_preview || report.text || '').slice(0, 140),
          source:     normSource === 'email' ? 'Email' : 'WhatsApp',
          category:   report.category   || 'Scam Threat',
          risk_level: report.risk_level || 'HIGH',
          confidence: report.confidence || 0,
          timestamp:  new Date().toLocaleString()
        };
      }

      chrome.storage.local.set(update, resolve);
    });
  });
}

// ─── Core analysis function ───────────────────────────────────────────────────

async function analyzeText(text, source = 'whatsapp') {
  // 1. Return cached result immediately if available
  if (responseCache.has(text)) {
    return { ...responseCache.get(text), _cached: true };
  }

  // 2. Fetch the API URL from storage (user may have customised it in popup)
  const { apiUrl } = await new Promise(resolve =>
    chrome.storage.local.get(['apiUrl'], resolve)
  );
  const endpoint = (apiUrl || DEFAULT_API_URL).trim();

  const sourceLabel = source.toLowerCase().includes('email')
    ? 'Email Scanner Extension'
    : 'WhatsApp Web Extension';

  // 3. POST to FastAPI backend
  const response = await fetch(endpoint, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text:   text,
      source: sourceLabel
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  cacheSet(text, data);
  return data;
}

// ─── Message listener ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action !== 'analyzeText') return false;

  const text = (request.text || '').trim();
  const source = request.source || 'whatsapp';
  const tsId = request.tsId || '';

  if (!text) {
    sendResponse({ error: 'empty text', tsId });
    return true;
  }

  // Check whether scanning is enabled (default: true)
  chrome.storage.local.get(['isEnabled'], async ({ isEnabled }) => {
    if (isEnabled === false) {
      sendResponse({ error: 'TrustShield scanning is disabled', tsId });
      return;
    }

    try {
      const result = await analyzeText(text, source);
      await bumpStats(result.prediction === 'SCAM', result, source);
      sendResponse({ ok: true, result, tsId });
    } catch (err) {
      console.error(`[TrustShield BG] API error (${source}):`, err.message);
      sendResponse({ ok: false, error: err.message, tsId });
    }
  });

  return true; // keeps the message channel open for the async response
});
