// export.js — One job: Handle resume export
// NEVER put preview logic here. NEVER put storage logic here.

// Free export — PDF via browser print
function exportPDF() {
  // Block export if using premium template without premium
  if (window.premiumPreviewActive && !(typeof isPremiumActive === 'function' && isPremiumActive())) {
    showToast('🔒 Upgrade to Premium to export this template');
    setTimeout(() => window.location.href = 'pricing.html', 1800);
    return;
  }

  const isUnlocked = (typeof isPremiumActive === 'function' && isPremiumActive()) ||
    localStorage.getItem('prime_dev') === 'true';

  const preview = document.getElementById('resumePreview');
  let watermark = document.getElementById('resumeWatermark');

  if (!isUnlocked) {
    if (!watermark) {
      watermark = document.createElement('div');
      watermark.id = 'resumeWatermark';
      watermark.style.cssText = `
        text-align: center;
        padding: 0.8rem;
        margin-top: 2rem;
        border-top: 1px solid #eee;
        font-size: 0.72rem;
        color: #bbb;
        font-family: 'DM Sans', sans-serif;
        letter-spacing: 0.05em;
      `;
      watermark.innerHTML = `Created with <strong style="color:#c9a84c">Prime Resume</strong> — my-prime-resume.netlify.app`;
      if (preview) preview.appendChild(watermark);
    }
  } else {
    if (watermark) watermark.remove();
  }

  const name = getVal('fullName');
  const oldTitle = document.title;
  if (name) document.title = name + ' — Resume';

  window.print();

  setTimeout(() => {
    document.title = oldTitle;
    const wm = document.getElementById('resumeWatermark');
    if (wm) wm.remove();
  }, 1000);

  trackFirstExport();
  // Increment global export counter
  if (typeof incrementResumeCount === 'function') incrementResumeCount();
}

// Premium export — Word (placeholder for now, requires premium)
function exportWord() {
  if (!isPremiumActive()) {
    showToast('🔒 Word export is a Premium feature');
    setTimeout(() => window.location.href = 'pricing.html', 1800);
    return;
  }
  showToast('📝 Word export coming soon in next update');
}

// Track if this is the user's first export (for gamification toast)
function trackFirstExport() {
  const already = localStorage.getItem('prime_exported');
  if (!already) {
    localStorage.setItem('prime_exported', 'true');
    setTimeout(() => showToast('🎉 First export! Your resume is out in the world!'), 1200);
  }
}

