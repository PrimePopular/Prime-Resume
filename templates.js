// templates.js — One job: Handle template selection and switching
// NEVER put preview rendering here. NEVER put export logic here.

window.activeTemplate = 'classic';
window.premiumPreviewActive = false;

// Select a free template
function selectTemplate(name, card) {
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
  if (card) card.classList.add('active');

  window.activeTemplate = name;
  window.premiumPreviewActive = false;
  const preview = document.getElementById('resumePreview');
  if (preview) preview.className = 'resume-doc ' + name;
  if (typeof updatePreview === 'function') updatePreview();
  if (typeof showToast === 'function') showToast('Template: ' + name.charAt(0).toUpperCase() + name.slice(1));
  if (typeof saveData === 'function') saveData();
}

// Check premium before selecting a premium template
function checkPremium(name, card) {
  const unlocked = (typeof isPremiumActive === 'function' && isPremiumActive()) ||
    localStorage.getItem('prime_dev') === 'true';

  if (unlocked) {
    selectTemplate(name, card);
    return;
  }

  // FREE USER — show preview but block export
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
  if (card) card.classList.add('active');

  window.activeTemplate = name;
  window.premiumPreviewActive = true;

  const preview = document.getElementById('resumePreview');
  if (preview) {
    preview.className = 'resume-doc ' + name;
    // Remove any locked overlay if exists
    const existing = document.getElementById('templateLockOverlay');
    if (existing) existing.remove();

    // Add a subtle lock banner at bottom of preview
    const banner = document.createElement('div');
    banner.id = 'templateLockOverlay';
    banner.style.cssText = `
      position: sticky; bottom: 0; left: 0; right: 0;
      background: rgba(10,10,10,0.92);
      border-top: 1px solid rgba(201,168,76,0.3);
      padding: 0.8rem 1.5rem;
      display: flex; align-items: center; justify-content: space-between;
      gap: 1rem;
      backdrop-filter: blur(8px);
    `;
    banner.innerHTML = `
      <span style="font-family:'Syne',sans-serif;font-size:0.72rem;font-weight:700;color:#c9a84c;letter-spacing:0.08em;">
        🔒 Premium Template — Preview only
      </span>
      <a href="pricing.html" style="background:#c9a84c;color:#000;padding:0.35rem 0.9rem;
        font-family:'Syne',sans-serif;font-size:0.68rem;font-weight:700;
        letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;border-radius:2px;">
        Upgrade →
      </a>
    `;
    preview.appendChild(banner);
  }

  if (typeof updatePreview === 'function') updatePreview();
  if (typeof showToast === 'function') {
    setTimeout(() => showToast('👁 Preview only — export unlocked with Premium'), 400);
  }
}

// Restore active template on page load
function restoreTemplate() {
  const name = window.activeTemplate || 'classic';
  const preview = document.getElementById('resumePreview');
  if (preview) preview.className = 'resume-doc ' + name;
}
