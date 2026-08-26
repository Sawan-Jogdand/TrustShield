console.log("🛡️ TrustShield WhatsApp content.js loaded");
// TrustShield WhatsApp Web Content Script

// ─── Configuration ────────────────────────────────────────────────────────────

// Selectors for message bubble containers (priority order)
const BUBBLE_SELECTORS = [
  'div[data-pre-plain-text]',
  'div[role="row"]'
];

// Selector for readable text inside a bubble
const TEXT_SELECTOR = 'span.selectable-text';

// Attribute stamped when bubble is scanned (prevents duplicate processing)
const STAMP     = 'data-ts-scanned';
// Attribute stamped when bubble is confirmed SCAM (prevents duplicate badges)
const FLAGGED   = 'data-ts-flagged';
// Attribute holding this bubble's unique internal request ID
const ID_ATTR   = 'data-ts-id';

// ─── State ────────────────────────────────────────────────────────────────────

// WeakSet — GC can reclaim detached nodes automatically
const processed = new WeakSet();

// Map<tsId (string) → bubbleEl (Element)>
// Lets us find the exact DOM node when the async API response returns,
// even if multiple bubbles contain identical text.
const pendingMap = new Map();

// Monotonically incrementing counter for unique bubble IDs
let tsIdCounter = 0;

// Debounce handle
let debounceTimer = null;

// ─── Text extraction ──────────────────────────────────────────────────────────

function extractText(bubbleEl) {
  const spans = bubbleEl.querySelectorAll(TEXT_SELECTOR);
  if (!spans.length) return null;
  const text = Array.from(spans).map(s => s.textContent).join('').trim();
  return text || null;
}

// ─── Scam visual styling ──────────────────────────────────────────────────────

function applyScamStyling(bubbleEl, r) {
  // Guard: never add the badge twice to the same element
  if (bubbleEl.hasAttribute(FLAGGED)) return;
  if (bubbleEl.querySelector('.ts-warning-badge')) return;

  bubbleEl.setAttribute(FLAGGED, '1');
  bubbleEl.classList.add('ts-flagged-bubble');

  // Find the best anchor inside the bubble to attach the badge below the text
  const anchor =
    bubbleEl.querySelector('.copyable-text') ||
    bubbleEl.querySelector('[data-pre-plain-text]') ||
    bubbleEl;

  const riskClass = (r.risk_level || 'HIGH').toLowerCase();

  const badge = document.createElement('div');
  badge.className = 'ts-warning-badge';

  // Build the hover tooltip rows for forensic features
  const featureRows = (r.forensic_features || []).map(f => {
    const isThreat = ['Artificial','Suspicious','Inconsistent','Warped'].includes(f.status);
    return `<div class="ts-tooltip-row">
      <span class="ts-dot" style="background:${isThreat ? '#ef4444' : '#10b981'}"></span>
      <span class="ts-feat-name">${f.name}:</span>
      <span class="ts-feat-val">${f.value}</span>
    </div>`;
  }).join('');

  badge.innerHTML = `
    <span class="ts-badge-icon">⚠</span>
    <span class="ts-badge-text">TrustShield: Suspicious Message</span>
    <div class="ts-tooltip">
      <div class="ts-tooltip-header">
        <span class="ts-tooltip-title">🛡 Scam Detected</span>
        <span class="ts-tooltip-conf">${r.confidence || 0}% confidence</span>
      </div>
      <div class="ts-tooltip-row">
        <span class="ts-tooltip-label">Risk:</span>
        <span class="ts-tooltip-value ts-risk-${riskClass}">${r.risk_level || 'HIGH'}</span>
      </div>
      <div class="ts-tooltip-row">
        <span class="ts-tooltip-label">Category:</span>
        <span class="ts-tooltip-value">${r.category || 'Scam Attempt'}</span>
      </div>
      <div class="ts-tooltip-row">
        <span class="ts-tooltip-label">Trust Score:</span>
        <span class="ts-tooltip-value">${r.trust_score || 0}/100</span>
      </div>
      ${featureRows
        ? `<div class="ts-tooltip-features">${featureRows}</div>`
        : ''}
    </div>`;

  anchor.appendChild(badge);

  console.log(
    `%c🛡️ TrustShield flagged WhatsApp bubble [ts-id=${bubbleEl.getAttribute(ID_ATTR)}]`,
    'color:#ef4444;font-weight:bold',
    `| Risk: ${r.risk_level} | Confidence: ${r.confidence}% | Category: ${r.category}`
  );
}

