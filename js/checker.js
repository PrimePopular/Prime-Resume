// checker.js — One job: Spell check and ATS scoring for the resume
// NEVER put preview or export logic here.

// ============================================================
// SPELL CHECKER
// Basic common misspelling dictionary
// ============================================================
function runSpellCheck() {
  const errors = [];

  // Check for weak writing patterns
  const allText = [
    document.getElementById('summary')?.value || '',
    ...(window.experiences || []).map(e => e.desc || '')
  ].join(' ').toLowerCase();

  if (allText.includes('responsible for')) {
    errors.push({ word: '"Responsible for..."', suggestion: 'Use action verbs instead — "Managed", "Led", "Built"', location: 'Writing tip' });
  }
  if (allText.includes('duties included')) {
    errors.push({ word: '"Duties included..."', suggestion: 'Start with action verbs — "Developed", "Implemented"', location: 'Writing tip' });
  }
  if (allText.includes('worked with')) {
    errors.push({ word: '"Worked with..."', suggestion: 'Be specific — "Collaborated with 5-person team to..."', location: 'Writing tip' });
  }
  if (allText.includes('helped with')) {
    errors.push({ word: '"Helped with..."', suggestion: 'Use stronger verbs — "Contributed to", "Supported"', location: 'Writing tip' });
  }
  if (allText.includes(' i am ') || allText.includes(' i have ') || allText.includes(' i was ')) {
    errors.push({ word: 'First person ("I am / I have")', suggestion: 'Remove "I" — write "Experienced developer" not "I am an experienced developer"', location: 'Writing tip' });
  }

  return errors;
}

// ============================================================
// ATS CHECKER
// Checks for common ATS-friendly resume elements
// ============================================================
const atsKeywordCategories = {
  'Action Verbs': [
    'managed', 'led', 'developed', 'created', 'designed', 'implemented',
    'improved', 'increased', 'reduced', 'achieved', 'delivered', 'built',
    'launched', 'optimized', 'analyzed', 'coordinated', 'collaborated',
    'executed', 'established', 'generated', 'maintained', 'resolved',
    'streamlined', 'transformed', 'utilized', 'supervised', 'trained'
  ],
  'Technical Skills': [
    'python', 'javascript', 'java', 'sql', 'html', 'css', 'react', 'node',
    'aws', 'git', 'linux', 'docker', 'api', 'database', 'agile', 'scrum',
    'machine learning', 'data analysis', 'cloud', 'security', 'network'
  ],
  'Soft Skills': [
    'leadership', 'communication', 'teamwork', 'problem-solving', 'analytical',
    'creative', 'detail-oriented', 'organized', 'motivated', 'collaborative',
    'adaptable', 'innovative', 'strategic', 'proactive', 'results-driven'
  ]
};

