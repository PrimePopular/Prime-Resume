// templates.js — One job: Handle template selection and switching
// NEVER put preview rendering here. NEVER put export logic here.

window.activeTemplate = 'classic';

// Select a free template
function selectTemplate(name, card) {
  document.querySelectorAll('.template-card').forEach(c => c.classList.remove('active'));
  if (card) card.classList.add('active');

  window.activeTemplate = name;
  const preview = document.getElementById('resumePreview');
  if (preview) {
    preview.className = 'resume-doc ' + name;
  }
  // Re-render preview so creative wrapper divs apply correctly
  if (typeof updatePreview === 'function') updatePreview();
  showToast('Template: ' + name.charAt(0).toUpperCase() + name.slice(1));
  saveData();
}

// Check premium before selecting a premium template
function checkPremium(name, card) {
  if (isPremiumActive()) {
    selectTemplate(name, card);
  } else {
    showToast('🔒 Premium template — upgrade to unlock');
    setTimeout(() => window.location.href = 'pricing.html', 1800);
  }
}

// Restore active template on page load
function restoreTemplate() {
  const name = window.activeTemplate || 'classic';
  const preview = document.getElementById('resumePreview');
  if (preview) preview.className = 'resume-doc ' + name;

  // Highlight correct card
  document.querySelectorAll('.template-card').forEach(card => {
    card.classList.remove('active');
    const cardName = card.getAttribute('data-template');
    if (cardName === name) card.classList.add('active');
  });
}
