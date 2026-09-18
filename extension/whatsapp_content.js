console.log("🛡️ TrustShield WhatsApp content.js loaded");
// TrustShield WhatsApp Web Content Script

// ─── Configuration ────────────────────────────────────────────────────────────

// Selectors for message bubble containers in the open active chat (#main)
const BUBBLE_SELECTORS = [
  '#main div[data-pre-plain-text]',
  '#main div[role="row"]',
  '#main div.message-in',
  '#main div.message-out',
  '#main div[data-id]',
  '#main div.copyable-text',
  'div[data-pre-plain-text]',
  'div[role="row"]'
];

// Selectors for chat list items in the sidebar (#pane-side)
const CHAT_ITEM_SELECTORS = [
  '#pane-side div[role="listitem"]',
  '#pane-side div[role="row"]',
  '#pane-side div[data-testid="cell-frame-container"]',
  '#pane-side div[tabindex="-1"]',
  '#pane-side div._ak8l',
  '#pane-side div._ak72',
  'div[data-testid="chat-list"] div[role="listitem"]',
  'div[aria-label="Chat list"] div[role="listitem"]',
  'div[aria-label="Chat list"] div[role="row"]'
];

// Selector for readable text inside a bubble
const TEXT_SELECTOR = 'span.selectable-text, .copyable-text span';

// Attribute stamped when bubble is scanned in #main
const STAMP = 'data-ts-scanned';
// Attribute stamped when bubble is confirmed SCAM in #main
const FLAGGED = 'data-ts-flagged';
// Attribute holding unique internal request ID
const ID_ATTR = 'data-ts-id';
// Attribute stamped on chat list item for last processed preview text
const CHAT_LAST_TEXT_ATTR = 'data-ts-chat-text';

// ─── State & Cache ────────────────────────────────────────────────────────────

// In-memory cache for fast lookups (text -> API result) across virtualization
const localCache = new Map();

// Set for processed message bubble elements
const processedBubbles = new WeakSet();

// Map<tsId (string) → Element>
const pendingMap = new Map();

// Counter for unique bubble IDs
let tsIdCounter = 0;

// Debounce handle
let debounceTimer = null;

// ─── Text extraction for message bubbles (#main) ──────────────────────────────

function extractBubbleText(bubbleEl) {
  const spans = bubbleEl.querySelectorAll(TEXT_SELECTOR);
  if (spans.length) {
    const text = Array.from(spans).map(s => s.textContent).join('').trim();
    if (text) return text;
  }
  const copyable = bubbleEl.querySelector('.copyable-text');
  if (copyable && copyable.textContent) {
    const text = copyable.textContent.trim();
    if (text) return text;
  }
  return null;
}

// ─── Active Chat (#main) Visual Styling ───────────────────────────────────────

