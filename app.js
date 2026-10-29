/**
 * NxtWave Growth Engine — Client Logic
 * Clean Vanilla JavaScript (< 100 lines)
 * Manages form registration, local storage, referral code generation, and analytics telemetry.
 */

const STORAGE_KEY = 'nxtwave_growth_registrations';
let registrations = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentReferralCode = '';

// DOM Elements
const form = document.getElementById('regForm');
const referralBox = document.getElementById('referralBox');
const userCodeEl = document.getElementById('userCode');
const btnWhatsApp = document.getElementById('btnWhatsApp');
const btnSimulate = document.getElementById('btnSimulate');
const btnReset = document.getElementById('btnReset');

// Generate unique referral code from student name (e.g., AI-RAHUL-7B)
function generateCode(name) {
  const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'STUD';
  const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `AI-${prefix}-${randomSuffix}`;
}

// Persist data & update analytics dashboard
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
  render();
}

// Update KPI metrics, progress bar, and channel distribution
function render() {
  const total = registrations.length;
  const target = 500;
  const pct = Math.min(100, Math.round((total / target) * 100));

  // Update counters & progress
  document.getElementById('navCounter').textContent = `${total} / ${target} Registered`;
  document.getElementById('metricTotal').textContent = total;
  document.getElementById('metricPct').textContent = `${pct}%`;
  document.getElementById('progressBar').style.width = `${pct}%`;

  // Aggregate counts per acquisition channel
  const channels = { 'College Club': 0, 'WhatsApp Group': 0, 'Peer Referral': 0, 'Instagram / LinkedIn': 0 };
  registrations.forEach(r => {
    if (channels[r.source] !== undefined) channels[r.source]++;
  });

  document.getElementById('chanClub').textContent = channels['College Club'];
  document.getElementById('chanWa').textContent = channels['WhatsApp Group'];
  document.getElementById('chanRef').textContent = channels['Peer Referral'];
  document.getElementById('chanSocial').textContent = channels['Instagram / LinkedIn'];
}

// Handle new student registration
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const college = document.getElementById('college').value.trim();
  const source = document.getElementById('source').value;
  const ref = document.getElementById('ref').value.trim().toUpperCase();

  // Prevent duplicate email registrations
  if (registrations.some(r => r.email === email)) {
    alert('This email is already registered in this cohort demo!');
    return;
  }

  currentReferralCode = generateCode(name);

  // Store registration record
  registrations.push({
    name, email, college, source, ref,
    referralCode: currentReferralCode,
    registeredAt: new Date().toISOString()
  });

  saveData();

  // Reveal referral loop box
  userCodeEl.textContent = currentReferralCode;
  referralBox.style.display = 'block';
  form.reset();
});

// Share referral link to WhatsApp with prefilled message
btnWhatsApp.addEventListener('click', () => {
  const text = encodeURIComponent(
    `Hey! I just registered for NxtWave's free "Build Your First AI Project in 60 Mins" workshop. Register free with my referral code ${currentReferralCode} so we can build it together: https://nxtwave.tech/ai-workshop`
  );
  window.open(`https://wa.me/?text=${text}`, '_blank');
});

// Demo helper: add 5 sample registrations to demonstrate live telemetry to interviewers
btnSimulate.addEventListener('click', () => {
  const sampleSources = ['College Club', 'WhatsApp Group', 'Peer Referral', 'Instagram / LinkedIn'];
  for (let i = 0; i < 5; i++) {
    const randomSource = sampleSources[Math.floor(Math.random() * sampleSources.length)];
    const randId = Math.floor(Math.random() * 9000 + 1000);
    registrations.push({
      name: `Demo Student ${randId}`,
      email: `student${randId}@college.edu`,
      college: 'Engineering College',
      source: randomSource,
      ref: 'AI-DIRECT',
      referralCode: `AI-DEMO-${randId}`,
      registeredAt: new Date().toISOString()
    });
  }
  saveData();
});

// Reset demo state
btnReset.addEventListener('click', () => {
  if (confirm('Reset all demo registrations?')) {
    registrations = [];
    saveData();
    referralBox.style.display = 'none';
  }
});

// Initial render on page load
render();
