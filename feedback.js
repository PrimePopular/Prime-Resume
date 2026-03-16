// feedback.js — Feedback button and form
// Drop this script on any page to add the feedback button

(function () {

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    /* Hide during print */
    @media print {
      .feedback-trigger, .feedback-overlay, .feedback-panel { display: none !important; }
    }

    /* FEEDBACK BUTTON */
    .feedback-trigger {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 999;
      background: #111;
      border: 1px solid #2a2a2a;
      color: #888;
      font-family: 'Syne', sans-serif;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.55rem 1rem;
      cursor: pointer;
      border-radius: 2px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .feedback-trigger:hover {
      border-color: #c9a84c;
      color: #c9a84c;
    }

    /* OVERLAY */
    .feedback-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      z-index: 1000;
      display: none;
      align-items: flex-end;
      justify-content: flex-end;
      padding: 1.5rem;
    }
    .feedback-overlay.open {
      display: flex;
    }

    /* FORM PANEL */
    .feedback-panel {
      background: #0d0d0d;
      border: 1px solid #2a2a2a;
      width: 100%;
      max-width: 360px;
      padding: 1.5rem;
      animation: slideUp 0.25s ease;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .feedback-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.2rem;
    }
    .feedback-title {
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 0.95rem;
      color: #f5f2eb;
    }
    .feedback-close {
      background: none;
      border: none;
      color: #444;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0;
      transition: color 0.2s;
      line-height: 1;
    }
    .feedback-close:hover { color: #f5f2eb; }

    .feedback-sub {
      font-size: 0.78rem;
      color: #555;
      margin-bottom: 1.2rem;
      line-height: 1.6;
    }

    .fb-group { margin-bottom: 0.8rem; }
    .fb-label {
      display: block;
      font-family: 'Syne', sans-serif;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #555;
      margin-bottom: 0.3rem;
    }
    .fb-input, .fb-textarea {
      width: 100%;
      background: #181818;
      border: 1px solid #2a2a2a;
      color: #f5f2eb;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.85rem;
      padding: 0.55rem 0.75rem;
      outline: none;
      transition: border-color 0.2s;
      border-radius: 2px;
    }
    .fb-input:focus, .fb-textarea:focus {
      border-color: #c9a84c;
    }
    .fb-input::placeholder, .fb-textarea::placeholder {
      color: #333;
    }
    .fb-textarea {
      resize: vertical;
      min-height: 90px;
      line-height: 1.5;
    }

    .fb-checkbox-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      cursor: pointer;
    }
    .fb-checkbox {
      width: 14px;
      height: 14px;
      accent-color: #c9a84c;
      cursor: pointer;
    }
    .fb-checkbox-label {
      font-size: 0.78rem;
      color: #666;
      cursor: pointer;
    }

    .fb-submit {
      width: 100%;
      background: #c9a84c;
      color: #0a0a0a;
      border: none;
      padding: 0.75rem;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 0.78rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.2s;
      border-radius: 2px;
    }
    .fb-submit:hover { background: #e8c96a; }
    .fb-submit:disabled {
      background: #2a2a2a;
      color: #555;
      cursor: not-allowed;
    }

    .fb-success {
      text-align: center;
      padding: 1.5rem 0;
      display: none;
    }
    .fb-success-icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .fb-success h3 {
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 0.95rem;
      color: #f5f2eb;
      margin-bottom: 0.4rem;
    }
    .fb-success p {
      font-size: 0.78rem;
      color: #555;
      line-height: 1.6;
    }

    @media (max-width: 480px) {
      .feedback-overlay {
        padding: 0;
        align-items: flex-end;
        justify-content: center;
      }
      .feedback-panel {
        max-width: 100%;
        border-left: none;
        border-right: none;
        border-bottom: none;
      }
      .feedback-trigger {
        bottom: 1rem;
        right: 1rem;
      }
    }
  `;
  document.head.appendChild(style);

  // Build HTML
  const trigger = document.createElement('button');
  trigger.className = 'feedback-trigger';
  trigger.innerHTML = '✦ Feedback';

  const overlay = document.createElement('div');
  overlay.className = 'feedback-overlay';
  overlay.innerHTML = `
    <div class="feedback-panel" id="feedbackPanel">
      <div class="feedback-header">
        <span class="feedback-title">Send Feedback</span>
        <button class="feedback-close" id="feedbackClose">✕</button>
      </div>
      <p class="feedback-sub">Found a bug? Have a suggestion? We read everything.</p>

      <div id="feedbackForm">
        <div class="fb-group">
          <label class="fb-label">Name (optional)</label>
          <input class="fb-input" id="fbName" type="text" placeholder="Your name"/>
        </div>
        <div class="fb-group">
          <label class="fb-label">Email (optional)</label>
          <input class="fb-input" id="fbEmail" type="email" placeholder="So we can reply"/>
        </div>
        <div class="fb-group">
          <label class="fb-label">Your Feedback</label>
          <textarea class="fb-textarea" id="fbMessage" placeholder="Tell us what's on your mind..."></textarea>
        </div>
        <label class="fb-checkbox-row">
          <input class="fb-checkbox" type="checkbox" id="fbIsBug"/>
          <span class="fb-checkbox-label">This is a bug report</span>
        </label>
        <button class="fb-submit" id="fbSubmit" onclick="submitFeedback()">Send Feedback</button>
      </div>

      <div class="fb-success" id="fbSuccess">
        <div class="fb-success-icon">✅</div>
        <h3>Thank you!</h3>
        <p>Your feedback has been received.<br/>We appreciate you taking the time.</p>
      </div>
    </div>
  `;

  document.body.appendChild(trigger);
  document.body.appendChild(overlay);

  // Open
  trigger.addEventListener('click', () => {
    overlay.classList.add('open');
  });

  // Close
  document.getElementById('feedbackClose').addEventListener('click', closeFeedback);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeFeedback();
  });

  function closeFeedback() {
    overlay.classList.remove('open');
    // Reset after close
    setTimeout(() => {
      document.getElementById('feedbackForm').style.display = 'block';
      document.getElementById('fbSuccess').style.display = 'none';
      document.getElementById('fbName').value = '';
      document.getElementById('fbEmail').value = '';
      document.getElementById('fbMessage').value = '';
      document.getElementById('fbIsBug').checked = false;
      document.getElementById('fbSubmit').disabled = false;
    }, 300);
  }

  // Submit feedback — sends to backend or saves locally
  window.submitFeedback = function () {
    const name = document.getElementById('fbName').value.trim() || 'Anonymous';
    const email = document.getElementById('fbEmail').value.trim() || 'Not provided';
    const message = document.getElementById('fbMessage').value.trim();
    const isBug = document.getElementById('fbIsBug').checked;

    if (!message) {
      document.getElementById('fbMessage').focus();
      document.getElementById('fbMessage').style.borderColor = '#c9a84c';
      return;
    }

    const btn = document.getElementById('fbSubmit');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    // Send to Web3Forms → arrives in your Gmail
    const formData = {
      access_key: '7000fe3b-dca9-4897-8a99-0e7af76f8773',
      subject: isBug ? '🐛 Bug Report — Prime Resume' : '💬 Feedback — Prime Resume',
      name: name,
      email: email,
      message: message + '\n\nPage: ' + window.location.pathname + '\nTime: ' + new Date().toLocaleString(),
      botcheck: ''
    };

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById('feedbackForm').style.display = 'none';
        document.getElementById('fbSuccess').style.display = 'block';
        setTimeout(closeFeedback, 2500);
      } else {
        btn.disabled = false;
        btn.textContent = 'Send Feedback';
        document.getElementById('fbMessage').style.borderColor = '#d9534f';
      }
    })
    .catch(() => {
      btn.disabled = false;
      btn.textContent = 'Send Feedback';
    });
  };

})();
