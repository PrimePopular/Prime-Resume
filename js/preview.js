// preview.js — One job: Read data and render the live resume preview
// NEVER put storage logic here. NEVER put export logic here.

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

  // Contact items
  const contactItems = [email, phone, address, [city, state].filter(Boolean).join(', '), linkedin, website].filter(Boolean);
  const contactHTML = contactItems.length
    ? `<div class="resume-contact">${contactItems.map(c => `<span>${escapeHtml(c)}</span>`).join('')}</div>`
    : '';

  // Header block
  let headerHTML = `<div class="resume-name">${escapeHtml(name) || 'Your Name'}</div>`;
  if (title) headerHTML += `<div class="resume-title">${escapeHtml(title)}</div>`;
  headerHTML += contactHTML;

  // Body content — respects drag and drop order
  let bodyHTML = '';

  // Use global section order if set, otherwise default
  const sectionOrder = window.currentSectionOrder || ['section-summary','section-skills','section-experience','section-education','section-projects','section-certifications','section-awards','section-languages'];

  // Map section IDs to their render functions
  const sectionRenderers = {
    'section-summary': () => {
      if (summary && isSectionVisible('summary')) {
        bodyHTML += `<div class="resume-section-title">Summary</div>`;
        bodyHTML += `<div class="resume-summary">${escapeHtml(summary)}</div>`;
      }
    },
    'section-skills': () => {
      if (window.skills && window.skills.length && isSectionVisible('skills')) {
        bodyHTML += `<div class="resume-section-title">Skills</div>`;
        bodyHTML += `<div class="resume-skills-list">`;
        window.skills.forEach(s => { bodyHTML += `<span class="resume-skill">${escapeHtml(s)}</span>`; });
        bodyHTML += `</div>`;
      }
    },
    'section-experience': () => {
      if (window.experiences && window.experiences.length && isSectionVisible('experience')) {
        bodyHTML += `<div class="resume-section-title">Work Experience</div>`;
        window.experiences.forEach(exp => {
          if (!exp.title && !exp.company) return;
          const dateRange = [exp.start, exp.end].filter(Boolean).join(' – ');
          let descHTML = '';
          if (exp.desc) {
            const lines = exp.desc.split('\n').map(l => l.trim()).filter(Boolean);
            if (lines.length > 1) {
              descHTML = `<ul class="resume-bullets">${lines.map(l => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`;
            } else if (lines.length === 1) {
              descHTML = `<div class="resume-item-desc">${escapeHtml(lines[0])}</div>`;
            }
          }
          bodyHTML += `<div class="resume-item">
            <div class="resume-item-header">
              <span class="resume-item-title">${escapeHtml(exp.title)}</span>
              ${dateRange ? `<span class="resume-item-date">${escapeHtml(dateRange)}</span>` : ''}
            </div>
            ${exp.company ? `<div class="resume-item-sub">${escapeHtml(exp.company)}</div>` : ''}
            ${descHTML}
          </div>`;
        });
      }
    },
    'section-education': () => {
      if (window.educations && window.educations.length && isSectionVisible('education')) {
        bodyHTML += `<div class="resume-section-title">Education</div>`;
        window.educations.forEach(edu => {
          if (!edu.degree && !edu.school) return;
          const dateRange = [edu.start, edu.end].filter(Boolean).join(' – ');
          bodyHTML += `<div class="resume-item">
            <div class="resume-item-header">
              <span class="resume-item-title">${escapeHtml(edu.degree)}</span>
              ${dateRange ? `<span class="resume-item-date">${escapeHtml(dateRange)}</span>` : ''}
            </div>
            ${edu.school ? `<div class="resume-item-sub">${escapeHtml(edu.school)}</div>` : ''}
          </div>`;
        });
      }
    },
    'section-projects': () => {
      if (window.projects && window.projects.length && isSectionVisible('projects')) {
        bodyHTML += `<div class="resume-section-title">Projects</div>`;
        window.projects.forEach(proj => {
          if (!proj.name) return;
          bodyHTML += `<div class="resume-item">
            <div class="resume-item-title">${escapeHtml(proj.name)}</div>
            ${proj.desc ? `<div class="resume-item-desc">${escapeHtml(proj.desc)}</div>` : ''}
            ${proj.link ? `<div class="resume-item-sub">${escapeHtml(proj.link)}</div>` : ''}
          </div>`;
        });
      }
    },
    'section-certifications': () => {
      if (window.certifications && window.certifications.length && isSectionVisible('certifications')) {
        bodyHTML += `<div class="resume-section-title">Certifications</div>`;
        window.certifications.forEach(cert => {
          if (!cert.name) return;
          bodyHTML += `<div class="resume-item">
            <div class="resume-item-header">
              <span class="resume-item-title">${escapeHtml(cert.name)}</span>
              ${cert.date ? `<span class="resume-item-date">${escapeHtml(cert.date)}</span>` : ''}
            </div>
            ${cert.issuer ? `<div class="resume-item-sub">${escapeHtml(cert.issuer)}</div>` : ''}
          </div>`;
        });
      }
    },
    'section-awards': () => {
      if (window.awards && window.awards.length && isSectionVisible('awards')) {
        bodyHTML += `<div class="resume-section-title">Awards & Recognition</div>`;
        window.awards.forEach(award => {
          if (!award.title) return;
          bodyHTML += `<div class="resume-item">
            <div class="resume-item-header">
              <span class="resume-item-title">${escapeHtml(award.title)}</span>
              ${award.date ? `<span class="resume-item-date">${escapeHtml(award.date)}</span>` : ''}
            </div>
            ${award.issuer ? `<div class="resume-item-sub">${escapeHtml(award.issuer)}</div>` : ''}
          </div>`;
        });
      }
    },
    'section-languages': () => {
      if (window.languages && window.languages.length && isSectionVisible('languages')) {
        bodyHTML += `<div class="resume-section-title">Languages</div>`;
        bodyHTML += `<div class="resume-skills-list">`;
        window.languages.forEach(l => { bodyHTML += `<span class="resume-skill">${escapeHtml(l)}</span>`; });
        bodyHTML += `</div>`;
      }
    }
  };

  // Render sections in DOM order
  sectionOrder.forEach(id => {
    if (sectionRenderers[id]) sectionRenderers[id]();
  });
  // Render any missing sections as fallback
  const allSections = ['section-summary','section-skills','section-experience','section-education','section-projects','section-certifications','section-awards','section-languages'];
  allSections.forEach(id => {
    if (!sectionOrder.includes(id) && sectionRenderers[id]) sectionRenderers[id]();
  });

  preview.innerHTML = headerHTML + bodyHTML;

  updateScore();
  saveData();
  if (typeof scheduleVersionSave === 'function') scheduleVersionSave();
}

// Check if a section is toggled on
function isSectionVisible(sectionId) {
  const section = document.getElementById('section-' + sectionId);
  if (!section) return true;
  const toggle = section.previousElementSibling.querySelector('.section-toggle');
  return toggle ? toggle.classList.contains('on') : true;
}

// Resume completeness score
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

  if (score === 100) showToast('🏆 Perfect score! Your resume is complete and ready.');
}

// Prevent XSS in preview
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
