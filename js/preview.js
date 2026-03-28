// preview.js — Renders live resume preview for all 8 templates
// v8 — handles structural differences per template

function updatePreview() {
  const preview = document.getElementById('resumePreview');
  if (!preview) return;

  const name = getVal('fullName');
  const title = getVal('jobTitle');
  const email = getVal('email');
  const phone = getVal('phone');
  const city = getVal('city');
  const state = getVal('state');
  const address = getVal('address');
  const linkedin = getVal('linkedin');
  const website = getVal('website');
  const summary = getVal('summary');

  const contactItems = [email, phone, address, [city, state].filter(Boolean).join(', '), linkedin, website].filter(Boolean);
  const tpl = (preview.className.replace('resume-doc', '').trim().split(' ')[0] || 'classic');

  if (tpl === 'portrait') {
    renderPortrait(preview, name, title, contactItems, summary);
  } else if (tpl === 'modern') {
    renderModern(preview, name, title, contactItems, summary);
  } else if (tpl === 'executive') {
    renderExecutive(preview, name, title, contactItems, summary);
  } else {
    renderStandard(preview, name, title, contactItems, summary, tpl);
  }

  updateScore();
  if (typeof saveData === 'function') saveData();
  if (typeof scheduleVersionSave === 'function') scheduleVersionSave();
}

// ── STANDARD (classic, clean, minimal, bold, exclusive) ──────
function renderStandard(preview, name, title, contactItems, summary, tpl) {
  let html = `<div class="resume-name">${escapeHtml(name) || 'Your Name'}</div>`;
  if (title) html += `<div class="resume-title">${escapeHtml(title)}</div>`;
  if (contactItems.length) html += `<div class="resume-contact">${contactItems.map(c => `<span>${escapeHtml(c)}</span>`).join('')}</div>`;
  html += buildBodyHTML(summary, tpl);
  preview.innerHTML = html;
}

// ── MODERN — name left, title right on same line ─────────────
function renderModern(preview, name, title, contactItems, summary) {
  let html = `<div class="resume-header-block">
    <div class="resume-name-row">
      <div class="resume-name">${escapeHtml(name) || 'Your Name'}</div>
      ${title ? `<div class="resume-title">${escapeHtml(title)}</div>` : ''}
    </div>
    ${contactItems.length ? `<div class="resume-contact">${contactItems.map(c => `<span>${escapeHtml(c)}</span>`).join('')}</div>` : ''}
  </div>
  <div class="resume-body">${buildBodyHTML(summary, 'modern')}</div>`;
  preview.innerHTML = html;
}

// ── EXECUTIVE — name left + title right, skills 3-col grid ───
function renderExecutive(preview, name, title, contactItems, summary) {
  let html = `<div class="resume-header-block">
    <div class="resume-name-title-row">
      <div class="resume-name">${escapeHtml(name) || 'Your Name'}</div>
      ${title ? `<div class="resume-title">${escapeHtml(title)}</div>` : ''}
    </div>
    ${contactItems.length ? `<div class="resume-contact">${contactItems.map(c => `<span>${escapeHtml(c)}</span>`).join('')}</div>` : ''}
  </div>
  <div class="resume-body">${buildBodyHTML(summary, 'executive')}</div>`;
  preview.innerHTML = html;
}

// ── PORTRAIT — sidebar + main ────────────────────────────────
function renderPortrait(preview, name, title, contactItems, summary) {
  const photoUrl = window.portraitPhotoDataUrl || null;
  const photoHTML = photoUrl
    ? `<div class="portrait-photo-area has-photo" onclick="document.getElementById('portraitPhotoInput').click()" title="Click to change photo"><img src="${photoUrl}" alt="Profile photo"/></div>`
    : `<div class="portrait-photo-area" onclick="document.getElementById('portraitPhotoInput').click()" title="Click to upload photo">
        <div class="portrait-photo-placeholder">📷</div>
        <div class="portrait-photo-hint">Click to add photo (optional)</div>
       </div>`;

  const contactHTML = contactItems.length
    ? `<div class="sidebar-section-title">Contact</div>${contactItems.map(c => `<div class="sidebar-contact-item">${escapeHtml(c)}</div>`).join('')}`
    : '';
  const skillsHTML = (window.skills || []).length
    ? `<div class="sidebar-section-title">Skills</div><div>${(window.skills || []).map(s => `<span class="sidebar-skill">${escapeHtml(s)}</span>`).join('')}</div>`
    : '';
  const langHTML = (window.languages || []).length
    ? `<div class="sidebar-section-title">Languages</div>${(window.languages || []).map(l => `<div class="sidebar-contact-item">${escapeHtml(l)}</div>`).join('')}`
    : '';

  preview.innerHTML = `
    <div class="portrait-sidebar">
      ${photoHTML}
      <div class="sidebar-name">${escapeHtml(name) || 'Your Name'}</div>
      ${title ? `<div class="sidebar-title">${escapeHtml(title)}</div>` : ''}
      ${contactHTML}
      ${skillsHTML}
      ${langHTML}
    </div>
    <div class="portrait-main">${buildBodyHTML(summary, 'portrait')}</div>`;
}

