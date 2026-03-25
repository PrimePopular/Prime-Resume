// checker.js — Resume checking: Spell, ATS, Health, AI Job Match
// v8 IMPROVED — stronger ATS, better feedback, working AI match

const BACKEND_URL = 'https://prime-resume-backend.vercel.app';

// ============================================================
// SPELL / WRITING QUALITY CHECK
// ============================================================
function runSpellCheck() {
  const errors = [];
  const allText = [
    document.getElementById('summary')?.value || '',
    ...(window.experiences || []).map(e => e.desc || '')
  ].join(' ').toLowerCase();

  const weakPhrases = [
    { match: 'responsible for', fix: 'Use action verbs: "Managed", "Led", "Owned", "Delivered"' },
    { match: 'duties included', fix: 'Start with action verbs: "Developed", "Implemented", "Executed"' },
    { match: 'worked with', fix: 'Be specific: "Collaborated with 5-person team to ship..."' },
    { match: 'helped with', fix: 'Use stronger verbs: "Contributed to", "Supported", "Enabled"' },
    { match: 'assisted with', fix: 'Reframe: "Partnered with", "Co-developed", "Supported delivery of"' },
    { match: 'was responsible', fix: 'Remove "was responsible" — start with the action directly' },
    { match: 'i am ', fix: 'Remove "I" — write "Results-driven engineer" not "I am an engineer"' },
    { match: 'i have ', fix: 'Remove "I have" — write "5+ years experience" not "I have 5 years"' },
    { match: 'team player', fix: '"Team player" is overused — show teamwork with a specific example' },
    { match: 'hard worker', fix: '"Hard worker" is a claim, not evidence — prove it with numbers' },
    { match: 'detail oriented', fix: 'Show it: "Reduced errors by X%" instead of claiming "detail oriented"' },
    { match: 'motivated', fix: '"Motivated" is vague — replace with a measurable achievement' },
    { match: 'various', fix: 'Replace "various" with specifics — how many? which ones?' },
    { match: 'etc.', fix: 'Avoid "etc." — list everything relevant or cut it' },
    { match: 'references available', fix: 'Remove "references available upon request" — assumed standard' },
  ];

  weakPhrases.forEach(p => {
    if (allText.includes(p.match)) {
      errors.push({ word: `"${p.match}"`, suggestion: p.fix, location: 'Writing quality' });
    }
  });

  // Check for missing quantification in experience
  const hasNumbers = /\d+/.test(allText);
  if (!hasNumbers && allText.length > 100) {
    errors.push({
      word: 'No numbers or metrics found',
      suggestion: 'Add impact numbers: "Increased revenue by 30%", "Led team of 8", "Reduced time by 2 hours/week"',
      location: 'Impact strength'
    });
  }

  // Check summary length
  const summary = document.getElementById('summary')?.value.trim() || '';
  if (summary && summary.length < 80) {
    errors.push({
      word: 'Summary is too short',
      suggestion: 'Write 2–4 sentences covering: who you are, your top skill, and your goal. Aim for 100–250 characters.',
      location: 'Professional Summary'
    });
  }
  if (summary && summary.length > 600) {
    errors.push({
      word: 'Summary is too long',
      suggestion: 'Keep your summary under 4 sentences. Recruiters scan — not read.',
      location: 'Professional Summary'
    });
  }

  return errors;
}

// ============================================================
// ATS CHECKER — Comprehensive scoring
// ============================================================
const atsKeywordCategories = {
  'Action Verbs': [
    'managed','led','developed','created','designed','implemented','improved',
    'increased','reduced','achieved','delivered','built','launched','optimized',
    'analyzed','coordinated','collaborated','executed','established','generated',
    'maintained','resolved','streamlined','transformed','supervised','trained',
    'negotiated','spearheaded','overhauled','accelerated','automated','deployed',
    'engineered','facilitated','integrated','mentored','modernized','pioneered',
    'restructured','scaled','secured','standardized','unified','upgraded'
  ],
  'Technical Skills': [
    'python','javascript','java','sql','html','css','react','node','typescript',
    'aws','git','linux','docker','api','database','agile','scrum','figma',
    'machine learning','data analysis','cloud','security','network','kubernetes',
    'ci/cd','devops','rest','graphql','mongodb','postgresql','redis','terraform'
  ],
  'Soft Skills': [
    'leadership','communication','teamwork','problem-solving','analytical',
    'strategic','proactive','results-driven','cross-functional','stakeholder',
    'presentation','negotiation','mentoring','innovation','decision-making'
  ]
};