function applyScamStyling(bubbleEl, r) {
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
    const isThreat = ['Artificial', 'Suspicious', 'Inconsistent', 'Warped', 'High', 'Critical'].includes(f.status);
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
      ${featureRows ? `<div class="ts-tooltip-features">${featureRows}</div>` : ''}
    </div>`;

  anchor.appendChild(badge);

  console.log(
    `%c🛡️ TrustShield flagged WhatsApp bubble [ts-id=${bubbleEl.getAttribute(ID_ATTR) || 'N/A'}]`,
    'color:#ef4444;font-weight:bold',
    `| Risk: ${r.risk_level} | Confidence: ${r.confidence}% | Category: ${r.category}`
  );
}

// ─── Chat List Preview Extraction & Styling (#pane-side) ─────────────────────

function findChatPreviewElement(chatItemEl) {
  // Check known preview selectors in WhatsApp Web
  const candidate = chatItemEl.querySelector(
    'div[data-testid="last-msg-status"], ' +
    'span[data-testid="last-msg"], ' +
    'span._ao3e, ' +
    'span.matched-text, ' +
    'div._ak8k, ' +
    'div._ak8j, ' +
    'div._ak8o, ' +
    'div._ak8q'
  );

  if (candidate) {
    const textSpan = candidate.querySelector('span[dir="ltr"], span[dir="auto"], span') || candidate;
    return { target: candidate, textSpan, text: textSpan.textContent.trim() };
  }

  // Fallback: examine all spans inside the chat item, find the message preview line
  const spans = Array.from(chatItemEl.querySelectorAll('span'));
  const validSpans = spans.filter(s => {
    const t = s.textContent.trim();
    if (!t) return false;
    // Exclude unread count badge
    if (/^\d{1,4}$/.test(t) && s.closest('[data-testid="unread-count"], [class*="unread"]')) return false;
    // Exclude timestamps
    if (/^(\d{1,2}:\d{2}(\s*(am|pm|AM|PM))?|yesterday|today|\d{1,2}\/\d{1,2}\/\d{2,4})$/i.test(t)) return false;
    // Exclude title/contact name if it's the top heading
    if (s.getAttribute('title') && s.closest('div[role="gridcell"] > div:first-child, div:first-child')) {
      const parent = s.parentElement;
      if (parent && parent.querySelector('span[dir="auto"]') === s && s.closest('div._ak8q, div[data-testid="cell-frame-title"]')) {
        return false;
      }
    }
    return true;
  });

  if (validSpans.length > 0) {
    // Pick the longest text span (which is typically the message preview)
    let best = validSpans[0];
    for (const s of validSpans) {
      if (s.textContent.trim().length > best.textContent.trim().length) {
        best = s;
      }
    }
    const container = best.closest('div._ak8l, div[role="gridcell"] > div:last-child, div') || best;
    return { target: best, textSpan: best, text: best.textContent.trim() };
  }

  return null;
}

function applyChatListScamStyle(targetEl, result) {
  if (!targetEl) return;
  targetEl.classList.add('ts-chatlist-scam-preview');
  targetEl.setAttribute(
    'title',
    `🛡️ TrustShield: Suspicious Message Detected (${result.category || 'Scam Attempt'} - Risk: ${result.risk_level || 'HIGH'})`
  );
}

function removeChatListScamStyle(targetEl) {
  if (!targetEl) return;
  targetEl.classList.remove('ts-chatlist-scam-preview');
  targetEl.removeAttribute('title');
}

function scanChatList(root) {
  root = root || document;
  const chatItems = new Set();

  CHAT_ITEM_SELECTORS.forEach(sel => {
    root.querySelectorAll(sel).forEach(el => chatItems.add(el));
  });

  chatItems.forEach(chatItemEl => {
    const previewInfo = findChatPreviewElement(chatItemEl);
    if (!previewInfo || !previewInfo.text) return;

    let cleanText = previewInfo.text;
    // Remove checkmarks or sender prefix like "You: " or "✓✓" for analysis
    cleanText = cleanText.replace(/^[✓✔\s]+/, '').replace(/^You:\s*/i, '').trim();
    if (!cleanText || cleanText.length < 3) return;

    const lastText = chatItemEl.getAttribute(CHAT_LAST_TEXT_ATTR);
    if (lastText === cleanText) {
      // Already analyzed this exact text, verify styling is applied if cached as SCAM
      const cached = localCache.get(cleanText);
      if (cached && cached.prediction === 'SCAM') {
        applyChatListScamStyle(previewInfo.target, cached);
      }
      return;
    }

    chatItemEl.setAttribute(CHAT_LAST_TEXT_ATTR, cleanText);

    // Check local cache
    if (localCache.has(cleanText)) {
      const cached = localCache.get(cleanText);
      if (cached.prediction === 'SCAM') {
        applyChatListScamStyle(previewInfo.target, cached);
      } else {
        removeChatListScamStyle(previewInfo.target);
      }
      return;
    }

    // Call background worker to analyze
    const tsId = String(++tsIdCounter);
    chrome.runtime.sendMessage({ action: 'analyzeText', text: cleanText, source: 'whatsapp', tsId }, msg => {
      if (chrome.runtime.lastError || !msg || !msg.ok) return;
      const r = msg.result;
      localCache.set(cleanText, r);

      // Re-find current target in case DOM rerendered
      const currentPreview = findChatPreviewElement(chatItemEl);
      const target = currentPreview ? currentPreview.target : previewInfo.target;

      if (r.prediction === 'SCAM') {
        applyChatListScamStyle(target, r);
        console.log(
          `%c🛡️ TrustShield flagged WhatsApp chat list preview`,
          'color:#ef4444;font-weight:bold',
          `| Text: "${cleanText.slice(0, 40)}..." | Risk: ${r.risk_level} | Category: ${r.category}`
        );
      } else {
        removeChatListScamStyle(target);
      }
    });
  });
}

// ─── Active Chat Messages Scanner (#main) ────────────────────────────────────

function scanActiveChatMessages(root) {
  root = root || document;
  const mainPane = document.querySelector('#main') || root.querySelector('#main') || root;
  if (!mainPane) return;

  const queued = new Set();
  BUBBLE_SELECTORS.forEach(selector => {
    mainPane.querySelectorAll(selector).forEach(el => {
      if (queued.has(el)) return;
      if (processedBubbles.has(el)) return;
      if (el.hasAttribute(STAMP)) return;
      queued.add(el);
    });
  });

  queued.forEach(bubbleEl => {
    bubbleEl.setAttribute(STAMP, '1');
    processedBubbles.add(bubbleEl);

    const text = extractBubbleText(bubbleEl);
    if (!text) return;

    // Check local cache first
    if (localCache.has(text)) {
      const cached = localCache.get(text);
      if (cached.prediction === 'SCAM') {
        applyScamStyling(bubbleEl, cached);
      }
      return;
    }

    const tsId = String(++tsIdCounter);
    bubbleEl.setAttribute(ID_ATTR, tsId);
    pendingMap.set(tsId, bubbleEl);

    console.log(`🛡️ TrustShield detected message [ts-id=${tsId}]:`, text);

    chrome.runtime.sendMessage({ action: 'analyzeText', text, source: 'whatsapp', tsId }, msg => {
      pendingMap.delete(tsId);

      if (chrome.runtime.lastError) {
        console.error(`🛡️ TrustShield runtime error [ts-id=${tsId}]:`, chrome.runtime.lastError.message);
        return;
      }
      if (!msg || !msg.ok) return;

      const r = msg.result;
      localCache.set(text, r);

      const targetEl = document.querySelector(`[${ID_ATTR}="${tsId}"]`) || bubbleEl;
      if (r.prediction === 'SCAM') {
        applyScamStyling(targetEl, r);
      }
    });
  });
}

// ─── Master Scanner & Scheduler ───────────────────────────────────────────────

function scanAll() {
  // 1. Scan the chat list previews (left sidebar)
  scanChatList(document);

  // 2. Scan active chat bubbles if a chat is currently open (#main)
  scanActiveChatMessages(document);
}

function scheduleScan() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => scanAll(), 200);
}

// ─── Observers Setup ─────────────────────────────────────────────────────────

let globalObserver = null;

function setupObservers() {
  if (globalObserver) return;

  globalObserver = new MutationObserver(mutations => {
    let shouldScan = false;
    for (const m of mutations) {
      if (m.addedNodes.length > 0) {
        shouldScan = true;
        break;
      }
    }
    if (shouldScan) {
      scheduleScan();
    }
  });

  globalObserver.observe(document.body, { childList: true, subtree: true });
  console.log('🛡️ TrustShield global observer active on WhatsApp Web');

  // Initial immediate scan
  scheduleScan();
}

// Chat-switch detection
let lastHref = location.href;
setInterval(() => {
  if (location.href !== lastHref) {
    lastHref = location.href;
    console.log('🛡️ TrustShield: URL/chat change detected — rescanning…');
    scheduleScan();
  }
}, 500);

// ─── Entry point ──────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupObservers);
} else {
  setupObservers();
}
