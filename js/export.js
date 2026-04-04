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
      watermark.innerHTML = `Created with <strong style="color:#c9a84c">Prime Resume</strong> — primepopular.github.io/Prime-Resume/`;
      if (preview) preview.appendChild(watermark);
    }
  } else {
    if (watermark) watermark.remove();
  }

  const name = typeof getVal === 'function' ? getVal('fullName') : '';
  const oldTitle = document.title;
  if (name) document.title = name + ' — Resume';

  window.print();

  setTimeout(() => {
    document.title = oldTitle;
    const wm = document.getElementById('resumeWatermark');
    if (wm) wm.remove();
  }, 1000);

  trackFirstExport();
  if (typeof showToast === 'function') showToast('🎉 Resume exported! Good luck out there 🤞');
  if (typeof incrementResumeCount === 'function') incrementResumeCount();
  setTimeout(() => {
    if (typeof showFeedbackPopup === 'function') showFeedbackPopup();
  }, 5000);
}

// Premium export — Word (placeholder for now, requires premium)
function exportWord() {
  if (!(typeof isPremiumActive === 'function' && isPremiumActive())) {
    showToast('🔒 Word export is a Premium feature');
    setTimeout(() => window.location.href = 'pricing.html', 1800);
    return;
  }
  showToast('📝 Word export coming soon in next update');
}

// Track if this is the user's first export
function trackFirstExport() {
  const already = localStorage.getItem('prime_exported');
  if (!already) {
    localStorage.setItem('prime_exported', 'true');
    // First export celebration toast — delayed so it doesn't clash with print toast
    setTimeout(() => {
      if (typeof showToast === 'function') {
        showToast('🎉 First export done! Good luck out there 🤞');
      }
    }, 2000);
  }
}


// ============================================================
// FEEDBACK POPUP — shown after PDF export
// ============================================================
function showFeedbackPopup() {
  // Don't show if already submitted recently
  const lastShown = localStorage.getItem('prime_feedback_shown');
  if (lastShown) {
    const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) return; // Only show once per week
  }

  // Create popup
  const popup = document.createElement('div');
  popup.id = 'feedbackPopup';
  popup.style.cssText = `
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: #0d0d0d;
    border: 1px solid #c9a84c;
    padding: 1.5rem 2rem;
    z-index: 9999;
    max-width: 380px;
    width: 90%;
    box-shadow: 0 8px 40px rgba(0,0,0,0.8);
    animation: slideUp 0.3s ease;
  `;

  popup.innerHTML = `
    <style>
      @keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity:0; } to { transform: translateX(-50%) translateY(0); opacity:1; } }
    </style>
    <button onclick="document.getElementById('feedbackPopup').remove()" style="position:absolute;top:0.5rem;right:0.7rem;background:none;border:none;color:#555;font-size:1rem;cursor:pointer;">✕</button>
    <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:0.95rem;color:#c9a84c;margin-bottom:0.4rem;">
      ✨ Looking good!
    </div>
    <div style="font-size:0.82rem;color:#888;margin-bottom:1rem;line-height:1.5;">
      How was your experience with Prime Resume? Your feedback helps us improve.
    </div>
    <div style="display:flex;gap:0.5rem;margin-bottom:0.8rem;justify-content:center;font-size:1.4rem;">
      ${[1,2,3,4,5].map(i => `<span style="cursor:pointer;" onclick="selectStar(${i})" id="star${i}">☆</span>`).join('')}
    </div>
    <textarea id="feedbackText" placeholder="Tell us what you think (optional)..." style="width:100%;background:#181818;border:1px solid #2a2a2a;color:#f5f2eb;padding:0.6rem;font-family:'DM Sans',sans-serif;font-size:0.78rem;resize:none;height:70px;outline:none;margin-bottom:0.8rem;"></textarea>
    <button onclick="submitFeedbackPopup()" style="width:100%;background:#c9a84c;color:#000;border:none;padding:0.65rem;font-family:'Syne',sans-serif;font-weight:700;font-size:0.78rem;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;">
      Submit Feedback
    </button>
  `;

  document.body.appendChild(popup);
  localStorage.setItem('prime_feedback_shown', Date.now().toString());
}

let selectedStars = 0;

function selectStar(n) {
  selectedStars = n;
  for (let i = 1; i <= 5; i++) {
    const star = document.getElementById('star' + i);
    if (star) star.textContent = i <= n ? '⭐' : '☆';
  }
}

