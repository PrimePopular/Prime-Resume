// voice.js — My Prime Resume v8.5
// Guided voice resume builder using Web Speech API
// No external transcription service — browser-native only
// One Groq API call at the end to structure the data

const VoiceResume = (() => {
  const BACKEND = 'https://prime-resume-backend.vercel.app';

  const PROMPTS = [
    {
      key: 'name_title',
      label: 'Name & Title',
      instruction: 'Say your full name and your current or desired job title.',
      example: 'e.g. "My name is James Wilson, I\'m a Senior Software Engineer"',
      step: 1
    },
    {
      key: 'contact',
      label: 'Contact Info',
      instruction: 'Say your email address, phone number, and city or country.',
      example: 'e.g. "My email is james at gmail dot com, phone 555 0192, based in New York"',
      step: 2
    },
    {
      key: 'summary',
      label: 'Professional Summary',
      instruction: 'Describe yourself professionally in 2–3 sentences. What do you do and what\'s your biggest strength?',
      example: 'e.g. "I\'m a software engineer with 6 years experience building scalable web apps..."',
      step: 3
    },
    {
      key: 'experience',
      label: 'Work Experience',
      instruction: 'Describe your work experience. For each job: company name, your role, dates, and key achievements.',
      example: 'e.g. "At TechCorp from 2021 to now, I was Lead Developer. I reduced deploy time by 40% and led a team of 8..."',
      step: 4
    },
    {
      key: 'education',
      label: 'Education',
      instruction: 'State your degree, institution, and graduation year.',
      example: 'e.g. "I have a BSc in Computer Science from NYU, graduated 2018"',
      step: 5
    },
    {
      key: 'skills',
      label: 'Skills',
      instruction: 'List your key skills and any certifications or achievements worth mentioning.',
      example: 'e.g. "My skills include Python, JavaScript, AWS, React. I\'m also AWS certified."',
      step: 6
    }
  ];

  let currentStep = 0;
  let transcripts = {};
  let recognition = null;
  let isRecording = false;

  function isBrowserSupported() {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  function initRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    return recognition;
  }

  function render() {
    const app = document.getElementById('voiceApp');
    if (!app) return;

    if (!isBrowserSupported()) {
      app.innerHTML = `
        <div class="voice-unsupported">
          <div class="voice-unsupported-icon">⚠️</div>
          <h2>Browser Not Supported</h2>
          <p>Voice input requires Chrome or a Chromium-based browser.<br/>Please open this page in Chrome to use voice input.</p>
          <a href="builder.html" class="voice-btn voice-btn-gold">Use Manual Builder Instead →</a>
        </div>`;
      return;
    }

    const prompt = PROMPTS[currentStep];
    const totalSteps = PROMPTS.length;
    const pct = Math.round((currentStep / totalSteps) * 100);
    const hasTranscript = transcripts[prompt.key] && transcripts[prompt.key].trim().length > 0;

    app.innerHTML = `
      <div class="voice-container">

        <!-- Progress -->
        <div class="voice-progress-wrap">
          <div class="voice-progress-bar">
            <div class="voice-progress-fill" style="width:${pct}%"></div>
          </div>
          <div class="voice-step-label">Step ${prompt.step} of ${totalSteps} — ${prompt.label}</div>
        </div>

        <!-- Main prompt card -->
        <div class="voice-card">
          <div class="voice-step-num">${prompt.step}</div>
          <h2 class="voice-prompt-title">${prompt.instruction}</h2>
          <p class="voice-example">${prompt.example}</p>

          <!-- Mic quality note -->
          <p class="voice-mic-note">🎙 Audio pickup quality depends on your mic and environment. Speak clearly and close to the mic.</p>

          <!-- Transcript display -->
          <div class="voice-transcript-wrap" id="transcriptWrap">
            <div class="voice-transcript" id="transcriptBox">${hasTranscript ? transcripts[prompt.key] : '<span class="voice-placeholder">Your words will appear here as you speak...</span>'}</div>
          </div>

          <!-- Record button -->
          <button class="voice-record-btn" id="recordBtn" onclick="VoiceResume.toggleRecord()">
            <span class="voice-record-icon" id="recordIcon">🎤</span>
            <span id="recordLabel">Tap to Speak</span>
          </button>

          <div class="voice-recording-hint" id="recordingHint" style="display:none;">
            <span class="voice-pulse">●</span> Listening... tap again to stop
          </div>
        </div>

        <!-- Navigation -->
        <div class="voice-nav">
          ${currentStep > 0 ? `<button class="voice-btn voice-btn-ghost" onclick="VoiceResume.goBack()">← Back</button>` : '<div></div>'}
          <div class="voice-nav-dots">
            ${PROMPTS.map((_, i) => `<div class="voice-dot ${i === currentStep ? 'active' : i < currentStep ? 'done' : ''}"></div>`).join('')}
          </div>
          ${hasTranscript
            ? (currentStep < PROMPTS.length - 1
                ? `<button class="voice-btn voice-btn-gold" onclick="VoiceResume.goNext()">Next →</button>`
                : `<button class="voice-btn voice-btn-gold" onclick="VoiceResume.finalize()">Build My Resume →</button>`)
            : `<button class="voice-btn voice-btn-ghost" onclick="VoiceResume.skipStep()">Skip</button>`
          }
        </div>

        <!-- Cancel -->
        <div style="text-align:center;margin-top:1.5rem;">
          <a href="start.html" style="font-size:0.72rem;color:#444;text-decoration:none;letter-spacing:0.06em;font-family:'Syne',sans-serif;">✕ Cancel — go back to method selection</a>
        </div>

      </div>`;
  }

  function toggleRecord() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function startRecording() {
    if (isRecording) return;
    initRecognition();
    const prompt = PROMPTS[currentStep];
    let interimText = '';

    recognition.onstart = () => {
      isRecording = true;
      const btn = document.getElementById('recordBtn');
      const icon = document.getElementById('recordIcon');
      const label = document.getElementById('recordLabel');
      const hint = document.getElementById('recordingHint');
      if (btn) btn.classList.add('recording');
      if (icon) icon.textContent = '⏹';
      if (label) label.textContent = 'Tap to Stop';
      if (hint) hint.style.display = 'flex';
    };

    recognition.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      const box = document.getElementById('transcriptBox');
      const existing = transcripts[prompt.key] || '';
      const combined = (existing + ' ' + final).trim();
      if (final) transcripts[prompt.key] = combined;
      if (box) box.textContent = combined || interim || '';
      interimText = interim;
    };

    recognition.onerror = (e) => {
      isRecording = false;
      resetRecordBtn();
      if (e.error === 'not-allowed') {
        alert('Microphone access was denied. Please allow mic access in your browser settings and try again.');
      }
    };

    recognition.onend = () => {
      isRecording = false;
      resetRecordBtn();
      // Re-render to show next/skip buttons based on transcript
      render();
    };

    recognition.start();
  }

  function stopRecording() {
    if (recognition && isRecording) {
      recognition.stop();
    }
  }

  function resetRecordBtn() {
    const btn = document.getElementById('recordBtn');
    const icon = document.getElementById('recordIcon');
    const label = document.getElementById('recordLabel');
    const hint = document.getElementById('recordingHint');
    if (btn) btn.classList.remove('recording');
    if (icon) icon.textContent = '🎤';
    if (label) label.textContent = 'Tap to Speak';
    if (hint) hint.style.display = 'none';
  }

  function goNext() {
    if (currentStep < PROMPTS.length - 1) {
      currentStep++;
      render();
    }
  }

  function goBack() {
    if (currentStep > 0) {
      currentStep--;
      render();
    }
  }

  function skipStep() {
    transcripts[PROMPTS[currentStep].key] = '';
    if (currentStep < PROMPTS.length - 1) {
      currentStep++;
      render();
    } else {
      finalize();
    }
  }

  async function finalize() {
    const app = document.getElementById('voiceApp');

    // Show processing state
    app.innerHTML = `
      <div class="voice-container voice-processing">
        <div class="voice-spinner">✦</div>
        <h2>Building your resume...</h2>
        <p>AI is structuring your information. This takes about 10 seconds.</p>
      </div>`;

    // Build prompt for Groq
    const rawText = Object.entries(transcripts)
      .filter(([_, v]) => v && v.trim())
      .map(([k, v]) => `[${k.toUpperCase()}]: ${v}`)
      .join('\n\n');

    try {
      const res = await fetch(`${BACKEND}/ai/quick-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: rawText })
      });

      if (!res.ok) throw new Error('AI error');
      const data = await res.json();

      // Store structured data for builder to pick up
      if (data.resume) {
        localStorage.setItem('prime_voice_prefill', JSON.stringify(data.resume));
        localStorage.setItem('prime_voice_source', 'voice');
      }

      // Consume trial use
      if (typeof TrialManager !== 'undefined') {
        TrialManager.consume(TrialManager.FEATURES.VOICE);
      }

      // Redirect to builder
      window.location.href = 'builder.html?from=voice';

    } catch(e) {
      // Store raw transcripts as fallback
      localStorage.setItem('prime_voice_prefill', JSON.stringify({ raw: transcripts }));
      localStorage.setItem('prime_voice_source', 'voice_raw');
      window.location.href = 'builder.html?from=voice';
    }
  }

  function init() {
    currentStep = 0;
    transcripts = {};
    render();
  }

  return { init, toggleRecord, goNext, goBack, skipStep, finalize, isBrowserSupported };
})();
