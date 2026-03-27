// version.js — Version history with naming support
// v8 — allows users to name their versions

const VERSION_KEY = 'primeresume_versions';
const MAX_VERSIONS_FREE = 5;
const MAX_VERSIONS_PREMIUM = 20;
let versionSaveTimer = null;

function getMaxVersions() {
  const isPremium = (typeof isPremiumActive === 'function' && isPremiumActive()) ||
    localStorage.getItem('prime_dev') === 'true';
  return isPremium ? MAX_VERSIONS_PREMIUM : MAX_VERSIONS_FREE;
}

// Debounced auto-save — 8 seconds after last change
function scheduleVersionSave() {
  clearTimeout(versionSaveTimer);
  versionSaveTimer = setTimeout(() => saveVersion(), 8000);
}

function saveVersion(label) {
  const saved = localStorage.getItem('primeresume_data');
  if (!saved) return;
  const data = JSON.parse(saved);
  const name = data.fullName || 'Untitled';
  if (!name && !data.jobTitle && (!data.experiences || data.experiences.length === 0)) return;

  const versions = getVersions();

  // Don't save duplicate of most recent
  if (versions.length > 0) {
    const last = versions[0];
    if (JSON.stringify(last.data) === JSON.stringify(data)) return;
  }

  const snapshot = {
    id: Date.now(),
    label: label || autoLabel(data),
    customName: null,
    timestamp: new Date().toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }),
    data: data
  };

  versions.unshift(snapshot);

  const max = getMaxVersions();
  if (versions.length > max) versions.splice(max);

  localStorage.setItem(VERSION_KEY, JSON.stringify(versions));
}

function autoLabel(data) {
  const name = data.fullName || 'Resume';
  const expCount = data.experiences ? data.experiences.filter(e => e.title).length : 0;
  const skillCount = data.skills ? data.skills.length : 0;
  if (expCount > 0 && skillCount > 0) return `${name} — ${expCount} exp, ${skillCount} skills`;
  if (expCount > 0) return `${name} — ${expCount} experience${expCount > 1 ? 's' : ''}`;
  return name;
}

function getVersions() {
  const saved = localStorage.getItem(VERSION_KEY);
  if (!saved) return [];
  try { return JSON.parse(saved); } catch(e) { return []; }
}

function renameVersion(id) {
  const versions = getVersions();
  const version = versions.find(v => v.id === id);
  if (!version) return;
  const newName = prompt('Name this version:', version.customName || version.label);
  if (newName === null) return; // cancelled
  version.customName = newName.trim() || version.label;
  localStorage.setItem(VERSION_KEY, JSON.stringify(versions));
  renderVersionPanel();
  if (typeof showToast === 'function') showToast('✅ Version renamed!');
}

function restoreVersion(id) {
  const versions = getVersions();
  const version = versions.find(v => v.id === id);
  if (!version) return;
  const displayName = version.customName || version.label;
  if (!confirm(`Restore "${displayName}"?\n\nYour current resume will be saved as a version first.`)) return;
  saveVersion('Before restore — ' + new Date().toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }));
  localStorage.setItem('primeresume_data', JSON.stringify(version.data));
  window.location.reload();
}

function deleteVersion(id) {
  let versions = getVersions();
  versions = versions.filter(v => v.id !== id);
  localStorage.setItem(VERSION_KEY, JSON.stringify(versions));
  renderVersionPanel();
}

function clearAllVersions() {
  if (!confirm('Delete all saved versions? This cannot be undone.')) return;
  localStorage.removeItem(VERSION_KEY);
  renderVersionPanel();
}