function runATSCheck() {
  const results = { score: 0, maxScore: 100, checks: [], keywords: { found: [], missing: [] } };
  const allText = getAllResumeText().toLowerCase();

  // CHECK 1: Contact information (15 pts)
  const hasEmail = !!getVal('email');
  const hasPhone = !!getVal('phone');
  const hasLocation = !!(getVal('city') || getVal('state'));
  const hasLinkedIn = !!getVal('linkedin');
  const contactScore = (hasEmail ? 5 : 0) + (hasPhone ? 5 : 0) + (hasLocation ? 3 : 0) + (hasLinkedIn ? 2 : 0);
  results.checks.push({
    label: 'Contact Information',
    score: contactScore, max: 15,
    status: contactScore >= 12 ? 'good' : contactScore >= 7 ? 'warn' : 'bad',
    tip: contactScore >= 15
      ? '✅ Complete contact info.'
      : `Missing: ${[!hasEmail && 'email', !hasPhone && 'phone', !hasLocation && 'location', !hasLinkedIn && 'LinkedIn'].filter(Boolean).join(', ')}`
  });

  // CHECK 2: Professional summary (15 pts)
  const summary = getVal('summary');
  const sWords = summary.trim().split(/\s+/).filter(Boolean).length;
  const summaryScore = sWords >= 40 ? 15 : sWords >= 20 ? 10 : sWords > 0 ? 5 : 0;
  results.checks.push({
    label: 'Professional Summary',
    score: summaryScore, max: 15,
    status: summaryScore >= 15 ? 'good' : summaryScore >= 5 ? 'warn' : 'bad',
    tip: summaryScore >= 15
      ? '✅ Strong summary found.'
      : sWords === 0
        ? '❌ No summary. Write 2–4 sentences that hook the recruiter immediately.'
        : `⚠️ Summary too short (${sWords} words). Aim for 40–80 words.`
  });

  // CHECK 3: Work experience quantity + quality (20 pts)
  const expsWithContent = (window.experiences || []).filter(e => e.title && e.company && e.desc);
  const expsTotal = (window.experiences || []).filter(e => e.title && e.company).length;
  const expScore = expsWithContent.length >= 2 ? 20 : expsWithContent.length >= 1 ? 13 : expsTotal >= 1 ? 7 : 0;
  results.checks.push({
    label: 'Work Experience Quality',
    score: expScore, max: 20,
    status: expScore >= 20 ? 'good' : expScore >= 7 ? 'warn' : 'bad',
    tip: expScore >= 20
      ? '✅ Multiple experiences with descriptions.'
      : expsTotal === 0
        ? '❌ No work experience added.'
        : expsWithContent.length === 0
          ? '⚠️ Add descriptions to your experience entries — blank entries score low.'
          : '⚠️ Add at least 2 experience entries with detailed descriptions.'
  });

  // CHECK 4: Education (10 pts)
  const eduCount = (window.educations || []).filter(e => e.degree && e.school).length;
  const eduScore = eduCount >= 1 ? 10 : 0;
  results.checks.push({
    label: 'Education',
    score: eduScore, max: 10,
    status: eduScore >= 10 ? 'good' : 'bad',
    tip: eduScore >= 10 ? '✅ Education found.' : '❌ Add your degree and institution.'
  });

  // CHECK 5: Skills breadth (15 pts)
  const skillCount = (window.skills || []).length;
  const skillScore = skillCount >= 8 ? 15 : skillCount >= 5 ? 11 : skillCount >= 3 ? 7 : skillCount >= 1 ? 3 : 0;
  results.checks.push({
    label: 'Skills Section',
    score: skillScore, max: 15,
    status: skillScore >= 15 ? 'good' : skillScore >= 7 ? 'warn' : 'bad',
    tip: skillScore >= 15
      ? `✅ ${skillCount} skills listed.`
      : `⚠️ You have ${skillCount} skill${skillCount !== 1 ? 's' : ''}. Aim for 8–12. Include tools, languages, frameworks, methodologies.`
  });

  // CHECK 6: Action verbs + impact language (15 pts)
  const verbs = atsKeywordCategories['Action Verbs'];
  const foundVerbs = verbs.filter(v => allText.includes(v));
  const hasMetrics = /\d+\s*(%|percent|million|thousand|k\b|\$|users|clients|team|project)/i.test(allText);
  const verbScore = (foundVerbs.length >= 6 ? 10 : foundVerbs.length >= 3 ? 6 : foundVerbs.length >= 1 ? 3 : 0)
    + (hasMetrics ? 5 : 0);
  results.checks.push({
    label: 'Action Verbs & Impact Numbers',
    score: Math.min(verbScore, 15), max: 15,
    status: verbScore >= 13 ? 'good' : verbScore >= 6 ? 'warn' : 'bad',
    tip: verbScore >= 13
      ? `✅ Strong action language with metrics.`
      : !hasMetrics
        ? `⚠️ Add numbers to achievements — "Reduced load time by 40%", "Led team of 8". Found ${foundVerbs.length} action verbs.`
        : `⚠️ Use more action verbs. Found: ${foundVerbs.slice(0,3).join(', ') || 'none'}. Try: led, built, delivered, improved.`
  });

  // CHECK 7: Dates and completeness (10 pts)
  const expsWithDates = (window.experiences || []).filter(e => e.start).length;
  const hasJobTitle = !!getVal('jobTitle');
  const dateScore = (expsWithDates >= 1 ? 6 : 0) + (hasJobTitle ? 4 : 0);
  results.checks.push({
    label: 'Completeness & Dates',
    score: dateScore, max: 10,
    status: dateScore >= 10 ? 'good' : dateScore >= 6 ? 'warn' : 'bad',
    tip: dateScore >= 10
      ? '✅ Job title and dates present.'
      : `Missing: ${[!hasJobTitle && 'job title', expsWithDates === 0 && 'employment dates'].filter(Boolean).join(', ')}`
  });

  results.score = results.checks.reduce((s, c) => s + c.score, 0);

  // Keyword scan
  const allKw = [...atsKeywordCategories['Action Verbs'], ...atsKeywordCategories['Technical Skills'], ...atsKeywordCategories['Soft Skills']];
  results.keywords.found = allKw.filter(k => allText.includes(k)).slice(0, 14);
  results.keywords.missing = atsKeywordCategories['Action Verbs'].filter(k => !allText.includes(k)).slice(0, 8);

  return results;
}

