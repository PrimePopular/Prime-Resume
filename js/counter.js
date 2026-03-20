// counter.js — Supabase export counter
const SUPABASE_URL = 'https://uiaerojhtpsglnukhknh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYWVyb2podHBzZ2xudWtoa25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDc0NjQsImV4cCI6MjA4OTU4MzQ2NH0.ft9YG07ut-2G9wqcS5puEc-UyRfj1DLIp5Hka-fEalE';

const SB_HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// Get current count and display on homepage
async function loadResumeCount() {
  try {
    const res = await fetch(
      SUPABASE_URL + '/rest/v1/counter?select=count&limit=1',
      { headers: SB_HEADERS }
    );
    const data = await res.json();
    if (data && data[0] !== undefined) {
      const count = data[0].count || 0;
      const el = document.getElementById('resumeCount');
      if (el) el.textContent = Number(count).toLocaleString();
    }
  } catch(e) {
    console.log('Counter unavailable');
  }
}

// Increment count when PDF is exported
async function incrementResumeCount() {
  try {
    // Get current row
    const res = await fetch(
      SUPABASE_URL + '/rest/v1/counter?select=id,count&limit=1',
      { headers: SB_HEADERS }
    );
    const data = await res.json();
    if (data && data[0] !== undefined) {
      const newCount = (data[0].count || 0) + 1;
      const id = data[0].id;
      // Update using PATCH
      const updateRes = await fetch(
        SUPABASE_URL + '/rest/v1/counter?id=eq.' + id,
        {
          method: 'PATCH',
          headers: SB_HEADERS,
          body: JSON.stringify({ count: newCount })
        }
      );
      console.log('Counter updated to:', newCount, 'Status:', updateRes.status);
    }
  } catch(e) {
    console.log('Counter update failed:', e);
  }
}
