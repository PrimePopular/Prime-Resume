// data.js — One job: Save and load resume data from localStorage
// NEVER edit this file to fix preview or export bugs. Those go in preview.js and export.js

const STORAGE_KEY = 'primeresume_data';
const PREMIUM_KEY = 'prime_premium';
const DEV_KEY = 'prime_dev';
const PREMIUM_DATE_KEY = 'prime_premium_date';
const PREMIUM_DURATION_DAYS = 40;

// Save all current resume data
function saveData() {
  const data = {
    fullName: getVal('fullName'),
    jobTitle: getVal('jobTitle'),
    email: getVal('email'),
    phone: getVal('phone'),
    city: getVal('city'),
    state: getVal('state'),
    address: getVal('address'),
    linkedin: getVal('linkedin'),
    website: getVal('website'),
    summary: getVal('summary'),
    skills: window.skills || [],
    languages: window.languages || [],
    experiences: window.experiences || [],
    educations: window.educations || [],
    projects: window.projects || [],
    certifications: window.certifications || [],
    awards: window.awards || [],
    sectionVisibility: getSectionVisibility(),
    activeTemplate: window.activeTemplate || 'classic'
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Load saved resume data and populate form
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return false;
  try {
    const data = JSON.parse(saved);
    setVal('fullName', data.fullName);
    setVal('jobTitle', data.jobTitle);
    setVal('email', data.email);
    setVal('phone', data.phone);
    setVal('city', data.city);
    setVal('state', data.state);
    setVal('address', data.address);
    setVal('linkedin', data.linkedin);
    setVal('website', data.website);
    setVal('summary', data.summary);
    if (data.skills) window.skills = data.skills;
    if (data.languages) window.languages = data.languages;
    if (data.experiences) window.experiences = data.experiences;
    if (data.educations) window.educations = data.educations;
    if (data.projects) window.projects = data.projects;
    if (data.certifications) window.certifications = data.certifications;
    if (data.awards) window.awards = data.awards;
    if (data.activeTemplate) window.activeTemplate = data.activeTemplate;
    return true;
  } catch (e) {
    console.error('Failed to load saved data:', e);
    return false;
  }
}

// Clear all resume data
function clearData() {
  localStorage.removeItem(STORAGE_KEY);
  window.skills = [];
  window.languages = [];
  window.experiences = [];
  window.educations = [];
  window.projects = [];
  window.certifications = [];
  window.activeTemplate = 'classic';
}

// Get section visibility states
function getSectionVisibility() {
  const sections = ['personal', 'summary', 'skills', 'experience', 'education', 'projects', 'certifications', 'languages'];
  const visibility = {};
  sections.forEach(id => {
    const section = document.getElementById('section-' + id);
    if (section) {
      const toggle = section.previousElementSibling.querySelector('.section-toggle');
      visibility[id] = toggle ? toggle.classList.contains('on') : true;
    }
  });
  return visibility;
}

// Check if premium is active
function isPremiumActive() {
  // Dev mode unlocks everything
  if (localStorage.getItem(DEV_KEY) === 'true') return true;

  const premiumDate = localStorage.getItem(PREMIUM_DATE_KEY);
  if (!premiumDate) return false;

  const purchaseDate = new Date(premiumDate);
  const now = new Date();
  const diffDays = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));

  if (diffDays >= PREMIUM_DURATION_DAYS) {
    // Premium expired — clean up
    localStorage.removeItem(PREMIUM_KEY);
    localStorage.removeItem(PREMIUM_DATE_KEY);
    return false;
  }
  return true;
}

// Get days remaining on premium
function getPremiumDaysLeft() {
  const premiumDate = localStorage.getItem(PREMIUM_DATE_KEY);
  if (!premiumDate) return 0;
  const purchaseDate = new Date(premiumDate);
  const now = new Date();
  const diffDays = Math.floor((now - purchaseDate) / (1000 * 60 * 60 * 24));
  return Math.max(0, PREMIUM_DURATION_DAYS - diffDays);
}

// Helper: get input value safely
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// Helper: set input value safely
function setVal(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.value = value;
}
