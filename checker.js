// checker.js — One job: Spell check and ATS scoring for the resume
// NEVER put preview or export logic here.

// ============================================================
// SPELL CHECKER
// Basic common misspelling dictionary
// ============================================================
const commonMisspellings = {
  'managment': 'management', 'managament': 'management',
  'recieve': 'receive', 'beleive': 'believe',
  'occured': 'occurred', 'occurance': 'occurrence',
  'seperete': 'separate', 'seperate': 'separate',
  'definately': 'definitely', 'definitly': 'definitely',
  'relavant': 'relevant', 'relevent': 'relevant',
  'experiance': 'experience', 'expirience': 'experience',
  'knowlegde': 'knowledge', 'knowledgeable': 'knowledgeable',
  'responsable': 'responsible', 'responsibilty': 'responsibility',
  'acheive': 'achieve', 'achive': 'achieve',
  'devlop': 'develop', 'developement': 'development',
  'impliment': 'implement', 'implementaion': 'implementation',
  'maintanance': 'maintenance', 'maintenence': 'maintenance',
  'comunication': 'communication', 'communcation': 'communication',
  'colaberate': 'collaborate', 'colaborate': 'collaborate',
  'profeesional': 'professional', 'proffesional': 'professional',
  'techincal': 'technical', 'tecnical': 'technical',
  'analize': 'analyze', 'analysise': 'analysis',
  'stratagey': 'strategy', 'startegy': 'strategy',
  'leadrship': 'leadership', 'leadershp': 'leadership',
  'performace': 'performance', 'performnce': 'performance',
  'sucesful': 'successful', 'successfull': 'successful',
  'achivement': 'achievement', 'acheivement': 'achievement',
  'compitent': 'competent', 'competance': 'competence',
  'enviroment': 'environment', 'enviorment': 'environment',
  'organistion': 'organization', 'organsation': 'organization',
  'calender': 'calendar', 'reccomend': 'recommend',
  'accomodate': 'accommodate', 'begining': 'beginning',
  'bussiness': 'business', 'buisness': 'business',
  'carreer': 'career', 'carrer': 'career',
  'colaboration': 'collaboration', 'comittee': 'committee',
  'copywrite': 'copyright', 'critisism': 'criticism',
  'desicion': 'decision', 'dilemna': 'dilemma',
  'entreprenuer': 'entrepreneur', 'excede': 'exceed',
  'faciliate': 'facilitate', 'finacial': 'financial',
  'fourm': 'forum', 'frequecy': 'frequency',
  'gaurantee': 'guarantee', 'grammer': 'grammar',
  'hierachy': 'hierarchy', 'idependant': 'independent',
  'inovation': 'innovation', 'intergrate': 'integrate',
  'liason': 'liaison', 'lisence': 'license',
  'maintian': 'maintain', 'millenium': 'millennium',
  'necesary': 'necessary', 'negotation': 'negotiation',
  'occassion': 'occasion', 'oppertunity': 'opportunity',
  'optimise': 'optimize', 'organise': 'organize',
  'paralel': 'parallel', 'percieve': 'perceive',
  'persistance': 'persistence', 'posistion': 'position',
  'prefered': 'preferred', 'privelege': 'privilege',
  'proactive': 'proactive', 'proceedure': 'procedure',
  'profesional': 'professional', 'programing': 'programming',
  'programe': 'program', 'reccomendation': 'recommendation',
  'referal': 'referral', 'reserch': 'research',
  'resourse': 'resource', 'schedual': 'schedule',
  'sieze': 'seize', 'similer': 'similar',
  'specialize': 'specialize', 'stategy': 'strategy',
  'strenght': 'strength', 'sucessful': 'successful',
  'sumerize': 'summarize', 'supervison': 'supervision',
  'tecnology': 'technology', 'temporery': 'temporary',
  'transfered': 'transferred', 'untill': 'until',
  'usefull': 'useful', 'utilise': 'utilize',
  'writting': 'writing', 'yrs': 'years'
};

function runSpellCheck() {
  const errors = [];
  const fieldsToCheck = [
    { id: 'summary', label: 'Summary' },
    { id: 'fullName', label: 'Name' },
    { id: 'jobTitle', label: 'Job Title' }
  ];

  // Check static fields
  fieldsToCheck.forEach(field => {
    const el = document.getElementById(field.id);
    if (!el || !el.value.trim()) return;
    const words = el.value.split(/\s+/);
    words.forEach(word => {
      const clean = word.toLowerCase().replace(/[^a-z]/g, '');
      if (commonMisspellings[clean]) {
        errors.push({
          word: word,
          suggestion: commonMisspellings[clean],
          location: field.label
        });
      }
    });
  });

  // Check experience descriptions
  if (window.experiences) {
    window.experiences.forEach((exp, i) => {
      if (!exp.desc) return;
      const words = exp.desc.split(/\s+/);
      words.forEach(word => {
        const clean = word.toLowerCase().replace(/[^a-z]/g, '');
        if (commonMisspellings[clean]) {
          errors.push({
            word: word,
            suggestion: commonMisspellings[clean],
            location: `Experience ${i + 1}`
          });
        }
      });
    });
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
          <button class="checker-tab active" onclick="showCheckerTab('spell', this)">Spell Check</button>
          <button class="checker-tab" onclick="showCheckerTab('ats', this)">ATS Score</button>
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
    if (errors.length === 0) {
      body.innerHTML = `<div class="spell-clear">✅ No spelling issues found!</div>`;
    } else {
      body.innerHTML = errors.map(e => `
        <div class="spell-error">
          <div class="spell-error-word">✕ "${e.word}"</div>
          <div class="spell-error-suggestion">→ Did you mean: <strong style="color:#c9a84c">${e.suggestion}</strong>?</div>
          <div class="spell-error-location">In: ${e.location}</div>
        </div>
      `).join('');
    }
  } else {
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
        <div class="ats-keywords-title">✅ Keywords Found (${results.keywords.found.length})</div>
        <div class="keyword-tags">
          ${results.keywords.found.map(k => `<span class="keyword-tag keyword-found">${k}</span>`).join('') || '<span style="color:#444;font-size:0.78rem">None found yet</span>'}
        </div>
        <div class="ats-keywords-title" style="margin-top:0.8rem">💡 Suggested Keywords</div>
        <div class="keyword-tags">
          ${results.keywords.missing.map(k => `<span class="keyword-tag keyword-missing">${k}</span>`).join('')}
        </div>
      </div>
    `;
  }
}