// ── SHARED BODY BUILDER ───────────────────────────────────────
function buildBodyHTML(summary, tpl) {
  let html = '';

  if (summary && isSectionVisible('summary')) {
    html += `<div class="resume-section-title">Summary</div>
             <div class="resume-summary">${escapeHtml(summary)}</div>`;
  }

  // Skills — portrait handles in sidebar
  if (tpl !== 'portrait' && window.skills && window.skills.length && isSectionVisible('skills')) {
    html += `<div class="resume-section-title">Skills</div>
             <div class="resume-skills-list">${(window.skills || []).map(s => `<span class="resume-skill">${escapeHtml(s)}</span>`).join('')}</div>`;
  }

  if (window.experiences && window.experiences.length && isSectionVisible('experience')) {
    html += `<div class="resume-section-title">Work Experience</div>`;
    (window.experiences || []).forEach(exp => {
      if (!exp.title && !exp.company) return;
      const dr = [exp.start, exp.end].filter(Boolean).join(' – ');
      let descHTML = '';
      if (exp.desc) {
        const lines = exp.desc.split('\n').map(l => l.trim()).filter(Boolean);
        descHTML = lines.length > 1
          ? `<ul class="resume-bullets">${lines.map(l => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`
          : `<div class="resume-item-desc">${escapeHtml(lines[0] || '')}</div>`;
      }
      html += `<div class="resume-item">
        <div class="resume-item-header">
          <span class="resume-item-title">${escapeHtml(exp.title)}</span>
          ${dr ? `<span class="resume-item-date">${escapeHtml(dr)}</span>` : ''}
        </div>
        ${exp.company ? `<div class="resume-item-sub">${escapeHtml(exp.company)}</div>` : ''}
        ${descHTML}
      </div>`;
    });
  }

  if (window.educations && window.educations.length && isSectionVisible('education')) {
    html += `<div class="resume-section-title">Education</div>`;
    (window.educations || []).forEach(edu => {
      if (!edu.degree && !edu.school) return;
      const dr = [edu.start, edu.end].filter(Boolean).join(' – ');
      html += `<div class="resume-item">
        <div class="resume-item-header">
          <span class="resume-item-title">${escapeHtml(edu.degree)}</span>
          ${dr ? `<span class="resume-item-date">${escapeHtml(dr)}</span>` : ''}
        </div>
        ${edu.school ? `<div class="resume-item-sub">${escapeHtml(edu.school)}</div>` : ''}
      </div>`;
    });
  }

  if (window.projects && window.projects.length && isSectionVisible('projects')) {
    html += `<div class="resume-section-title">Projects</div>`;
    (window.projects || []).forEach(proj => {
      if (!proj.name) return;
      html += `<div class="resume-item">
        <div class="resume-item-title">${escapeHtml(proj.name)}</div>
        ${proj.desc ? `<div class="resume-item-desc">${escapeHtml(proj.desc)}</div>` : ''}
        ${proj.link ? `<div class="resume-item-sub">${escapeHtml(proj.link)}</div>` : ''}
      </div>`;
    });
  }

  if (window.certifications && window.certifications.length && isSectionVisible('certifications')) {
    html += `<div class="resume-section-title">Certifications</div>`;
    (window.certifications || []).forEach(cert => {
      if (!cert.name) return;
      html += `<div class="resume-item">
        <div class="resume-item-header">
          <span class="resume-item-title">${escapeHtml(cert.name)}</span>
          ${cert.date ? `<span class="resume-item-date">${escapeHtml(cert.date)}</span>` : ''}
        </div>
        ${cert.issuer ? `<div class="resume-item-sub">${escapeHtml(cert.issuer)}</div>` : ''}
      </div>`;
    });
  }

  if (window.awards && window.awards.length && isSectionVisible('awards')) {
    html += `<div class="resume-section-title">Awards & Recognition</div>`;
    (window.awards || []).forEach(award => {
      if (!award.title) return;
      html += `<div class="resume-item">
        <div class="resume-item-header">
          <span class="resume-item-title">${escapeHtml(award.title)}</span>
          ${award.date ? `<span class="resume-item-date">${escapeHtml(award.date)}</span>` : ''}
        </div>
        ${award.issuer ? `<div class="resume-item-sub">${escapeHtml(award.issuer)}</div>` : ''}
      </div>`;
    });
  }

  // Languages — portrait handles in sidebar
  if (tpl !== 'portrait' && window.languages && window.languages.length && isSectionVisible('languages')) {
    html += `<div class="resume-section-title">Languages</div>
             <div class="resume-skills-list">${(window.languages || []).map(l => `<span class="resume-skill">${escapeHtml(l)}</span>`).join('')}</div>`;
  }

  return html;
}

function isSectionVisible(sectionId) {
  const section = document.getElementById('section-' + sectionId);
  if (!section) return true;
  const toggle = section.previousElementSibling.querySelector('.section-toggle');
  return toggle ? toggle.classList.contains('on') : true;
}

function updateScore() {
  let score = 0;
  if (getVal('fullName')) score += 20;
  if (getVal('email')) score += 10;
  if (getVal('summary')) score += 15;
  if (window.skills && window.skills.length >= 3) score += 15;
  if (window.experiences && window.experiences.length >= 1) score += 25;
  if (window.educations && window.educations.length >= 1) score += 15;
  const scoreEl = document.getElementById('scoreValue');
  if (scoreEl) scoreEl.textContent = score + '%';
  if (score === 100 && typeof showToast === 'function') showToast('🏆 Perfect score! Your resume is complete.');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
