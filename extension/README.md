# TrustShield Unified Scam Detection Chrome Extension (WhatsApp & Email)

A unified Chrome Manifest V3 Extension that intercepts and analyzes potential scams, phishing links, and fraudulent communications in real time across **WhatsApp Web** and **Webmail (Gmail & Outlook Web)** using the TrustShield AI Forensic Engine.

---

## Unified Architecture

```text
extension/
├── manifest.json        # Unified Manifest V3 declaring permissions & matches for WhatsApp + Webmail
├── background.js        # Shared Background Service Worker (API client, LRU caching, multi-channel stats)
├── whatsapp_content.js  # WhatsApp Web DOM scanner (two-phase observer, unique ID bubble mapping)
├── email_content.js     # Webmail DOM scanner (Gmail & Outlook subject/body extractor, banner injector)
├── content.js           # Shared WhatsApp/general content script fallback
├── content.css          # Shared visual styles (red borders, warning badges, email security banners, tooltips)
├── popup.html           # Unified Glassmorphic Dashboard UI
├── popup.css            # Popup stylesheet
├── popup.js             # Unified stats sync & settings controller
├── icon16.png           # 16x16 shield icon
├── icon48.png           # 48x48 shield icon
└── icon128.png          # 128x128 shield icon
```

---

## Key Features

1. **Unified Background & API Pipeline**:
   - Single communication pipeline routing both WhatsApp and Email texts to `POST /api/analyze/text`.
   - Shared result schema: `prediction`, `risk_level`, `confidence`, `category`, `trust_score`, `forensic_features`.
   - LRU cache prevents duplicate API calls across messages/emails.
2. **Channel-Specific Detectors**:
   - **WhatsApp Web (`whatsapp_content.js`)**: Real-time `MutationObserver`, unique message `data-ts-id` stamping, red bubble highlighting + inline warning badge.
   - **Webmail (`email_content.js`)**: Gmail & Outlook Web thread scanner, email subject + body parsing, red email container highlight + prominent top security warning banner.
3. **Interactive Forensic Tooltip**:
   - Hovering over any warning badge reveals risk level, match confidence, scam category, trust score, and forensic indicators.
4. **Combined Dashboard Popup**:
   - Live counters for **Total Scanned**, **WhatsApp Scanned**, **Emails Scanned**, and **Total Threats Blocked**.
   - Latest intercepted threat preview with channel source badges (`WhatsApp` vs `Email`).
   - Customizable API endpoint configuration.

---

## Installation & Setup

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** on (top-right switch).
3. Click **Load unpacked** (top-left).
4. Select the `extension/` folder:
   `c:\Users\HP\OneDrive\New folder\OneDrive\Documents\Projects\Trust Shield\extension`

---

## Testing Verification

### 1. Test WhatsApp Web Scam Detection:
- Open [WhatsApp Web](https://web.whatsapp.com) and open a chat.
- Send or receive:
  ```
  Urgent: Your bank account is suspended. Update your KYC immediately at http://secure-verify.xyz to reactivate.
  ```
- **Result**: Bubble turns red with a `⚠️ TrustShield: Suspicious Message` badge and hover tooltip.

### 2. Test Email Scam Detection:
- Open [Gmail](https://mail.google.com) or [Outlook Web](https://outlook.live.com).
- Open an email containing scam tokens (e.g. urgent KYC update, fake lottery, or crypto giveaway).
- **Result**: Email container turns red with a prominent top `⚠️ TrustShield: Suspicious Email Threat Detected` banner.