async function submitFeedbackPopup() {
  const text = document.getElementById('feedbackText')?.value.trim();
  const stars = selectedStars;

  if (!stars) {
    alert('Please select a star rating first!');
    return;
  }

  const message = `⭐ Rating: ${stars}/5\n\n${text || 'No written feedback'}`;

  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: '7000fe3b-dca9-4897-8a99-0e7af76f8773',
        subject: `Prime Resume Feedback — ${stars} Stars`,
        message: message,
        from_name: 'Prime Resume User'
      })
    });
  } catch(e) {}

  document.getElementById('feedbackPopup').remove();
  if (typeof showToast === 'function') showToast('✅ Thank you for your feedback!');
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
    setTimeout(() => showToast('🎉 Your resume is out in the world! Good luck — come back and tell us how it goes 🤞'), 1200);
  }
}


// ============================================================
// FEEDBACK POPUP — shown after PDF export
// ============================================================
function showFeedbackPopup() {
  // Don't show if already submitted recently
  const lastShown = localStorage.getItem('prime_feedback_shown');
  if (lastShown) {
    const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) return; // Only show once per week
  }

  // Create popup
  const popup = document.createElement('div');
  popup.id = 'feedbackPopup';
  popup.style.cssText = `
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: #0d0d0d;
    border: 1px solid #c9a84c;
    padding: 1.5rem 2rem;
    z-index: 9999;
    max-width: 380px;
    width: 90%;
    box-shadow: 0 8px 40px rgba(0,0,0,0.8);
    animation: slideUp 0.3s ease;
  `;

  popup.innerHTML = `
    <style>
      @keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity:0; } to { transform: translateX(-50%) translateY(0); opacity:1; } }
    </style>
    <button onclick="document.getElementById('feedbackPopup').remove()" style="position:absolute;top:0.5rem;right:0.7rem;background:none;border:none;color:#555;font-size:1rem;cursor:pointer;">✕</button>
    <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:0.95rem;color:#c9a84c;margin-bottom:0.4rem;">
      ✨ Looking good!
    </div>
    <div style="font-size:0.82rem;color:#888;margin-bottom:1rem;line-height:1.5;">
      How was your experience with Prime Resume? Your feedback helps us improve.
    </div>
    <div style="display:flex;gap:0.5rem;margin-bottom:0.8rem;justify-content:center;font-size:1.4rem;">
      ${[1,2,3,4,5].map(i => `<span style="cursor:pointer;" onclick="selectStar(${i})" id="star${i}">☆</span>`).join('')}
    </div>
    <textarea id="feedbackText" placeholder="Tell us what you think (optional)..." style="width:100%;background:#181818;border:1px solid #2a2a2a;color:#f5f2eb;padding:0.6rem;font-family:'DM Sans',sans-serif;font-size:0.78rem;resize:none;height:70px;outline:none;margin-bottom:0.8rem;"></textarea>
    <button onclick="submitFeedbackPopup()" style="width:100%;background:#c9a84c;color:#000;border:none;padding:0.65rem;font-family:'Syne',sans-serif;font-weight:700;font-size:0.78rem;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;">
      Submit Feedback
    </button>
  `;

  document.body.appendChild(popup);
  localStorage.setItem('prime_feedback_shown', Date.now().toString());
}

let selectedStars = 0;

function selectStar(n) {
  selectedStars = n;
  for (let i = 1; i <= 5; i++) {
    const star = document.getElementById('star' + i);
    if (star) star.textContent = i <= n ? '⭐' : '☆';
  }
}

async function submitFeedbackPopup() {
  const text = document.getElementById('feedbackText')?.value.trim();
  const stars = selectedStars;

  if (!stars) {
    alert('Please select a star rating first!');
    return;
  }

  const message = `⭐ Rating: ${stars}/5\n\n${text || 'No written feedback'}`;

  try {
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: '7000fe3b-dca9-4897-8a99-0e7af76f8773',
        subject: `Prime Resume Feedback — ${stars} Stars`,
        message: message,
        from_name: 'Prime Resume User'
      })
    });
  } catch(e) {}

  document.getElementById('feedbackPopup').remove();
  if (typeof showToast === 'function') showToast('✅ Thank you for your feedback!');
}