// ============================================================
// HEALTH CHECK
// ============================================================
function runHealthCheck() {
  const checks = [];
  const name = getVal('fullName');
  const email = getVal('email');
  const phone = getVal('phone');
  const summary = getVal('summary');
  const jobTitle = getVal('jobTitle');
  const linkedin = getVal('linkedin');
  const website = getVal('website');
  const expCount = (window.experiences || []).filter(e => e.title && e.company).length;
  const expWithDesc = (window.experiences || []).filter(e => e.desc && e.desc.length > 20).length;
  const eduCount = (window.educations || []).filter(e => e.degree || e.school).length;
  const skillCount = (window.skills || []).length;
  const projCount = (window.projects || []).filter(p => p.name).length;
  const allText = getAllResumeText();
  const wordCount = allText.split(/\s+/).filter(Boolean).length;
  const hasMetrics = /\d+/.test(allText);

  checks.push({ label: 'Full name added', status: name ? 'pass' : 'fail', tip: name ? 'Name found.' : 'Add your full name.' });
  checks.push({ label: 'Job title present', status: jobTitle ? 'pass' : 'warn', tip: jobTitle ? 'Job title found.' : 'Add a professional title — helps ATS categorise you.' });
  checks.push({ label: 'Email address', status: email ? 'pass' : 'fail', tip: email ? 'Email found.' : 'Add your email address.' });
  checks.push({ label: 'Phone number', status: phone ? 'pass' : 'fail', tip: phone ? 'Phone found.' : 'Add your phone number.' });
  checks.push({ label: 'LinkedIn profile', status: linkedin ? 'pass' : 'warn', tip: linkedin ? 'LinkedIn found.' : 'Add your LinkedIn URL — 87% of recruiters check it.' });
  checks.push({ label: 'Professional summary', status: summary.length > 80 ? 'pass' : summary.length > 0 ? 'warn' : 'fail', tip: summary.length > 80 ? 'Good summary.' : 'Write a 2–4 sentence summary at the top.' });
  checks.push({ label: 'Work experience added', status: expCount >= 2 ? 'pass' : expCount >= 1 ? 'warn' : 'fail', tip: expCount >= 2 ? `${expCount} jobs found.` : expCount === 1 ? 'Good start — add more if you have them.' : 'No experience added yet.' });
  checks.push({ label: 'Experience has descriptions', status: expWithDesc >= expCount && expCount > 0 ? 'pass' : expWithDesc >= 1 ? 'warn' : 'fail', tip: expWithDesc >= 1 ? 'Descriptions found.' : 'Add bullet points to your experience entries.' });
  checks.push({ label: 'Metrics in experience', status: hasMetrics ? 'pass' : 'warn', tip: hasMetrics ? 'Numbers found — good impact language.' : 'Add measurable results: "Grew sales 30%", "Led team of 6".' });
  checks.push({ label: 'Education added', status: eduCount >= 1 ? 'pass' : 'warn', tip: eduCount >= 1 ? 'Education found.' : 'Add your highest degree even if years ago.' });
  checks.push({ label: 'Skills filled (5+)', status: skillCount >= 5 ? 'pass' : skillCount >= 1 ? 'warn' : 'fail', tip: skillCount >= 5 ? `${skillCount} skills listed.` : `${skillCount} skill(s). Add at least 5 relevant skills.` });
  checks.push({ label: 'Projects section', status: projCount >= 1 ? 'pass' : 'warn', tip: projCount >= 1 ? `${projCount} project(s) found.` : 'Add projects to show real-world work — especially important for entry-level.' });
  checks.push({ label: 'Resume has enough content', status: wordCount >= 200 ? 'pass' : wordCount >= 100 ? 'warn' : 'fail', tip: wordCount >= 200 ? 'Good content length.' : `Only ${wordCount} words. Add more detail — aim for 300+.` });
  checks.push({ label: 'Portfolio / website', status: website ? 'pass' : 'warn', tip: website ? 'Portfolio link found.' : 'Optional: add GitHub, portfolio, or personal site.' });

  return checks;
}

