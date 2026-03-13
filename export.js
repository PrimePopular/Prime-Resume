// export.js — One job: Handle resume export
// NEVER put preview logic here. NEVER put storage logic here.

// Free export — PDF via browser print
function exportPDF() {
  const name = getVal('fullName') || 'resume';
  document.title = name + ' — Resume';

  // Hide everything except the resume doc for printing
  window.print();

  // Restore title after print
  setTimeout(() => { document.title = 'Prime Resume — Builder'; }, 1000);

  showToast('📄 Print dialog opened — Save as PDF');
  trackFirstExport();
}

// Premium export — Word (placeholder for now, requires premium)
function exportWord() {
  if (!isPremiumActive()) {
    showToast('🔒 Word export is a Premium feature');
    setTimeout(() => window.location.href = 'pricing.html', 1800);
    return;
  }
  // Word export implementation goes here in a future update
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
