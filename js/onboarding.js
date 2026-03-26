// onboarding.js — First time user guided tour — v8 updated

var OB_KEY = 'prime_onboarding_done';
var obStep = 0;
var obSteps = [
  {
    title: 'Welcome to Prime Resume 👋',
    text: 'Build a professional resume in minutes. Everything stays on your end — no accounts, no servers, no tracking. Let us show you around.',
    target: null
  },
  {
    title: 'Fill Your Details',
    text: 'Type your information in the left panel. Your resume updates live on the right as you type — no delay, no lag.',
    target: '.left-panel',
    side: 'right'
  },
  {
    title: 'Live Preview',
    text: 'This is exactly what your resume looks like. What you see here is what gets exported. Switch templates anytime.',
    target: '.right-panel',
    side: 'left'
  },
  {
    title: '8 Templates',
    text: 'Switch between 4 free and 4 premium templates. Click any premium template to preview it before buying — free forever.',
    target: '.panel-tabs',
    side: 'right'
  },
  {
    title: 'Resume Score',
    text: 'Scores your resume completeness from 0–100%. Keep filling in sections to push it higher.',
    target: '.score-badge',
    side: 'bottom'
  },
  {
    title: 'Tools Menu',
    text: 'Everything lives here: Check Resume (ATS + AI), Cover Letter, Job Tracker, Version History, Employer View, Export JSON, Force 1-Page PRO, and Tour.',
    target: '.tools-dropdown',
    side: 'bottom'
  },
  {
    title: 'Check Resume ✦',
    text: 'Your most powerful tool. Get ATS score, writing quality check, health checklist, and AI Job Match Analyzer — paste any job description to see your match score.',
    target: '.tools-dropdown',
    side: 'bottom'
  },
  {
    title: 'Export PDF',
    text: 'Download your resume as a clean PDF instantly. Free tier adds a small watermark. Premium exports are clean.',
    target: '.btn-export',
    side: 'bottom'
  },
  {
    title: 'Portrait Template 🪪',
    text: 'The Portrait premium template lets you add an optional photo to your resume — great for European and international job markets.',
    target: '.right-panel',
    side: 'left'
  },
  {
    title: 'You are ready! 🎉',
    text: 'Start filling in your details and your resume builds itself. It saves automatically. No account needed. Ever.',
    target: null
  }
];

function obStart() {
  if (localStorage.getItem(OB_KEY)) return;
  obStep = 0;
  obBuild();
  obShow();
}

function obForce() {
  obStep = 0;
  obBuild();
  obShow();
}

function obBuild() {
  obClean();
  if (!document.getElementById('obCSS')) {
    var s = document.createElement('style');
    s.id = 'obCSS';
    s.textContent = [
      '.ob-dark{position:fixed;background:rgba(0,0,0,0.75);z-index:9001;pointer-events:all;}',
      '.ob-box{position:fixed;z-index:9003;background:#0d0d0d;border:2px solid #c9a84c;',
        'padding:1.4rem 1.5rem;max-width:320px;min-width:260px;width:90vw;',
        'box-shadow:0 12px 50px rgba(0,0,0,0.9);pointer-events:all;}',
      '.ob-box h3{font-family:Syne,sans-serif;font-weight:800;font-size:1rem;color:#c9a84c;margin:0 0 0.5rem;}',
      '.ob-box p{font-family:"DM Sans",sans-serif;font-size:0.85rem;color:#ccc;line-height:1.6;margin:0 0 1rem;}',
      '.ob-foot{display:flex;justify-content:space-between;align-items:center;}',
      '.ob-prog{font-family:Syne,sans-serif;font-size:0.72rem;color:#555;font-weight:700;}',
      '.ob-acts{display:flex;gap:0.5rem;}',
      '.ob-skip{padding:0.45rem 1rem;background:transparent;border:1px solid #2a2a2a;color:#555;font-family:Syne,sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;border-radius:2px;}',
      '.ob-skip:hover{color:#888;border-color:#555;}',
      '.ob-next{padding:0.5rem 1.2rem;background:#c9a84c;color:#000;border:none;font-family:Syne,sans-serif;font-size:0.78rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;border-radius:2px;}',
      '.ob-next:hover{background:#e8c96a;}',
      '.ob-ring{position:fixed;border:2px solid #c9a84c;border-radius:3px;z-index:9002;pointer-events:none;}'
    ].join('');
    document.head.appendChild(s);
  }
}

