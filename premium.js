// premium.js — One job: Handle premium status and dev mode
// NEVER put preview or export logic here.

// ——— DEV MODE ———
// Secret key combo: type "devmode" anywhere on the page
let devBuffer = '';
document.addEventListener('keydown', (e) => {
  devBuffer += e.key.toLowerCase();
  if (devBuffer.length > 7) devBuffer = devBuffer.slice(-7);
  if (devBuffer === 'devmode') {
    activateDevMode();
    devBuffer = '';
  }
});

function activateDevMode() {
  const already = localStorage.getItem('prime_dev') === 'true';
  if (already) {
    localStorage.removeItem('prime_dev');
    showToast('🔧 Dev mode OFF');
  } else {
    localStorage.setItem('prime_dev', 'true');
    showToast('🔧 Dev mode ON — All features unlocked');
  }
  // Refresh template display
  setTimeout(() => restoreTemplate(), 500);
}

// ——— PREMIUM ACTIVATION ———
// Called after successful payment with a unique code
function activatePremium(code) {
  if (!code || code.length < 8) {
    showToast('❌ Invalid activation code');
    return false;
  }
  // Save premium start date and code
  localStorage.setItem('prime_premium', 'true');
  localStorage.setItem('prime_premium_date', new Date().toISOString());
  localStorage.setItem('prime_code', code);
  showToast('✅ Premium activated! ' + getPremiumDaysLeft() + ' days remaining');
  return true;
}

// ——— PREMIUM STATUS BANNER ———
// Call on page load to show premium status if active
function checkPremiumBanner() {
  if (isPremiumActive()) {
    const daysLeft = getPremiumDaysLeft();
    const devMode = localStorage.getItem('prime_dev') === 'true';
    if (devMode) return; // No banner needed in dev mode
    if (daysLeft <= 5) {
      showToast('⚠️ Premium expires in ' + daysLeft + ' days');
    }
  }
}

// Run on load
window.addEventListener('load', checkPremiumBanner);

// ============================================================
// FEATURE GATES — Check if a feature is available
// ============================================================

function canUseVersionHistory() {
  return isPremiumActive();
}

function canUseUnlimitedJobTracker() {
  return isPremiumActive();
}

function canSeeATSKeywords() {
  return isPremiumActive();
}

function canExportClean() {
  return isPremiumActive();
}

function canUseQuickResume() {
  return isPremiumActive();
}

function getJobTrackerLimit() {
  return isPremiumActive() ? Infinity : 5;
}

// ============================================================
// PREMIUM KEY FILE — Download and restore premium
// ============================================================

function downloadPremiumKey() {
  const code = localStorage.getItem('prime_code');
  const date = localStorage.getItem('prime_premium_date');
  const devMode = localStorage.getItem('prime_dev') === 'true';

  if (!isPremiumActive() && !devMode) {
    if (typeof showToast === 'function') showToast('No active premium to save');
    return;
  }

  // Build key data
  const keyData = {
    code: code || 'DEV',
    date: date || new Date().toISOString(),
    version: '1.0',
    product: 'prime-resume',
    checksum: btoa(unescape(encodeURIComponent((code || 'DEV') + date + 'prime-resume')))
  };

  // Convert to base64 encoded string
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(keyData))));

  // Create downloadable file
  const blob = new Blob([encoded], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'prime-resume-premium.prkey';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (typeof showToast === 'function') showToast('✅ Premium key saved! Keep this file safe.');
}

function restorePremiumKey(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const encoded = e.target.result.trim();
      const decoded = decodeURIComponent(escape(atob(encoded)));
      const keyData = JSON.parse(decoded);

      // Validate key
      if (keyData.product !== 'prime-resume') {
        if (typeof showToast === 'function') showToast('❌ Invalid key file');
        return;
      }

      // Verify checksum
      const expectedChecksum = btoa(unescape(encodeURIComponent(
        keyData.code + keyData.date + 'prime-resume'
      )));
      // Allow dev mode keys and valid checksums
      const isDevKey = keyData.code === 'DEV';
      if (!isDevKey && keyData.checksum !== expectedChecksum) {
        if (typeof showToast === 'function') showToast('❌ Key file is corrupted or tampered');
        return;
      }

      // Check if still within 40 days (skip for dev keys)
      const purchaseDate = new Date(keyData.date);
      const now = new Date();
      const diffDays = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));

      if (keyData.code !== 'DEV' && diffDays >= 40) {
        if (typeof showToast === 'function') showToast('⚠️ This premium key has expired');
        return;
      }

      // Restore premium
      if (keyData.code === 'DEV') {
        localStorage.setItem('prime_dev', 'true');
      } else {
        localStorage.setItem('prime_premium', 'true');
        localStorage.setItem('prime_premium_date', keyData.date);
        localStorage.setItem('prime_code', keyData.code);
      }

      const daysLeft = keyData.code === 'DEV' ? 999 : 40 - diffDays;
      if (typeof showToast === 'function') {
        showToast('✅ Premium restored! ' + (keyData.code === 'DEV' ? 'Dev mode active' : daysLeft + ' days remaining'));
      }

      // Reload after short delay
      setTimeout(() => window.location.reload(), 1500);

    } catch(err) {
      if (typeof showToast === 'function') showToast('❌ Could not read key file');
    }
  };
  reader.readAsText(file);
}
