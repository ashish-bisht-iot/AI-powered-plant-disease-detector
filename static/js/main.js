/* ── State ── */
let selectedFile = null;

/* ── File Handling ── */
function handleFile(input) {
  const file = input.files[0];
  if (!file) return;
  selectedFile = file;
  showPreview(file);
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('zone').classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    selectedFile = file;
    showPreview(file);
  }
}

function showPreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('preview');
    img.src = e.target.result;
    img.style.display = 'block';
  };
  reader.readAsDataURL(file);

  document.getElementById('uploadLabel').textContent = 'Image ready';
  document.getElementById('fileName').textContent =
    file.name + ' · ' + (file.size / 1024).toFixed(0) + ' KB';
  document.getElementById('detectBtn').disabled = false;

  // Hide any previous results/errors
  document.getElementById('resultsPanel').classList.add('hidden');
  document.getElementById('errorBanner').classList.add('hidden');
  setStatus('ready');
}

/* ── Detect ── */
async function detect() {
  if (!selectedFile) return;

  const btn = document.getElementById('detectBtn');
  btn.disabled = true;
  btn.textContent = 'Analyzing…';
  setStatus('analyzing');

  document.getElementById('resultsPanel').classList.add('hidden');
  document.getElementById('errorBanner').classList.add('hidden');

  const formData = new FormData();
  formData.append('image', selectedFile);

  try {
    const resp = await fetch('/analyze', { method: 'POST', body: formData });
    const data = await resp.json();

    if (!resp.ok || data.error) {
      showError(data.error || 'Something went wrong. Please try again.');
      setStatus('error');
    } else {
      renderResults(data);
      setStatus('ready');
    }
  } catch (err) {
    showError('Network error. Please check your connection and try again.');
    setStatus('error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Analyze leaf';
  }
}

/* ── Render Results ── */
function renderResults(d) {
  if (!d.is_plant) {
    showError('No plant leaf detected. Please upload a clear photo of a leaf.');
    return;
  }

  // Health badge
  const hBadge = document.getElementById('healthBadge');
  hBadge.textContent = d.health_status || 'Unknown';
  hBadge.className = 'health-badge ' + (d.health_status || 'unknown').toLowerCase();

  // Names
  document.getElementById('diseaseName').textContent =
    d.disease_name || (d.health_status === 'Healthy' ? 'No disease detected' : 'Unknown condition');
  document.getElementById('plantName').textContent =
    d.plant_name ? 'Plant: ' + d.plant_name : '';

  // Summary
  document.getElementById('summaryText').textContent = d.summary || '';

  // Confidence ring animation
  const pct = Math.max(0, Math.min(100, d.confidence || 0));
  const circumference = 113; // 2π × 18
  const offset = circumference - (pct / 100) * circumference;
  const arc = document.getElementById('confidenceArc');
  arc.style.strokeDashoffset = circumference; // reset
  document.getElementById('confidenceNum').textContent = pct + '%';
  // Color ring by confidence
  const ringColor = pct >= 70 ? '#1D9E75' : pct >= 40 ? '#F59E0B' : '#EF4444';
  document.documentElement.style.setProperty('--ring-color', ringColor);
  // Animate
  requestAnimationFrame(() => {
    arc.style.transition = 'stroke-dashoffset 0.8s ease';
    arc.style.strokeDashoffset = offset;
  });

  // Sections
  const grid = document.getElementById('resultGrid');
  grid.innerHTML = '';

  const sections = [
    { title: 'Symptoms', items: d.symptoms },
    { title: 'Causes', items: d.causes },
    { title: 'Treatment', items: d.treatment },
    { title: 'Prevention', items: d.prevention },
  ];

  sections.forEach(({ title, items }) => {
    if (!items || items.length === 0) return;
    const sec = document.createElement('div');
    sec.className = 'result-section';
    sec.innerHTML = `
      <p class="result-section-title">${title}</p>
      <ul class="result-list">
        ${items.map(i => `<li>${i}</li>`).join('')}
      </ul>
    `;
    grid.appendChild(sec);
  });

  document.getElementById('resultsPanel').classList.remove('hidden');
}

/* ── Helpers ── */
function showError(msg) {
  const banner = document.getElementById('errorBanner');
  document.getElementById('errorText').textContent = msg;
  banner.classList.remove('hidden');
}

function setStatus(state) {
  const badge = document.getElementById('statusBadge');
  const dot = badge.querySelector('.dot');
  if (state === 'analyzing') {
    badge.className = 'badge analyzing';
    badge.innerHTML = '<span class="dot"></span>Analyzing…';
  } else if (state === 'error') {
    badge.className = 'badge error';
    badge.innerHTML = '<span class="dot"></span>Error';
  } else {
    badge.className = 'badge';
    badge.innerHTML = '<span class="dot"></span>Ready';
  }
}
