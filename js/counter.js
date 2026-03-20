// counter.js — Supabase export counter
const SUPABASE_URL = 'https://uiaerojhtpsglnukhknh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYWVyb2podHBzZ2xudWtoa25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDc0NjQsImV4cCI6MjA4OTU4MzQ2NH0.ft9YG07ut-2G9wqcS5puEc-UyRfj1DLIp5Hka-fEalE';

// Get current count and display on homepage
async function loadResumeCount() {
  try {
    const res = await fetch(
      SUPABASE_URL + '/rest/v1/counter?select=count&limit=1',
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        }
      }
    );
    const data = await res.json();
    if (data && data[0]) {
      const count = data[0].count;
      const el = document.getElementById('resumeCount');
      if (el) el.textContent = count.toLocaleString() + '+';
    }
  } catch(e) {
    console.log('Counter unavailable');
  }
}

// Increment count when PDF is exported
async function incrementResumeCount() {
  try {
    // First get current count
    const res = await fetch(
      SUPABASE_URL + '/rest/v1/counter?select=id,count&limit=1',
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        }
      }
    );
    const data = await res.json();
    if (data && data[0]) {
      const newCount = data[0].count + 1;
      const id = data[0].id;
      // Update count
      await fetch(
        SUPABASE_URL + '/rest/v1/counter?id=eq.' + id,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ count: newCount })
        }
      );
    }
  } catch(e) {
    console.log('Counter update failed');
  }
}
