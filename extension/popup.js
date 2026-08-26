// TrustShield Unified Extension Popup Controller

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const protectionToggle = document.getElementById('protectionToggle');
  const statusText = document.getElementById('statusText');
  const statusDot = document.querySelector('.status-dot');
  
  const statTotalScanned = document.getElementById('statTotalScanned');
  const statTotalFlagged = document.getElementById('statTotalFlagged');
  const statWhatsappScanned = document.getElementById('statWhatsappScanned');
  const statEmailScanned = document.getElementById('statEmailScanned');
  
  const latestThreatContainer = document.getElementById('latestThreatContainer');
  const threatSource = document.getElementById('threatSource');
  const threatText = document.getElementById('threatText');
  const threatCategory = document.getElementById('threatCategory');
  const threatRisk = document.getElementById('threatRisk');
  const threatTime = document.getElementById('threatTime');
  
  const apiUrlInput = document.getElementById('apiUrlInput');
  const saveUrlBtn = document.getElementById('saveUrlBtn');
  const resetStatsBtn = document.getElementById('resetStatsBtn');

  // Load and apply initial state from chrome.storage
  function updateUI() {
    chrome.storage.local.get([
      'isEnabled',
      'apiUrl',
      'scannedCount',
      'whatsappScanned',
      'emailScanned',
      'flaggedCount',
      'lastScamReport'
    ], (settings) => {
      // 1. Enable / Disable state
      const isEnabled = settings.isEnabled !== false; // default true
      protectionToggle.checked = isEnabled;
      
      if (isEnabled) {
        statusText.textContent = 'Active';
        statusDot.className = 'status-dot pulse';
        statusDot.style.backgroundColor = '#10b981'; // Green
      } else {
        statusText.textContent = 'Disabled';
        statusDot.className = 'status-dot';
        statusDot.style.backgroundColor = '#64748b'; // Gray
      }

      // 2. Load API URL
      apiUrlInput.value = settings.apiUrl || 'http://127.0.0.1:8000/api/analyze/text';

      // 3. Load combined stats
      const totalScanned = settings.scannedCount || 0;
      const totalFlagged = settings.flaggedCount || 0;
      const waScanned = settings.whatsappScanned || 0;
      const emailScanned = settings.emailScanned || 0;

      statTotalScanned.textContent = totalScanned;
      statTotalFlagged.textContent = totalFlagged;
      statWhatsappScanned.textContent = `${waScanned} scanned`;
      statEmailScanned.textContent = `${emailScanned} scanned`;

      // 4. Load latest threat preview
      const lastScam = settings.lastScamReport;
      if (lastScam && lastScam.text) {
        threatText.textContent = `"${lastScam.text}"`;
        threatCategory.textContent = lastScam.category || 'Scam';
        threatRisk.textContent = lastScam.risk_level || 'HIGH';
        threatTime.textContent = lastScam.timestamp || '';
        threatSource.textContent = lastScam.source || 'WhatsApp';

        // Set source tag styling
        if ((lastScam.source || '').toLowerCase().includes('email')) {
          threatSource.style.background = 'rgba(56, 189, 248, 0.2)';
          threatSource.style.color = '#38bdf8';
          threatSource.style.borderColor = 'rgba(56, 189, 248, 0.3)';
        } else {
          threatSource.style.background = 'rgba(37, 211, 102, 0.2)';
          threatSource.style.color = '#25d366';
          threatSource.style.borderColor = 'rgba(37, 211, 102, 0.3)';
        }
        
        // Highlight risk level
        const riskVal = (lastScam.risk_level || 'HIGH').toUpperCase();
        if (riskVal === 'CRITICAL' || riskVal === 'HIGH') {
          threatRisk.className = 'badge danger';
        } else {
          threatRisk.className = 'badge';
          threatRisk.style.background = '#eab308'; // Yellow/Orange
        }
      } else {
        // Default placeholder
        threatText.textContent = 'No threats detected during this session.';
        threatCategory.textContent = 'N/A';
        threatRisk.textContent = 'N/A';
        threatRisk.className = 'badge';
        threatRisk.style.background = '#334155';
        threatTime.textContent = '--:--';
        threatSource.textContent = 'System Clean';
        threatSource.style.background = 'rgba(100, 116, 139, 0.2)';
        threatSource.style.color = '#94a3b8';
        threatSource.style.borderColor = 'rgba(100, 116, 139, 0.3)';
      }
    });
  }

  // 1. Toggle Protection Switch
  protectionToggle.addEventListener('change', () => {
    const isEnabled = protectionToggle.checked;
    chrome.storage.local.set({ isEnabled: isEnabled }, () => {
      updateUI();
    });
  });

  // 2. Save API Endpoint URL
  saveUrlBtn.addEventListener('click', () => {
    const url = apiUrlInput.value.trim();
    if (!url) return;

    saveUrlBtn.textContent = 'Saved!';
    saveUrlBtn.style.backgroundColor = '#10b981'; // Green confirmation

    chrome.storage.local.set({ apiUrl: url }, () => {
      setTimeout(() => {
        saveUrlBtn.textContent = 'Save';
        saveUrlBtn.style.backgroundColor = ''; // Restore CSS default
      }, 1500);
    });
  });

  // 3. Reset Statistics
  resetStatsBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all scan statistics?')) {
      chrome.storage.local.set({
        scannedCount: 0,
        whatsappScanned: 0,
        emailScanned: 0,
        flaggedCount: 0,
        whatsappFlagged: 0,
        emailFlagged: 0,
        lastScamReport: null
      }, () => {
        updateUI();
      });
    }
  });

  // Listen for storage changes in the background and update popup dynamically
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      updateUI();
    }
  });

  // Run initial updates
  updateUI();
});