// ── VERSION PANEL UI ──────────────────────────────────────────
function openVersionPanel() {
  const isPremium = (typeof isPremiumActive === 'function' && isPremiumActive()) ||
    localStorage.getItem('prime_dev') === 'true';

  if (!isPremium) {
    if (typeof showToast === 'function') showToast('🔒 Version History is a Premium feature');
    setTimeout(() => window.location.href = 'pricing.html', 1800);
    return;
  }

  let panel = document.getElementById('versionPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'versionPanel';
    panel.style.cssText = `
      position:fixed;left:0;top:52px;bottom:0;width:300px;
      background:#0d0d0d;border-right:1px solid #1a1a1a;
      z-index:200;display:flex;flex-direction:column;
      font-family:'DM Sans',sans-serif;
      transform:translateX(-100%);transition:transform 0.3s ease;
    `;
    document.body.appendChild(panel);
    setTimeout(() => panel.style.transform = 'translateX(0)', 10);
  } else {
    panel.style.transform = 'translateX(0)';
  }

  if (!document.getElementById('versionStyles')) {
    const style = document.createElement('style');
    style.id = 'versionStyles';
    style.textContent = `
      .version-header{display:flex;align-items:center;justify-content:space-between;padding:0.8rem 1rem;border-bottom:1px solid #1a1a1a;flex-shrink:0;}
      .version-title{font-family:'Syne',sans-serif;font-weight:700;font-size:0.78rem;letter-spacing:0.08em;text-transform:uppercase;color:#c9a84c;}
      .version-close{background:none;border:none;color:#444;font-size:1rem;cursor:pointer;padding:0.2rem 0.4rem;transition:color 0.2s;}
      .version-close:hover{color:#fff;}
      .version-body{flex:1;overflow-y:auto;padding:0.8rem;}
      .version-body::-webkit-scrollbar{width:4px;}
      .version-body::-webkit-scrollbar-thumb{background:#2a2a2a;}
      .version-item{background:#141414;border:1px solid #1e1e1e;border-radius:2px;padding:0.8rem;margin-bottom:0.5rem;transition:border-color 0.2s;}
      .version-item:hover{border-color:#2a2a2a;}
      .version-item-label{font-size:0.78rem;color:#aaa;font-family:'Syne',sans-serif;font-weight:600;margin-bottom:0.15rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
      .version-item-custom{font-size:0.7rem;color:#c9a84c;margin-bottom:0.2rem;font-style:italic;}
      .version-item-time{font-size:0.68rem;color:#444;margin-bottom:0.6rem;}
      .version-actions{display:flex;gap:0.3rem;flex-wrap:wrap;}
      .version-btn{flex:1;min-width:0;padding:0.32rem 0.4rem;background:#1a1a1a;border:1px solid #2a2a2a;color:#666;font-family:'Syne',sans-serif;font-size:0.6rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;border-radius:2px;white-space:nowrap;}
      .version-btn:hover{border-color:#c9a84c;color:#c9a84c;}
      .version-btn.delete:hover{border-color:#d9534f;color:#d9534f;}
      .version-save-now{width:100%;padding:0.7rem;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);color:#c9a84c;font-family:'Syne',sans-serif;font-weight:700;font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;margin-bottom:0.8rem;border-radius:2px;}
      .version-save-now:hover{background:rgba(201,168,76,0.15);}
      .version-limit{font-size:0.68rem;color:#444;text-align:center;margin-bottom:0.8rem;}
      .version-empty{text-align:center;padding:2rem 1rem;color:#333;font-size:0.78rem;line-height:1.6;}
      .version-footer{padding:0.8rem;border-top:1px solid #1a1a1a;flex-shrink:0;}
      .version-clear{width:100%;padding:0.5rem;background:transparent;border:1px solid #1a1a1a;color:#333;font-family:'Syne',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;transition:all 0.2s;border-radius:2px;}
      .version-clear:hover{border-color:#d9534f;color:#d9534f;}
    `;
    document.head.appendChild(style);
  }

  renderVersionPanel();
}

function closeVersionPanel() {
  const panel = document.getElementById('versionPanel');
  if (panel) panel.style.transform = 'translateX(-100%)';
}

function renderVersionPanel() {
  const panel = document.getElementById('versionPanel');
  if (!panel) return;
  const versions = getVersions();
  const max = getMaxVersions();

  panel.innerHTML = `
    <div class="version-header">
      <span class="version-title">Version History</span>
      <button class="version-close" onclick="closeVersionPanel()">✕</button>
    </div>
    <div class="version-body">
      <button class="version-save-now" onclick="saveVersion(); renderVersionPanel(); if(typeof showToast==='function') showToast('Version saved ✅')">
        ✦ Save Version Now
      </button>
      <div class="version-limit">${versions.length} / ${max} versions saved</div>
      ${versions.length === 0
        ? `<div class="version-empty">No versions saved yet.<br/>Versions save automatically as you work.</div>`
        : versions.map((v, i) => `
          <div class="version-item">
            ${v.customName ? `<div class="version-item-custom">✦ ${v.customName}</div>` : ''}
            <div class="version-item-label">${i === 0 ? '★ ' : ''}${v.label}</div>
            <div class="version-item-time">${v.timestamp}</div>
            <div class="version-actions">
              <button class="version-btn" onclick="restoreVersion(${v.id})">Restore</button>
              <button class="version-btn" onclick="renameVersion(${v.id})">Rename</button>
              <button class="version-btn delete" onclick="deleteVersion(${v.id})">Delete</button>
            </div>
          </div>`).join('')
      }
    </div>
    ${versions.length > 0 ? `
      <div class="version-footer">
        <button class="version-clear" onclick="clearAllVersions()">Clear All Versions</button>
      </div>` : ''}
  `;
}