// ============================================================
// HELPERS
// ============================================================
function getAllResumeText() {
  const parts = [
    getVal('fullName'), getVal('jobTitle'), getVal('summary'),
    ...(window.skills || []),
    ...(window.experiences || []).map(e => `${e.title} ${e.company} ${e.desc}`),
    ...(window.educations || []).map(e => `${e.degree} ${e.school}`),
    ...(window.projects || []).map(p => `${p.name} ${p.desc}`)
  ];
  return parts.filter(Boolean).join(' ');
}

// ============================================================
// CHECKER PANEL UI
// ============================================================
function openCheckerPanel() {
  let panel = document.getElementById('checkerPanel');

  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'checkerPanel';
    panel.innerHTML = `
      <div class="checker-header">
        <div class="checker-tabs">
          <button class="checker-tab active" onclick="showCheckerTab('spell', this)">✏️ Writing</button>
          <button class="checker-tab" onclick="showCheckerTab('ats', this)">📊 ATS</button>
          <button class="checker-tab" onclick="showCheckerTab('health', this)">🩺 Health</button>
          <button class="checker-tab checker-tab-ai" onclick="showCheckerTab('match', this)">✦ AI Match</button>
        </div>
        <button class="checker-close" onclick="closeCheckerPanel()">✕</button>
      </div>
      <div class="checker-body" id="checkerBody"></div>
    `;
    panel.style.cssText = `
      position:fixed;right:0;top:52px;bottom:0;width:340px;
      background:#0d0d0d;border-left:1px solid #1a1a1a;
      z-index:200;display:flex;flex-direction:column;
      font-family:'DM Sans',sans-serif;
      transform:translateX(100%);transition:transform 0.3s ease;
    `;
    document.body.appendChild(panel);
    setTimeout(() => panel.style.transform = 'translateX(0)', 10);
  } else {
    panel.style.transform = 'translateX(0)';
  }

  if (!document.getElementById('checkerStyles')) {
    const style = document.createElement('style');
    style.id = 'checkerStyles';
    style.textContent = `
      .checker-header{display:flex;align-items:center;justify-content:space-between;padding:0.8rem 1rem;border-bottom:1px solid #1a1a1a;flex-shrink:0;}
      .checker-tabs{display:flex;gap:0;flex-wrap:wrap;}
      .checker-tab{padding:0.35rem 0.7rem;background:transparent;border:none;color:#444;font-family:'Syne',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;}
      .checker-tab:hover{color:#888;}
      .checker-tab.active{color:#c9a84c;border-bottom-color:#c9a84c;}
      .checker-tab-ai{color:#555;}
      .checker-tab-ai.active{color:#c9a84c;}
      .checker-close{background:none;border:none;color:#444;font-size:1rem;cursor:pointer;padding:0.2rem 0.4rem;transition:color 0.2s;flex-shrink:0;}
      .checker-close:hover{color:#fff;}
      .checker-body{flex:1;overflow-y:auto;padding:1rem;}
      .checker-body::-webkit-scrollbar{width:4px;}
      .checker-body::-webkit-scrollbar-thumb{background:#2a2a2a;}

      .chk-card{background:#141414;border:1px solid #1e1e1e;border-radius:3px;padding:0.8rem;margin-bottom:0.6rem;}
      .chk-word{color:#ff8080;font-size:0.85rem;font-weight:600;margin-bottom:0.2rem;}
      .chk-fix{color:#777;font-size:0.78rem;line-height:1.5;}
      .chk-loc{color:#444;font-size:0.68rem;margin-top:0.2rem;text-transform:uppercase;letter-spacing:0.06em;}
      .chk-ok{color:#5cb85c;font-size:0.85rem;text-align:center;padding:1.5rem;}

      .ats-score-wrap{text-align:center;padding:1.2rem 1rem 0.8rem;}
      .ats-score-num{font-family:'Syne',sans-serif;font-weight:800;font-size:3.5rem;line-height:1;}
      .ats-score-num.good{color:#5cb85c;} .ats-score-num.warn{color:#c9a84c;} .ats-score-num.bad{color:#d9534f;}
      .ats-score-label{font-size:0.7rem;color:#555;letter-spacing:0.1em;text-transform:uppercase;margin-top:0.2rem;}
      .ats-bar{height:4px;background:#1a1a1a;border-radius:2px;margin:0.8rem 0 1.2rem;overflow:hidden;}
      .ats-bar-fill{height:100%;border-radius:2px;transition:width 0.6s ease;}

      .ats-check{padding:0.7rem;margin-bottom:0.4rem;background:#141414;border:1px solid #1e1e1e;border-radius:3px;}
      .ats-check-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;}
      .ats-check-label{font-size:0.75rem;color:#aaa;font-family:'Syne',sans-serif;font-weight:600;}
      .ats-check-score{font-size:0.7rem;font-family:'Syne',sans-serif;font-weight:700;}
      .ats-check-score.good{color:#5cb85c;} .ats-check-score.warn{color:#c9a84c;} .ats-check-score.bad{color:#d9534f;}
      .ats-check-bar{height:3px;background:#1a1a1a;border-radius:2px;margin-bottom:0.35rem;overflow:hidden;}
      .ats-check-fill{height:100%;border-radius:2px;}
      .ats-check-fill.good{background:#5cb85c;} .ats-check-fill.warn{background:#c9a84c;} .ats-check-fill.bad{background:#d9534f;}
      .ats-check-tip{font-size:0.73rem;color:#666;line-height:1.5;}

      .kw-section{margin-top:1rem;}
      .kw-title{font-family:'Syne',sans-serif;font-size:0.68rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#555;margin-bottom:0.5rem;}
      .kw-tags{display:flex;flex-wrap:wrap;gap:0.25rem;}
      .kw-tag{padding:0.18rem 0.5rem;border-radius:2px;font-size:0.7rem;}
      .kw-found{background:rgba(92,184,92,0.1);border:1px solid rgba(92,184,92,0.3);color:#5cb85c;}
      .kw-miss{background:rgba(217,83,79,0.08);border:1px solid rgba(217,83,79,0.15);color:#888;}

      .health-score{text-align:center;padding:1rem 0 0.5rem;}
      .health-score-num{font-family:'Syne',sans-serif;font-weight:800;font-size:2.2rem;}
      .health-score-label{font-size:0.68rem;color:#555;letter-spacing:0.1em;text-transform:uppercase;margin-top:0.2rem;}
      .health-item{display:flex;align-items:flex-start;gap:0.5rem;padding:0.6rem 0;border-bottom:1px solid #1a1a1a;}
      .health-icon{font-size:0.85rem;flex-shrink:0;margin-top:0.1rem;}
      .health-label{font-size:0.78rem;font-family:'Syne',sans-serif;font-weight:700;color:#aaa;}
      .health-tip{font-size:0.72rem;color:#555;margin-top:0.15rem;line-height:1.5;}

      .ai-match-wrap{padding:0.4rem 0;}
      .ai-match-title{font-family:'Syne',sans-serif;font-size:0.72rem;font-weight:700;color:#c9a84c;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.4rem;}
      .ai-match-desc{font-size:0.75rem;color:#555;margin-bottom:0.8rem;line-height:1.5;}
      #jobDescInput{width:100%;background:#181818;border:1px solid #2a2a2a;color:#f5f2eb;font-family:'DM Sans',sans-serif;font-size:0.82rem;padding:0.7rem;outline:none;resize:vertical;min-height:110px;line-height:1.5;border-radius:2px;margin-bottom:0.6rem;transition:border-color 0.2s;}
      #jobDescInput:focus{border-color:#c9a84c;}
      .ai-match-btn{width:100%;background:#c9a84c;color:#000;border:none;padding:0.7rem;font-family:'Syne',sans-serif;font-weight:700;font-size:0.78rem;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;border-radius:2px;transition:background 0.2s;}
      .ai-match-btn:hover{background:#e8c96a;}
      .ai-match-btn:disabled{background:#2a2a2a;color:#555;cursor:not-allowed;}

      .match-result-score{text-align:center;padding:1rem 0 0.5rem;}
      .match-result-num{font-family:'Syne',sans-serif;font-weight:800;font-size:2.5rem;line-height:1;}
      .match-result-label{font-size:0.68rem;color:#555;letter-spacing:0.1em;text-transform:uppercase;margin-top:0.2rem;}
      .match-verdict{font-size:0.78rem;color:#888;margin-top:0.5rem;line-height:1.5;}
      .match-section-title{font-family:'Syne',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0.8rem 0 0.35rem;}
      .match-tags{display:flex;flex-wrap:wrap;gap:0.25rem;}
      .match-tag-good{background:rgba(92,184,92,0.1);border:1px solid rgba(92,184,92,0.3);padding:0.18rem 0.5rem;border-radius:2px;font-size:0.7rem;color:#5cb85c;}
      .match-tag-miss{background:rgba(217,83,79,0.08);border:1px solid rgba(217,83,79,0.15);padding:0.18rem 0.5rem;border-radius:2px;font-size:0.7rem;color:#d9534f;}
      .match-suggestion{font-size:0.75rem;color:#777;padding:0.35rem 0;border-bottom:1px solid #1a1a1a;line-height:1.5;}

      .premium-gate{background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.15);padding:1.2rem;text-align:center;margin-top:0.8rem;border-radius:3px;}
      .premium-gate-icon{font-size:1.4rem;margin-bottom:0.6rem;}
      .premium-gate-title{font-family:'Syne',sans-serif;font-size:0.78rem;font-weight:700;color:#c9a84c;margin-bottom:0.4rem;}
      .premium-gate-desc{font-size:0.73rem;color:#555;margin-bottom:0.8rem;line-height:1.5;}
      .premium-gate-btn{display:inline-block;background:#c9a84c;color:#000;padding:0.45rem 1.1rem;font-family:'Syne',sans-serif;font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;border-radius:2px;}
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
  if (btn) btn.classList.add('active');
  const body = document.getElementById('checkerBody');

  if (tab === 'spell') {
    const errors = runSpellCheck();
    const tip = `<div class="chk-card" style="border-color:rgba(201,168,76,0.2);margin-bottom:1rem;">
      <div style="font-family:'Syne',sans-serif;font-size:0.72rem;font-weight:700;color:#c9a84c;margin-bottom:0.25rem;">✦ Live browser spell check active</div>
      <div style="font-size:0.73rem;color:#555;line-height:1.5;">Red underlines = misspelled words. Right-click any underlined word to fix it instantly.</div>
    </div>`;
    if (errors.length === 0) {
      body.innerHTML = tip + `<div class="chk-ok">✅ No writing issues found!<br/><span style="font-size:0.72rem;color:#555;display:block;margin-top:0.3rem;">Your writing quality looks solid.</span></div>`;
    } else {
      body.innerHTML = tip + errors.map(e => `
        <div class="chk-card">
          <div class="chk-word">⚠ ${e.word}</div>
          <div class="chk-fix">→ ${e.suggestion}</div>
          <div class="chk-loc">${e.location}</div>
        </div>`).join('');
    }

  } else if (tab === 'ats') {
    const r = runATSCheck();
    const sc = r.score >= 70 ? 'good' : r.score >= 40 ? 'warn' : 'bad';
    const fill = sc === 'good' ? '#5cb85c' : sc === 'warn' ? '#c9a84c' : '#d9534f';
    const label = r.score >= 80 ? 'ATS Ready ✅' : r.score >= 60 ? 'Almost There' : r.score >= 40 ? 'Needs Work' : 'Low Score';
    const isPremium = (typeof isPremiumActive === 'function' && isPremiumActive()) || localStorage.getItem('prime_dev') === 'true';

    body.innerHTML = `
      <div class="ats-score-wrap">
        <div class="ats-score-num ${sc}">${r.score}</div>
        <div class="ats-score-label">${label} · out of ${r.maxScore}</div>
        <div class="ats-bar"><div class="ats-bar-fill" style="width:${r.score}%;background:${fill}"></div></div>
      </div>
      ${r.checks.map(c => `
        <div class="ats-check">
          <div class="ats-check-head">
            <span class="ats-check-label">${c.label}</span>
            <span class="ats-check-score ${c.status}">${c.score}/${c.max}</span>
          </div>
          <div class="ats-check-bar"><div class="ats-check-fill ${c.status}" style="width:${(c.score/c.max)*100}%"></div></div>
          <div class="ats-check-tip">${c.tip}</div>
        </div>`).join('')}
      <div class="kw-section">
        ${isPremium ? `
          <div class="kw-title">✅ Keywords Found (${r.keywords.found.length})</div>
          <div class="kw-tags">${r.keywords.found.map(k => `<span class="kw-tag kw-found">${k}</span>`).join('') || '<span style="color:#444;font-size:0.75rem">None yet</span>'}</div>
          <div class="kw-title" style="margin-top:0.8rem">💡 Missing Keywords</div>
          <div class="kw-tags">${r.keywords.missing.map(k => `<span class="kw-tag kw-miss">${k}</span>`).join('')}</div>
        ` : `
          <div class="premium-gate">
            <div class="premium-gate-icon">🔒</div>
            <div class="premium-gate-title">Keyword Analysis — Premium</div>
            <div class="premium-gate-desc">See exactly which keywords your resume is missing compared to your target job. Unlock with Premium.</div>
            <a href="pricing.html" class="premium-gate-btn">Upgrade →</a>
          </div>
        `}
      </div>`;

  } else if (tab === 'health') {
    const checks = runHealthCheck();
    const passed = checks.filter(c => c.status === 'pass').length;
    const total = checks.length;
    const pct = Math.round((passed / total) * 100);
    const color = pct >= 80 ? '#5cb85c' : pct >= 55 ? '#c9a84c' : '#d9534f';
    body.innerHTML = `
      <div class="health-score">
        <div class="health-score-num" style="color:${color}">${passed}/${total}</div>
        <div class="health-score-label">Checks Passed · ${pct}%</div>
      </div>
      <div style="height:4px;background:#1a1a1a;border-radius:2px;margin:0.5rem 0 1.2rem;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${color};border-radius:2px;transition:width 0.6s"></div>
      </div>
      ${checks.map(c => `
        <div class="health-item">
          <span class="health-icon">${c.status === 'pass' ? '✅' : c.status === 'warn' ? '⚠️' : '❌'}</span>
          <div>
            <div class="health-label">${c.label}</div>
            <div class="health-tip">${c.tip}</div>
          </div>
        </div>`).join('')}`;

  } else if (tab === 'match') {
    renderJobMatchTab(body);
  }
}

// ============================================================
// AI JOB MATCH — calls Gemini via backend
// ============================================================
function renderJobMatchTab(body) {
  const isPremium = (typeof isPremiumActive === 'function' && isPremiumActive()) ||
    localStorage.getItem('prime_dev') === 'true';

  if (!isPremium) {
    body.innerHTML = `
      <div class="premium-gate" style="margin-top:1rem;">
        <div class="premium-gate-icon">✦</div>
        <div class="premium-gate-title">AI Job Match Analyzer</div>
        <div class="premium-gate-desc">Paste any job description. AI scores your match, shows what keywords you're missing, and gives improvement tips. Premium feature.</div>
        <a href="pricing.html" class="premium-gate-btn">Upgrade for $3 →</a>
      </div>`;
    return;
  }

  body.innerHTML = `
    <div class="ai-match-wrap">
      <div class="ai-match-title">✦ AI Job Match Analyzer</div>
      <div class="ai-match-desc">Paste the job description below. AI will score your resume match and show exactly what to improve.</div>
      <textarea id="jobDescInput" placeholder="Paste the job description here..."></textarea>
      <button class="ai-match-btn" id="jobMatchBtn" onclick="runJobMatch()">✦ Analyze Match</button>
      <div id="jobMatchResult" style="margin-top:0.8rem;"></div>
    </div>`;
}

async function runJobMatch() {
  const jobDesc = document.getElementById('jobDescInput')?.value.trim();
  if (!jobDesc || jobDesc.length < 30) {
    if (typeof showToast === 'function') showToast('Paste a job description first (at least a few lines)');
    return;
  }

  const btn = document.getElementById('jobMatchBtn');
  const resultDiv = document.getElementById('jobMatchResult');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Analyzing...'; }
  if (resultDiv) resultDiv.innerHTML = `<div style="color:#555;font-size:0.78rem;padding:0.8rem 0;text-align:center;">Analyzing your resume against the job description...<br/><span style="font-size:0.68rem;opacity:0.6;">This takes 5–10 seconds</span></div>`;

  const resumeText = [
    getVal('fullName'), getVal('jobTitle'), getVal('summary'),
    ...(window.skills || []),
    ...(window.experiences || []).map(e => `${e.title} ${e.company} ${e.desc}`),
    ...(window.educations || []).map(e => `${e.degree} ${e.school}`),
    ...(window.projects || []).map(p => `${p.name} ${p.desc}`)
  ].filter(Boolean).join('\n');

  if (!resumeText || resumeText.trim().length < 20) {
    if (btn) { btn.disabled = false; btn.textContent = '✦ Analyze Match'; }
    if (resultDiv) resultDiv.innerHTML = `<div style="color:#d9534f;font-size:0.78rem;padding:0.5rem;">❌ Fill in your resume details first, then analyze.</div>`;
    return;
  }

  try {
    const response = await fetch(BACKEND_URL + '/ai/job-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume: resumeText, jobDescription: jobDesc })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Server error' }));
      throw new Error(err.error || `Server error ${response.status}`);
    }

    const data = await response.json();
    const scoreColor = data.score >= 70 ? '#5cb85c' : data.score >= 45 ? '#c9a84c' : '#d9534f';
    const scoreLabel = data.score >= 70 ? 'Strong Match' : data.score >= 45 ? 'Partial Match' : 'Weak Match';

    resultDiv.innerHTML = `
      <div class="match-result-score">
        <div class="match-result-num" style="color:${scoreColor}">${data.score}</div>
        <div class="match-result-label">${scoreLabel} · out of 100</div>
        <div class="match-verdict">${data.verdict || ''}</div>
      </div>
      ${data.matching?.length ? `
        <div class="match-section-title" style="color:#5cb85c;">✅ You Have (${data.matching.length})</div>
        <div class="match-tags">${data.matching.map(k => `<span class="match-tag-good">${k}</span>`).join('')}</div>` : ''}
      ${data.missing?.length ? `
        <div class="match-section-title" style="color:#d9534f;">❌ You're Missing (${data.missing.length})</div>
        <div class="match-tags">${data.missing.map(k => `<span class="match-tag-miss">${k}</span>`).join('')}</div>` : ''}
      ${data.suggestions?.length ? `
        <div class="match-section-title" style="color:#c9a84c;">💡 Suggestions</div>
        ${data.suggestions.map(s => `<div class="match-suggestion">→ ${s}</div>`).join('')}` : ''}
      <div style="margin-top:1rem;text-align:center;">
        <button class="ai-match-btn" onclick="renderJobMatchTab(document.getElementById('checkerBody'))" style="background:transparent;border:1px solid #2a2a2a;color:#888;font-size:0.68rem;padding:0.4rem 0.8rem;">↺ Analyze Again</button>
      </div>`;

  } catch (err) {
    resultDiv.innerHTML = `
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;padding:1rem;border-radius:3px;margin-top:0.5rem;">
        <div style="color:#d9534f;font-size:0.78rem;margin-bottom:0.5rem;">❌ ${err.message}</div>
        <div style="color:#555;font-size:0.72rem;line-height:1.5;">The AI backend may be temporarily unavailable. Try again in a moment.</div>
      </div>`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✦ Analyze Match'; }
  }
}
