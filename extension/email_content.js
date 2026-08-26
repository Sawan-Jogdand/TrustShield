console.log("🛡️ TrustShield Email content.js loaded");
// TrustShield Email Content Script (Gmail & Outlook Web)

// ─── Configuration ────────────────────────────────────────────────────────────

// Selectors for email body containers in Gmail and Outlook
const EMAIL_CONTAINER_SELECTORS = [
  // Gmail selectors
  'div.adn.ads',                   // Expanded Gmail message container
  'div.ii.gt',                     // Gmail message body wrapper
  'div[data-message-id]',          // Gmail message container by ID
  'div.a3s.aiL',                   // Gmail message text container
  // Outlook Web selectors
  'div[aria-label="Message body"]', // Outlook reading pane message body
  'div.ReadingPaneContainer',       // Outlook Reading Pane wrapper
  'div.ItemPartBody',               // Outlook message body container
  'div._Item_MessageBody'           // Outlook alternate message body
];

// Selectors for email subject lines
const SUBJECT_SELECTORS = [
  'h2.hP',                         // Gmail subject header
  'div[role="main"] h2',           // Gmail main view subject
  'div[role="heading"][aria-level="1"]', // Outlook subject heading
  'span.allowTextSelection[title]' // Outlook header title
];

// Deduplication stamps
const STAMP   = 'data-ts-email-scanned';
const FLAGGED = 'data-ts-email-flagged';
const ID_ATTR = 'data-ts-email-id';

// ─── State ────────────────────────────────────────────────────────────────────

const processed = new WeakSet();
const pendingMap = new Map();
let tsEmailIdCounter = 0;
let debounceTimer = null;

// ─── Text extraction ──────────────────────────────────────────────────────────

function getEmailSubject(root) {
  for (const sel of SUBJECT_SELECTORS) {
    const el = document.querySelector(sel) || (root && root.querySelector && root.querySelector(sel));
    if (el && el.textContent && el.textContent.trim()) {
      return el.textContent.trim();
    }
  }
  return '';
}

function extractEmailText(containerEl) {
  // Try to find the inner text container or fall back to container text
  const bodyEl =
    containerEl.querySelector('.a3s.aiL') ||
    containerEl.querySelector('.ii.gt div') ||
    containerEl.querySelector('div[aria-label="Message body"]') ||
    containerEl;

  if (!bodyEl) return null;

  const rawText = bodyEl.innerText || bodyEl.textContent || '';
  const cleanBody = rawText.trim();

  if (!cleanBody || cleanBody.length < 15) return null; // Skip empty/trivial fragments

  const subject = getEmailSubject(containerEl);
  if (subject) {
    return `Subject: ${subject}\n\n${cleanBody}`;
  }
  return cleanBody;
}

// ─── Visual Scam Treatment for Emails ─────────────────────────────────────────