function runATSCheck() {
  const results = {
    score: 0,
    maxScore: 100,
    checks: [],
    keywords: { found: [], missing: [] }
  };

  const allText = getAllResumeText().toLowerCase();

  // CHECK 1: Contact information (15 points)
  const hasEmail = !!getVal('email');
  const hasPhone = !!getVal('phone');
  const hasLocation = !!(getVal('city') || getVal('state'));
  const contactScore = (hasEmail ? 5 : 0) + (hasPhone ? 5 : 0) + (hasLocation ? 5 : 0);
  results.checks.push({
    label: 'Contact Information',
    score: contactScore,
    max: 15,
    status: contactScore >= 10 ? 'good' : contactScore >= 5 ? 'warn' : 'bad',
    tip: contactScore < 15 ? 'Add email, phone, and location for full contact score.' : 'Complete contact info found.'
  });

  // CHECK 2: Professional summary (15 points)
  const summary = getVal('summary');
  const summaryScore = summary.length > 100 ? 15 : summary.length > 50 ? 10 : summary.length > 0 ? 5 : 0;
  results.checks.push({
    label: 'Professional Summary',
    score: summaryScore,
    max: 15,
    status: summaryScore >= 15 ? 'good' : summaryScore >= 5 ? 'warn' : 'bad',
    tip: summaryScore < 15 ? 'Write a summary of at least 100 characters for best results.' : 'Good summary length.'
  });

  // CHECK 3: Work experience (20 points)
  const expCount = window.experiences ? window.experiences.filter(e => e.title && e.company).length : 0;
  const expScore = expCount >= 2 ? 20 : expCount === 1 ? 12 : 0;
  results.checks.push({
    label: 'Work Experience',
    score: expScore,
    max: 20,
    status: expScore >= 20 ? 'good' : expScore >= 12 ? 'warn' : 'bad',
    tip: expScore < 20 ? 'Add at least 2 work experiences with title and company.' : 'Good work history.'
  });

  // CHECK 4: Education (10 points)
  const eduCount = window.educations ? window.educations.filter(e => e.degree && e.school).length : 0;
  const eduScore = eduCount >= 1 ? 10 : 0;
  results.checks.push({
    label: 'Education',
    score: eduScore,
    max: 10,
    status: eduScore >= 10 ? 'good' : 'bad',
    tip: eduScore < 10 ? 'Add at least one education entry.' : 'Education found.'
  });

  // CHECK 5: Skills (15 points)
  const skillCount = window.skills ? window.skills.length : 0;
  const skillScore = skillCount >= 6 ? 15 : skillCount >= 3 ? 10 : skillCount >= 1 ? 5 : 0;
  results.checks.push({
    label: 'Skills Section',
    score: skillScore,
    max: 15,
    status: skillScore >= 15 ? 'good' : skillScore >= 5 ? 'warn' : 'bad',
    tip: skillScore < 15 ? `Add at least 6 skills. You have ${skillCount}.` : 'Good number of skills.'
  });

  // CHECK 6: Action verbs (15 points)
  const actionVerbs = atsKeywordCategories['Action Verbs'];
  const foundVerbs = actionVerbs.filter(v => allText.includes(v));
  const verbScore = foundVerbs.length >= 5 ? 15 : foundVerbs.length >= 3 ? 10 : foundVerbs.length >= 1 ? 5 : 0;
  results.checks.push({
    label: 'Action Verbs',
    score: verbScore,
    max: 15,
    status: verbScore >= 15 ? 'good' : verbScore >= 5 ? 'warn' : 'bad',
    tip: verbScore < 15
      ? `Use more action verbs. Found: ${foundVerbs.slice(0,3).join(', ') || 'none'}. Try: managed, led, developed...`
      : `Great use of action verbs: ${foundVerbs.slice(0,3).join(', ')}.`
  });

  // CHECK 7: Dates in experience (10 points)
  const expsWithDates = window.experiences ? window.experiences.filter(e => e.start || e.end).length : 0;
  const dateScore = expsWithDates >= 1 ? 10 : 0;
  results.checks.push({
    label: 'Employment Dates',
    score: dateScore,
    max: 10,
    status: dateScore >= 10 ? 'good' : 'bad',
    tip: dateScore < 10 ? 'Add start and end dates to your work experience.' : 'Dates found in experience.'
  });

  // Total score
  results.score = results.checks.reduce((sum, c) => sum + c.score, 0);

  // Keyword scan
  const allKeywords = [
    ...atsKeywordCategories['Action Verbs'],
    ...atsKeywordCategories['Technical Skills'],
    ...atsKeywordCategories['Soft Skills']
  ];
  results.keywords.found = allKeywords.filter(k => allText.includes(k)).slice(0, 12);
  results.keywords.missing = atsKeywordCategories['Action Verbs']
    .filter(k => !allText.includes(k)).slice(0, 6);

  return results;
}