// ─── Scanner ──────────────────────────────────────────────────────────────────

function scanMessages(root) {
  root = root || document;

  // Deduplicate nodes across overlapping selectors within this one scan pass
  const queued = new Set();
  BUBBLE_SELECTORS.forEach(selector => {
    root.querySelectorAll(selector).forEach(el => {
      if (queued.has(el))         return;
      if (processed.has(el))      return;
      if (el.hasAttribute(STAMP)) return;
      queued.add(el);
    });
  });

  queued.forEach(bubbleEl => {
    // Stamp immediately — re-entrant calls and future scans skip this node
    bubbleEl.setAttribute(STAMP, '1');
    processed.add(bubbleEl);

    const text = extractText(bubbleEl);
    if (!text) return; // image-only / sticker / system message

    // Assign a unique ID to this bubble so the async response can find it
    const tsId = String(++tsIdCounter);
    bubbleEl.setAttribute(ID_ATTR, tsId);
    pendingMap.set(tsId, bubbleEl);

    console.log(`🛡️ TrustShield detected message [ts-id=${tsId}]:`, text);
    console.log(`🛡️ TrustShield → API request [ts-id=${tsId}]:`, { text, source: 'whatsapp' });

    // Send to background service worker with the tsId and source
    chrome.runtime.sendMessage({ action: 'analyzeText', text, source: 'whatsapp', tsId }, (msg) => {
      // Always clean up the pending map entry
      pendingMap.delete(tsId);

      if (chrome.runtime.lastError) {
        console.error(`🛡️ TrustShield runtime error [ts-id=${tsId}]:`, chrome.runtime.lastError.message);
        return;
      }
      if (!msg) {
        console.warn(`🛡️ TrustShield: no response [ts-id=${tsId}]`);
        return;
      }
      if (!msg.ok) {
        console.warn(`🛡️ TrustShield API error [ts-id=${tsId}]:`, msg.error);
        return;
      }

      const r = msg.result;
      console.log(
        `🛡️ TrustShield ← API response [ts-id=${tsId}] | prediction: ${r.prediction} | risk: ${r.risk_level} | confidence: ${r.confidence}% | category: ${r.category}`,
        r
      );

      // Look up the exact element by tsId — works even with duplicate message text
      const targetEl =
        document.querySelector(`[${ID_ATTR}="${tsId}"]`) ||
        bubbleEl; // closure fallback

      if (r.prediction === 'SCAM') {
        applyScamStyling(targetEl, r);
      }
    });
  });
}

// ─── Debounced scan wrapper ───────────────────────────────────────────────────

function scheduleScan() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => scanMessages(), 300);
}

// ─── Two-phase observer ───────────────────────────────────────────────────────

let chatObserver = null;

function attachToChatPane(main) {
  if (chatObserver) return;

  chatObserver = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.addedNodes.length > 0) { scheduleScan(); return; }
    }
  });
  chatObserver.observe(main, { childList: true, subtree: true });
  console.log('🛡️ TrustShield observer attached to: #main');

  // Scan messages already visible when the chat first opens
  scanMessages(main);
}

function waitForChatPane() {
  const existingMain = document.querySelector('#main');
  if (existingMain) {
    attachToChatPane(existingMain);
    return;
  }
  console.log('🛡️ TrustShield: waiting for #main…');
  const bodyObserver = new MutationObserver(() => {
    const main = document.querySelector('#main');
    if (!main) return;
    bodyObserver.disconnect();
    attachToChatPane(main);
  });
  bodyObserver.observe(document.body, { childList: true, subtree: true });
}

// ─── Chat-switch detection ────────────────────────────────────────────────────
let lastHref = location.href;
new MutationObserver(() => {
  if (location.href === lastHref) return;
  lastHref = location.href;
  const main = document.querySelector('#main');
  if (!main) return;
  console.log('🛡️ TrustShield: chat switched — rescanning…');
  setTimeout(() => scanMessages(main), 500);
}).observe(document.body, { childList: true, subtree: true });

// ─── Entry point ──────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitForChatPane);
} else {
  waitForChatPane();
}