function applyEmailScamStyling(containerEl, r) {
  if (containerEl.hasAttribute(FLAGGED)) return;
  if (containerEl.querySelector('.ts-email-warning-banner')) return;

  containerEl.setAttribute(FLAGGED, '1');
  containerEl.classList.add('ts-flagged-email');

  const riskClass = (r.risk_level || 'HIGH').toLowerCase();

  const banner = document.createElement('div');
  banner.className = 'ts-warning-badge ts-email-warning-banner';

  const featureRows = (r.forensic_features || []).map(f => {
    const isThreat = ['Artificial','Suspicious','Inconsistent','Warped'].includes(f.status);
    return `<div class="ts-tooltip-row">
      <span class="ts-dot" style="background:${isThreat ? '#ef4444' : '#10b981'}"></span>
      <span class="ts-feat-name">${f.name}:</span>
      <span class="ts-feat-val">${f.value}</span>
    </div>`;
  }).join('');

  banner.innerHTML = `
    <div class="ts-banner-content">
      <span class="ts-badge-icon">⚠️</span>
      <div class="ts-banner-text-group">
        <span class="ts-badge-text">TrustShield: Suspicious Email Threat Detected</span>
        <span class="ts-banner-sub">Risk: ${r.risk_level || 'HIGH'} • Confidence: ${r.confidence || 0}% • Category: ${r.category || 'Phishing / Fraud'}</span>
      </div>
    </div>
    <div class="ts-tooltip">
      <div class="ts-tooltip-header">
        <span class="ts-tooltip-title">🛡 Email Scam Detected</span>
        <span class="ts-tooltip-conf">${r.confidence || 0}% match</span>
      </div>
      <div class="ts-tooltip-row">
        <span class="ts-tooltip-label">Risk Level:</span>
        <span class="ts-tooltip-value ts-risk-${riskClass}">${r.risk_level || 'HIGH'}</span>
      </div>
      <div class="ts-tooltip-row">
        <span class="ts-tooltip-label">Scam Category:</span>
        <span class="ts-tooltip-value">${r.category || 'Phishing / Fraud'}</span>
      </div>
      <div class="ts-tooltip-row">
        <span class="ts-tooltip-label">Trust Score:</span>
        <span class="ts-tooltip-value">${r.trust_score || 0}/100</span>
      </div>
      ${featureRows
        ? `<div class="ts-tooltip-features">${featureRows}</div>`
        : ''}
    </div>`;

  // Prepend the warning banner at the top of the email content
  if (containerEl.firstChild) {
    containerEl.insertBefore(banner, containerEl.firstChild);
  } else {
    containerEl.appendChild(banner);
  }

  console.log(
    `%c🛡️ TrustShield flagged Email [ts-id=${containerEl.getAttribute(ID_ATTR)}]`,
    'color:#ef4444;font-weight:bold',
    `| Risk: ${r.risk_level} | Confidence: ${r.confidence}% | Category: ${r.category}`
  );
}

// ─── Scanner ──────────────────────────────────────────────────────────────────

function scanEmails(root) {
  root = root || document;

  const queued = new Set();
  EMAIL_CONTAINER_SELECTORS.forEach(selector => {
    root.querySelectorAll(selector).forEach(el => {
      // Find the most appropriate message parent card
      const target = el.closest('div.adn.ads') || el.closest('div.ii.gt') || el;
      if (queued.has(target))         return;
      if (processed.has(target))      return;
      if (target.hasAttribute(STAMP)) return;
      queued.add(target);
    });
  });

  queued.forEach(emailEl => {
    emailEl.setAttribute(STAMP, '1');
    processed.add(emailEl);

    const text = extractEmailText(emailEl);
    if (!text) return;

    const tsId = String(++tsEmailIdCounter);
    emailEl.setAttribute(ID_ATTR, tsId);
    pendingMap.set(tsId, emailEl);

    console.log(`🛡️ TrustShield detected email [ts-id=${tsId}]:`, text.slice(0, 120) + '...');
    console.log(`🛡️ TrustShield → API request [ts-id=${tsId}]:`, { text: text.slice(0, 120) + '...', source: 'email' });

    chrome.runtime.sendMessage({ action: 'analyzeText', text, source: 'email', tsId }, (msg) => {
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

      const targetEl =
        document.querySelector(`[${ID_ATTR}="${tsId}"]`) ||
        emailEl;

      if (r.prediction === 'SCAM') {
        applyEmailScamStyling(targetEl, r);
      }
    });
  });
}

// ─── Debounce & Observer ──────────────────────────────────────────────────────

function scheduleEmailScan() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => scanEmails(), 350);
}

function initEmailObserver() {
  console.log('🛡️ TrustShield Email observer attached to document.body');

  const observer = new MutationObserver(mutations => {
    let hasAdditions = false;
    for (const m of mutations) {
      if (m.addedNodes.length > 0) {
        hasAdditions = true;
        break;
      }
    }
    if (hasAdditions) {
      scheduleEmailScan();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  scanEmails();
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEmailObserver);
} else {
  initEmailObserver();
}
