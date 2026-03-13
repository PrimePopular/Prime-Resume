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
