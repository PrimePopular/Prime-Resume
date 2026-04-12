// trialmanager.js — My Prime Resume v8.5
// Tamper-resistant 24h trial system for AI features
// Uses HMAC-style hash to detect localStorage manipulation
// Falls back gracefully if crypto unavailable

const TrialManager = (() => {
  // Secret salt — obscures timing data stored in localStorage
  // Not truly secret (client-side) but stops casual manipulation
  const SALT = 'pmr_v85_' + navigator.userAgent.length + '_prime';

  // Feature keys
  const FEATURES = {
    VOICE:           'trial_voice',
    AI_SUMMARY:      'trial_ai_summary',
    AI_JOB_MATCH:    'trial_ai_job_match',
    AI_ACHIEVEMENT:  'trial_ai_achievement',
    ATS_ADVANCED:    'trial_ats_advanced',
  };

  // Limits per feature per 24h
  const LIMITS = {
    FREE: {
      [FEATURES.VOICE]:          1,
      [FEATURES.AI_SUMMARY]:     1,
      [FEATURES.AI_JOB_MATCH]:   1,
      [FEATURES.AI_ACHIEVEMENT]: 1,
      [FEATURES.ATS_ADVANCED]:   1,
    },
    PREMIUM: {
      [FEATURES.VOICE]:          5,
      [FEATURES.AI_SUMMARY]:     999, // unlimited effectively
      [FEATURES.AI_JOB_MATCH]:   999,
      [FEATURES.AI_ACHIEVEMENT]: 999,
      [FEATURES.ATS_ADVANCED]:   999,
    }
  };

  const MS_24H = 24 * 60 * 60 * 1000;

  // Simple hash: XOR + sum of char codes with salt
  // Not cryptographic — just anti-casual-tampering
  function _hash(str) {
    let h = 0;
    const full = SALT + str;
    for (let i = 0; i < full.length; i++) {
      h = (h << 5) - h + full.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h).toString(36);
  }

  function _getRecord(featureKey) {
    try {
      const raw = localStorage.getItem(featureKey);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Validate hash to detect tampering
      const expected = _hash(data.ts + '|' + data.count);
      if (data.h !== expected) {
        // Tampered — reset
        localStorage.removeItem(featureKey);
        return null;
      }
      return data;
    } catch(e) {
      return null;
    }
  }

  function _setRecord(featureKey, ts, count) {
    const h = _hash(ts + '|' + count);
    localStorage.setItem(featureKey, JSON.stringify({ ts, count, h }));
  }

  function _isPremium() {
    return typeof isPremiumActive === 'function' && isPremiumActive();
  }

  // Returns { allowed: bool, usesLeft: int, msUntilReset: int, limit: int }
  function check(featureKey) {
    const premium = _isPremium();
    const limits = premium ? LIMITS.PREMIUM : LIMITS.FREE;
    const limit = limits[featureKey] ?? 1;

    const record = _getRecord(featureKey);
    const now = Date.now();

    if (!record) {
      return { allowed: true, usesLeft: limit, msUntilReset: 0, limit };
    }

    const age = now - record.ts;
    if (age >= MS_24H) {
      // Window expired — reset
      localStorage.removeItem(featureKey);
      return { allowed: true, usesLeft: limit, msUntilReset: 0, limit };
    }

    const usesLeft = Math.max(0, limit - record.count);
    const msUntilReset = MS_24H - age;

    return {
      allowed: usesLeft > 0,
      usesLeft,
      msUntilReset,
      limit
    };
  }

  // Call this AFTER a successful feature use
  function consume(featureKey) {
    const record = _getRecord(featureKey);
    const now = Date.now();

    if (!record || (now - record.ts) >= MS_24H) {
      _setRecord(featureKey, now, 1);
    } else {
      _setRecord(featureKey, record.ts, record.count + 1);
    }
  }

  // Format ms as "Xh Ym" or "Xm Ys"
  function formatCountdown(ms) {
    if (ms <= 0) return 'now';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  // Render a timer badge into a container element
  // Automatically ticks every second
  function renderTimer(featureKey, containerEl) {
    if (!containerEl) return;

    function update() {
      const status = check(featureKey);
      if (status.allowed && status.usesLeft > 0 && status.msUntilReset === 0) {
        containerEl.innerHTML = '';
        return;
      }
      if (!status.allowed) {
        containerEl.innerHTML = `
          <div class="trial-timer exhausted">
            <span class="trial-timer-icon">⏳</span>
            <span class="trial-timer-text">Resets in <strong>${formatCountdown(status.msUntilReset)}</strong></span>
          </div>`;
      } else {
        containerEl.innerHTML = `
          <div class="trial-timer active">
            <span class="trial-timer-icon">✦</span>
            <span class="trial-timer-text">${status.usesLeft} use${status.usesLeft !== 1 ? 's' : ''} left today</span>
          </div>`;
      }
    }

    update();
    // Tick every second
    const interval = setInterval(() => {
      const status = check(featureKey);
      if (status.allowed && status.msUntilReset === 0) {
        clearInterval(interval);
        containerEl.innerHTML = '';
        return;
      }
      update();
    }, 1000);
  }

  // Guard function — call before any AI feature
  // Returns true if allowed, false + shows toast if not
  function guard(featureKey, featureName) {
    const status = check(featureKey);
    if (status.allowed) return true;

    const countdown = formatCountdown(status.msUntilReset);
    if (typeof showToast === 'function') {
      showToast(`⏳ ${featureName} resets in ${countdown} — upgrade for more`);
    }
    return false;
  }

  return { check, consume, guard, renderTimer, formatCountdown, FEATURES };
})();

// CSS for timer badges — injected once
(function injectTimerCSS() {
  if (document.getElementById('trial-timer-css')) return;
  const style = document.createElement('style');
  style.id = 'trial-timer-css';
  style.textContent = `
    .trial-timer {
      display: inline-flex; align-items: center; gap: 0.35rem;
      font-family: 'Syne', sans-serif; font-size: 0.65rem; font-weight: 700;
      letter-spacing: 0.05em; padding: 0.2rem 0.5rem; border-radius: 2px;
      margin-top: 0.3rem;
    }
    .trial-timer.active {
      background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3);
      color: #c9a84c;
    }
    .trial-timer.exhausted {
      background: rgba(255,255,255,0.04); border: 1px solid #2a2a2a;
      color: #555;
    }
    .trial-timer-icon { font-size: 0.7rem; }
  `;
  document.head.appendChild(style);
})();