function obShow() {
  obClean();
  var step = obSteps[obStep];
  if (!step) return;
  var isLast = obStep === obSteps.length - 1;
  var el = step.target ? document.querySelector(step.target) : null;

  if (el) {
    var r = el.getBoundingClientRect();
    var pad = 6;
    var t = r.top - pad, l = r.left - pad, b = r.bottom + pad, ri = r.right + pad;
    var w = r.width + pad * 2, h = r.height + pad * 2;
    obDark(0, 0, '100vw', t + 'px');
    obDark(b + 'px', 0, '100vw', 'calc(100vh - ' + b + 'px)');
    obDark(t + 'px', 0, l + 'px', h + 'px');
    obDark(t + 'px', ri + 'px', 'calc(100vw - ' + ri + 'px)', h + 'px');
    var ring = document.createElement('div');
    ring.className = 'ob-ring'; ring.id = 'obRing';
    ring.style.cssText = 'top:' + t + 'px;left:' + l + 'px;width:' + w + 'px;height:' + h + 'px;';
    document.body.appendChild(ring);
  } else {
    obDark(0, 0, '100vw', '100vh');
  }

  var box = document.createElement('div');
  box.className = 'ob-box'; box.id = 'obBox';
  box.innerHTML = '<h3>' + step.title + '</h3>' +
    '<p>' + step.text + '</p>' +
    '<div class="ob-foot">' +
      '<span class="ob-prog">' + (obStep + 1) + ' / ' + obSteps.length + '</span>' +
      '<div class="ob-acts">' +
        (!isLast ? '<button class="ob-skip" onclick="obSkip()">Skip</button>' : '') +
        '<button class="ob-next" onclick="' + (isLast ? 'obDone()' : 'obNext()') + '">' +
          (isLast ? 'Get Started!' : 'Next →') +
        '</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(box);

  if (el) {
    var r2 = el.getBoundingClientRect();
    var bw = 340, bh = 220, mg = 14;
    var tx, ty;
    if (step.side === 'bottom') { ty = r2.bottom + mg; tx = r2.left; }
    else if (step.side === 'right') { ty = r2.top; tx = r2.right + mg; }
    else if (step.side === 'left') { ty = r2.top; tx = r2.left - bw - mg; }
    else { ty = r2.bottom + mg; tx = r2.left; }
    if (tx + bw > window.innerWidth - mg) tx = window.innerWidth - bw - mg;
    if (tx < mg) tx = mg;
    if (ty + bh > window.innerHeight - mg) ty = r2.top - bh - mg;
    if (ty < mg) ty = mg;
    box.style.top = ty + 'px'; box.style.left = tx + 'px';
  } else {
    box.style.top = '50%'; box.style.left = '50%';
    box.style.transform = 'translate(-50%,-50%)';
  }
}

function obDark(top, left, width, height) {
  var d = document.createElement('div');
  d.className = 'ob-dark';
  d.style.cssText = 'top:' + top + ';left:' + left + ';width:' + width + ';height:' + height + ';';
  document.body.appendChild(d);
}

function obNext() { obStep++; if (obStep >= obSteps.length) { obDone(); return; } obShow(); }
function obSkip() { obDone(); }
function obDone() {
  localStorage.setItem(OB_KEY, 'true');
  obClean();
  if (typeof showToast === 'function') showToast('You are all set! Start building 🚀');
}
function obClean() {
  document.querySelectorAll('.ob-dark').forEach(function(el){ el.remove(); });
  var b = document.getElementById('obBox'), r = document.getElementById('obRing');
  if (b) b.remove(); if (r) r.remove();
}

window.addEventListener('load', function() { setTimeout(obStart, 900); });
window.forceStartOnboarding = obForce;
