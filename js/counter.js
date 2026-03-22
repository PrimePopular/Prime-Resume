// counter.js — Supabase resume counter
// Tracks how many resumes have been exported globally

const SUPABASE_URL = 'https://uiaerojhtpsglnukhknh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYWVyb2podHBzZ2xudWtoa25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDc0NjQsImV4cCI6MjA4OTU4MzQ2NH0.ft9YG07ut-2G9wqcS5puEc-UyRfj1DLIp5Hka-fEalE';

const SB_HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
  'Content-Type': 'application/json'
};

// ---- LOAD COUNT ----
// Called on homepage to display current count
async function loadResumeCount() {
  try {
    const response = await fetch(
      SUPABASE_URL + '/rest/v1/counter?select=count&limit=1',
      { headers: SB_HEADERS }
    );
    const data = await response.json();
    if (data && data[0] !== undefined) {
      const count = data[0].count || 0;
      const element = document.getElementById('resumeCount');
      if (element) {
        element.textContent = Number(count).toLocaleString();
      }
    }
  } catch (error) {
    const element = document.getElementById('resumeCount');
    if (element) {
      element.textContent = 'Counter not available due to ad blocker';
      element.style.fontSize = '0.7rem';
      element.style.color = '#444';
    }
  }
}

// ---- INCREMENT COUNT ----
// Called every time a PDF is exported
// Uses Supabase RPC function: increment_counter
async function incrementResumeCount() {
  try {
    const response = await fetch(
      SUPABASE_URL + '/rest/v1/rpc/increment_counter',
      {
        method: 'POST',
        headers: SB_HEADERS,
        body: JSON.stringify({})
      }
    );
    console.log('Counter incremented successfully. Status:', response.status);
  } catch (error) {
    console.log('Counter increment failed:', error);
  }
}