// Get all resume text combined
function getAllResumeText() {
  const parts = [
    getVal('fullName'), getVal('jobTitle'), getVal('summary'),
    ...(window.skills || []),
    ...(window.experiences || []).map(e => `${e.title} ${e.company} ${e.desc}`),
    ...(window.educations || []).map(e => `${e.degree} ${e.school}`),
    ...(window.projects || []).map(p => `${p.name} ${p.desc}`)
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}

// ============================================================
// RENDER CHECKER PANEL
// ============================================================
function openCheckerPanel() {
  let panel = document.getElementById('checkerPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'checkerPanel';
    panel.innerHTML = `
      <div class="checker-header">
        <div class="checker-tabs">
          <button class="checker-tab active" onclick="showCheckerTab('spell', this)">Spell</button>
          <button class="checker-tab" onclick="showCheckerTab('ats', this)">ATS</button>
          <button class="checker-tab" onclick="showCheckerTab('health', this)">Health</button>
          <button class="checker-tab" onclick="showCheckerTab('match', this)" style="color:#c9a84c;">✦ AI</button>
        </div>
        <button class="checker-close" onclick="closeCheckerPanel()">✕</button>
      </div>
      <div class="checker-body" id="checkerBody"></div>
    `;
    panel.style.cssText = `
      position: fixed; right: 0; top: 52px; bottom: 0;
      width: 320px; background: #0d0d0d;
      border-left: 1px solid #1a1a1a;
      z-index: 200; display: flex; flex-direction: column;
      font-family: 'DM Sans', sans-serif;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    document.body.appendChild(panel);
    setTimeout(() => panel.style.transform = 'translateX(0)', 10);
  } else {
    panel.style.transform = 'translateX(0)';
  }

  // Inject styles if not present
  if (!document.getElementById('checkerStyles')) {
    const style = document.createElement('style');
    style.id = 'checkerStyles';
    style.textContent = `
      .checker-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0.8rem 1rem; border-bottom: 1px solid #1a1a1a; flex-shrink: 0;
      }
      .checker-tabs { display: flex; gap: 0; }
      .checker-tab {
        padding: 0.4rem 1rem; background: transparent; border: none;
        color: #444; font-family: 'Syne', sans-serif; font-size: 0.72rem;
        font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
        cursor: pointer; border-bottom: 2px solid transparent;
        transition: all 0.2s;
      }
      .checker-tab:hover { color: #888; }
      .checker-tab.active { color: #c9a84c; border-bottom-color: #c9a84c; }
      .checker-close {
        background: none; border: none; color: #444; font-size: 1rem;
        cursor: pointer; padding: 0.2rem 0.4rem; transition: color 0.2s;
      }
      .checker-close:hover { color: #fff; }
      .checker-body { flex: 1; overflow-y: auto; padding: 1rem; }
      .checker-body::-webkit-scrollbar { width: 4px; }
      .checker-body::-webkit-scrollbar-thumb { background: #2a2a2a; }

      .spell-error {
        background: #141414; border: 1px solid #1e1e1e;
        border-radius: 2px; padding: 0.8rem; margin-bottom: 0.6rem;
      }
      .spell-error-word { color: #ff8080; font-size: 0.85rem; font-weight: 500; }
      .spell-error-suggestion { color: #888; font-size: 0.78rem; margin-top: 0.2rem; }
      .spell-error-location { color: #444; font-size: 0.7rem; margin-top: 0.2rem; letter-spacing: 0.06em; text-transform: uppercase; }
      .spell-clear { color: #5a5; font-size: 0.85rem; text-align: center; padding: 1.5rem; }

      .ats-score-ring {
        text-align: center; padding: 1.5rem 1rem 1rem;
      }
      .ats-score-num {
        font-family: 'Syne', sans-serif; font-weight: 800;
        font-size: 3.5rem; line-height: 1;
      }
      .ats-score-num.good { color: #5cb85c; }
      .ats-score-num.warn { color: #c9a84c; }
      .ats-score-num.bad { color: #d9534f; }
      .ats-score-label { font-size: 0.72rem; color: #555; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 0.2rem; }
      .ats-score-bar {
        height: 4px; background: #1a1a1a; border-radius: 2px;
        margin: 0.8rem 0 1.5rem; overflow: hidden;
      }
      .ats-score-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }

      .ats-check {
        padding: 0.8rem; margin-bottom: 0.5rem;
        background: #141414; border: 1px solid #1e1e1e; border-radius: 2px;
      }
      .ats-check-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem; }
      .ats-check-label { font-size: 0.78rem; color: #aaa; font-family: 'Syne', sans-serif; font-weight: 600; }
      .ats-check-score { font-size: 0.72rem; font-family: 'Syne', sans-serif; font-weight: 700; }
      .ats-check-score.good { color: #5cb85c; }
      .ats-check-score.warn { color: #c9a84c; }
      .ats-check-score.bad { color: #d9534f; }
      .ats-check-bar { height: 3px; background: #1a1a1a; border-radius: 2px; margin-bottom: 0.4rem; overflow: hidden; }
      .ats-check-fill { height: 100%; border-radius: 2px; }
      .ats-check-fill.good { background: #5cb85c; }
      .ats-check-fill.warn { background: #c9a84c; }
      .ats-check-fill.bad { background: #d9534f; }
      .ats-check-tip { font-size: 0.75rem; color: #555; line-height: 1.5; }

      .ats-keywords-section { margin-top: 1.2rem; }
      .ats-keywords-title { font-family: 'Syne', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #444; margin-bottom: 0.6rem; }
      .keyword-tags { display: flex; flex-wrap: wrap; gap: 0.3rem; }
      .keyword-tag { padding: 0.2rem 0.5rem; border-radius: 2px; font-size: 0.72rem; }
      .keyword-found { background: rgba(92,184,92,0.1); border: 1px solid rgba(92,184,92,0.3); color: #5cb85c; }
      .keyword-missing { background: rgba(217,83,79,0.1); border: 1px solid rgba(217,83,79,0.2); color: #888; }
    `;
    document.head.appendChild(style);
  }

  showCheckerTab('spell', document.querySelector('.checker-tab'));
}

function closeCheckerPanel() {
  const panel = document.getElementById('checkerPanel');
  if (panel) panel.style.transform = 'translateX(100%)';
}

function showCheckerTab(tab, btn) {
  document.querySelectorAll('.checker-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const body = document.getElementById('checkerBody');

  if (tab === 'spell') {
    const errors = runSpellCheck();
    const browserTip = `
      <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.15);
        padding:0.8rem 1rem;margin-bottom:1rem;border-radius:2px;">
        <div style="font-family:'Syne',sans-serif;font-size:0.72rem;font-weight:700;
          color:#c9a84c;margin-bottom:0.3rem;">✦ Live Spell Check Active</div>
        <div style="font-size:0.75rem;color:#555;line-height:1.5;">
          Your browser checks spelling as you type. Red underlines mean misspelled words — right-click to fix them.
        </div>
      </div>
    `;
    if (errors.length === 0) {
      body.innerHTML = browserTip + `<div class="spell-clear">✅ No writing issues found!</div>`;
    } else {
      body.innerHTML = browserTip + errors.map(e => `
        <div class="spell-error">
          <div class="spell-error-word">⚠ ${e.word}</div>
          <div class="spell-error-suggestion">→ ${e.suggestion}</div>
          <div class="spell-error-location">${e.location}</div>
        </div>
      `).join('');
    }
  } else if (tab === 'ats') {
    const results = runATSCheck();
    const scoreClass = results.score >= 70 ? 'good' : results.score >= 40 ? 'warn' : 'bad';
    const fillColor = scoreClass === 'good' ? '#5cb85c' : scoreClass === 'warn' ? '#c9a84c' : '#d9534f';
    const scoreLabel = results.score >= 70 ? 'ATS Ready' : results.score >= 40 ? 'Needs Work' : 'Low Score';

    body.innerHTML = `
      <div class="ats-score-ring">
        <div class="ats-score-num ${scoreClass}">${results.score}</div>
        <div class="ats-score-label">${scoreLabel} · out of ${results.maxScore}</div>
        <div class="ats-score-bar">
          <div class="ats-score-fill" style="width:${results.score}%;background:${fillColor}"></div>
        </div>
      </div>
      ${results.checks.map(c => `
        <div class="ats-check">
          <div class="ats-check-header">
            <span class="ats-check-label">${c.label}</span>
            <span class="ats-check-score ${c.status}">${c.score}/${c.max}</span>
          </div>
          <div class="ats-check-bar">
            <div class="ats-check-fill ${c.status}" style="width:${(c.score/c.max)*100}%"></div>
          </div>
          <div class="ats-check-tip">${c.tip}</div>
        </div>
      `).join('')}
      <div class="ats-keywords-section">
        ${(typeof isPremiumActive === 'function' && isPremiumActive()) || localStorage.getItem('prime_dev') === 'true' ? `
          <div class="ats-keywords-title">✅ Keywords Found (${results.keywords.found.length})</div>
          <div class="keyword-tags">
            ${results.keywords.found.map(k => '<span class="keyword-tag keyword-found">'+k+'</span>').join('') || '<span style="color:#444;font-size:0.78rem">None found yet</span>'}
          </div>
          <div class="ats-keywords-title" style="margin-top:0.8rem">💡 Suggested Keywords</div>
          <div class="keyword-tags">
            ${results.keywords.missing.map(k => '<span class="keyword-tag keyword-missing">'+k+'</span>').join('')}
          </div>
        ` : `
          <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.15);padding:1rem;text-align:center;margin-top:0.8rem;">
            <div style="font-family:'Syne',sans-serif;font-size:0.72rem;font-weight:700;color:#c9a84c;margin-bottom:0.4rem;">🔒 Premium Feature</div>
            <div style="font-size:0.72rem;color:#555;margin-bottom:0.8rem;line-height:1.5">Keyword analysis unlocked with Premium</div>
            <a href="pricing.html" style="display:inline-block;background:#c9a84c;color:#000;padding:0.4rem 1rem;font-family:'Syne',sans-serif;font-size:0.68rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;">Upgrade →</a>
          </div>
        `}
      </div>
    `;
  } else if (tab === 'match') {
    renderJobMatchTab(body);
    return;
  } else {
    // HEALTH TAB
    const health = runHealthCheck();
    const passCount = health.filter(h => h.status === 'pass').length;
    const total = health.length;
    body.innerHTML = `
      <div style="padding:1rem 0 0.5rem;text-align:center;">
        <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:2rem;color:${passCount===total?'#5cb85c':passCount>=total*0.6?'#c9a84c':'#d9534f'}">${passCount}/${total}</div>
        <div style="font-size:0.7rem;color:#555;letter-spacing:0.1em;text-transform:uppercase;margin-top:0.2rem">Checks Passed</div>
      </div>
      <div style="margin-top:0.8rem">
        ${health.map(h => `
          <div style="display:flex;align-items:flex-start;gap:0.6rem;padding:0.7rem 0;border-bottom:1px solid #1a1a1a;">
            <span style="font-size:0.9rem;flex-shrink:0;margin-top:0.1rem">${h.status === 'pass' ? '✅' : h.status === 'warn' ? '⚠️' : '❌'}</span>
            <div>
              <div style="font-size:0.78rem;font-family:'Syne',sans-serif;font-weight:700;color:${h.status==='pass'?'#aaa':'#888'}">${h.label}</div>
              <div style="font-size:0.72rem;color:#555;margin-top:0.2rem;line-height:1.5">${h.tip}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// ============================================================
// HEALTH CHECK
// Simple checklist of resume best practices
// ============================================================
function runHealthCheck() {
  const checks = [];
  const name = getVal('fullName');
  const email = getVal('email');
  const phone = getVal('phone');
  const summary = getVal('summary');
  const jobTitle = getVal('jobTitle');
  const expCount = window.experiences ? window.experiences.filter(e => e.title && e.company).length : 0;
  const eduCount = window.educations ? window.educations.filter(e => e.degree || e.school).length : 0;
  const skillCount = window.skills ? window.skills.length : 0;
  const allText = getAllResumeText();

  // 1. Name
  checks.push({
    label: 'Full name added',
    status: name ? 'pass' : 'fail',
    tip: name ? 'Your name is on the resume.' : 'Add your full name at the top.'
  });

  // 2. Contact info
  const hasContact = email && phone;
  checks.push({
    label: 'Contact info complete',
    status: hasContact ? 'pass' : email || phone ? 'warn' : 'fail',
    tip: hasContact ? 'Email and phone found.' : 'Add both your email and phone number.'
  });

  // 3. Job title
  checks.push({
    label: 'Job title present',
    status: jobTitle ? 'pass' : 'warn',
    tip: jobTitle ? 'Job title found.' : 'Add a professional title below your name.'
  });

  // 4. Summary length
  checks.push({
    label: 'Summary is strong',
    status: summary.length > 100 ? 'pass' : summary.length > 0 ? 'warn' : 'fail',
    tip: summary.length > 100 ? 'Good summary length.' : 'Write at least 2-3 sentences in your summary.'
  });

  // 5. Work experience
  checks.push({
    label: 'Work experience added',
    status: expCount >= 2 ? 'pass' : expCount === 1 ? 'warn' : 'fail',
    tip: expCount >= 2 ? `${expCount} experiences found.` : expCount === 1 ? 'Consider adding more experience entries.' : 'No work experience added yet.'
  });

  // 6. Experience has descriptions
  const expsWithDesc = window.experiences ? window.experiences.filter(e => e.desc && e.desc.length > 30).length : 0;
  checks.push({
    label: 'Experience has descriptions',
    status: expsWithDesc >= 1 ? 'pass' : 'warn',
    tip: expsWithDesc >= 1 ? 'Good — your experience has detail.' : 'Add descriptions to your work experience entries.'
  });

  // 7. Education
  checks.push({
    label: 'Education added',
    status: eduCount >= 1 ? 'pass' : 'fail',
    tip: eduCount >= 1 ? 'Education found.' : 'Add at least one education entry.'
  });

  // 8. Skills
  checks.push({
    label: 'Skills section filled',
    status: skillCount >= 5 ? 'pass' : skillCount >= 1 ? 'warn' : 'fail',
    tip: skillCount >= 5 ? `${skillCount} skills listed. Good.` : `You have ${skillCount} skill(s). Add at least 5.`
  });

  // 9. Resume length — warn if too short
  const wordCount = allText.split(/\s+/).filter(Boolean).length;
  checks.push({
    label: 'Resume has enough content',
    status: wordCount >= 150 ? 'pass' : wordCount >= 80 ? 'warn' : 'fail',
    tip: wordCount >= 150 ? 'Good amount of content.' : 'Your resume looks thin. Add more detail to your experience.'
  });

  // 10. No phone number missing
  checks.push({
    label: 'Phone number present',
    status: phone ? 'pass' : 'fail',
    tip: phone ? 'Phone number found.' : 'Add your phone number so employers can reach you.'
  });

  return checks;
}

// ============================================================
// RENDER SERVER URL — update this with your actual Render URL
// ============================================================
const RENDER_URL = 'https://prime-resume-backend.vercel.app';

// ============================================================
// JOB MATCH TAB
// ============================================================
function renderJobMatchTab(body) {
  const isPremium = (typeof isPremiumActive === 'function' && isPremiumActive()) ||
    localStorage.getItem('prime_dev') === 'true';

  if (!isPremium) {
    body.innerHTML = `
      <div style="text-align:center;padding:2rem 1rem;">
        <div style="font-size:1.5rem;margin-bottom:0.8rem;">🔒</div>
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:0.88rem;
          color:#c9a84c;margin-bottom:0.5rem;">Premium Feature</div>
        <div style="font-size:0.78rem;color:#555;margin-bottom:1.2rem;line-height:1.6;">
          AI Job Match Analyzer is available for Premium users.
        </div>
        <a href="pricing.html" style="display:inline-block;background:#c9a84c;color:#000;
          padding:0.5rem 1.2rem;font-family:'Syne',sans-serif;font-size:0.72rem;
          font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
          text-decoration:none;border-radius:2px;">Upgrade →</a>
      </div>`;
    return;
  }

  body.innerHTML = `
    <div style="padding:0.5rem 0;">
      <div style="font-family:'Syne',sans-serif;font-size:0.72rem;font-weight:700;
        color:#c9a84c;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.5rem;">
        ✦ AI Job Match Analyzer
      </div>
      <div style="font-size:0.75rem;color:#555;margin-bottom:0.8rem;line-height:1.5;">
        Paste the job description below. AI will analyze how well your resume matches it.
      </div>
      <textarea id="jobDescInput" style="width:100%;background:#181818;border:1px solid #2a2a2a;
        color:#f5f2eb;font-family:'DM Sans',sans-serif;font-size:0.82rem;
        padding:0.7rem;outline:none;resize:vertical;min-height:120px;
        line-height:1.5;border-radius:2px;margin-bottom:0.6rem;"
        placeholder="Paste the job description here..."></textarea>
      <button onclick="runJobMatch()" id="jobMatchBtn"
        style="width:100%;background:#c9a84c;color:#000;border:none;
        padding:0.7rem;font-family:'Syne',sans-serif;font-weight:700;
        font-size:0.78rem;letter-spacing:0.08em;text-transform:uppercase;
        cursor:pointer;border-radius:2px;transition:background 0.2s;">
        ✦ Analyze Match
      </button>
      <div id="jobMatchResult" style="margin-top:0.8rem;"></div>
    </div>`;
}

async function runJobMatch() {
  const jobDesc = document.getElementById('jobDescInput')?.value.trim();
  if (!jobDesc) {
    if (typeof showToast === 'function') showToast('Please paste a job description first');
    return;
  }

  const btn = document.getElementById('jobMatchBtn');
  const resultDiv = document.getElementById('jobMatchResult');
  if (btn) { btn.disabled = true; btn.textContent = 'Analyzing...'; }

  // Build resume text summary
  const resumeText = [
    getVal('fullName'), getVal('jobTitle'), getVal('summary'),
    ...(window.skills || []),
    ...(window.experiences || []).map(e => `${e.title} ${e.company} ${e.desc}`),
    ...(window.educations || []).map(e => `${e.degree} ${e.school}`)
  ].filter(Boolean).join('\n');

  try {
    const response = await fetch(RENDER_URL + '/ai/job-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume: resumeText, jobDescription: jobDesc })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Server error');
    }

    const data = await response.json();
    const scoreColor = data.score >= 70 ? '#5cb85c' : data.score >= 40 ? '#c9a84c' : '#d9534f';

    resultDiv.innerHTML = `
      <div style="text-align:center;padding:1rem 0 0.5rem;">
        <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:2.5rem;
          color:${scoreColor};line-height:1;">${data.score}</div>
        <div style="font-size:0.68rem;color:#555;letter-spacing:0.1em;
          text-transform:uppercase;margin-top:0.2rem;">Match Score / 100</div>
        <div style="font-size:0.78rem;color:#888;margin-top:0.5rem;
          line-height:1.5;">${data.verdict}</div>
      </div>

      ${data.matching?.length ? `
        <div style="margin-top:0.8rem;">
          <div style="font-family:'Syne',sans-serif;font-size:0.68rem;font-weight:700;
            color:#5cb85c;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.4rem;">
            ✅ You Have (${data.matching.length})
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:0.3rem;">
            ${data.matching.map(k => `<span style="background:rgba(92,184,92,0.1);
              border:1px solid rgba(92,184,92,0.3);padding:0.2rem 0.5rem;
              border-radius:2px;font-size:0.7rem;color:#5cb85c;">${k}</span>`).join('')}
          </div>
        </div>` : ''}

      ${data.missing?.length ? `
        <div style="margin-top:0.8rem;">
          <div style="font-family:'Syne',sans-serif;font-size:0.68rem;font-weight:700;
            color:#d9534f;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.4rem;">
            ❌ Missing (${data.missing.length})
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:0.3rem;">
            ${data.missing.map(k => `<span style="background:rgba(217,83,79,0.1);
              border:1px solid rgba(217,83,79,0.2);padding:0.2rem 0.5rem;
              border-radius:2px;font-size:0.7rem;color:#d9534f;">${k}</span>`).join('')}
          </div>
        </div>` : ''}

      ${data.suggestions?.length ? `
        <div style="margin-top:0.8rem;">
          <div style="font-family:'Syne',sans-serif;font-size:0.68rem;font-weight:700;
            color:#c9a84c;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.4rem;">
            💡 Suggestions
          </div>
          ${data.suggestions.map(s => `
            <div style="font-size:0.75rem;color:#777;padding:0.4rem 0;
              border-bottom:1px solid #1a1a1a;line-height:1.5;">→ ${s}</div>
          `).join('')}
        </div>` : ''}
    `;

  } catch (err) {
    resultDiv.innerHTML = `<div style="color:#d9534f;font-size:0.78rem;
      padding:0.5rem;">❌ ${err.message}</div>`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✦ Analyze Match'; }
  }
}
