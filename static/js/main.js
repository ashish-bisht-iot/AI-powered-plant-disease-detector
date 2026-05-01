/* ── State ── */
let selectedFile = null;
let currentImageB64 = null;
let cameraStream = null;

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
    currentImageB64 = e.target.result;
  };
  reader.readAsDataURL(file);
  document.getElementById('uploadLabel').textContent = 'Image ready';
  document.getElementById('fileName').textContent =
    file.name + ' · ' + (file.size / 1024).toFixed(0) + ' KB';
  document.getElementById('detectBtn').disabled = false;
  document.getElementById('resultsPanel').classList.add('hidden');
  document.getElementById('errorBanner').classList.add('hidden');
  setStatus('ready');
}

/* ── Camera ── */
async function openCamera() {
  const modal = document.getElementById('cameraModal');
  const video = document.getElementById('cameraFeed');
  const errorEl = document.getElementById('cameraError');
  errorEl.classList.add('hidden');
  modal.classList.remove('hidden');

  try {
    // Try rear camera on mobile, any camera on desktop
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    video.srcObject = cameraStream;
  } catch (err) {
    // Fallback to any available camera
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      video.srcObject = cameraStream;
    } catch (e) {
      errorEl.textContent = 'Camera not accessible. Please allow camera permission and try again.';
      errorEl.classList.remove('hidden');
    }
  }
}

function closeCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  document.getElementById('cameraModal').classList.add('hidden');
  document.getElementById('cameraFeed').srcObject = null;
}

function capturePhoto() {
  const video = document.getElementById('cameraFeed');
  const canvas = document.getElementById('captureCanvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  canvas.toBlob(blob => {
    const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
    selectedFile = file;
    showPreview(file);
    closeCamera();
  }, 'image/jpeg', 0.92);
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
      saveToHistory(data);
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

/* ── Save to History ── */
function imageHash(b64) {
  if (!b64) return null;
  const step = Math.floor(b64.length / 32);
  let hash = b64.length.toString();
  for (let i = 0; i < b64.length; i += step) hash += b64[i];
  return hash;
}

function saveToHistory(data) {
  // Only save actual plant diagnoses — skip non-plants
  if (!data.is_plant) return;

  const raw = localStorage.getItem('plantDiagnosisHistory');
  const history = raw ? JSON.parse(raw) : [];

  // Deduplicate: skip if same image was already analyzed
  const currentHash = imageHash(currentImageB64);
  const isDuplicate = history.some(item => item.imageHash === currentHash);
  if (isDuplicate) return;

  history.push({
    ...data,
    timestamp: Date.now(),
    thumbnail: currentImageB64 || null,
    imageHash: currentHash
  });

  if (history.length > 50) history.shift();
  localStorage.setItem('plantDiagnosisHistory', JSON.stringify(history));
}

/* ── Render Results ── */
function renderResults(d) {
  if (!d.is_plant) {
    showError('No plant leaf detected. Please upload a clear photo of a leaf.');
    return;
  }
  const hBadge = document.getElementById('healthBadge');
  hBadge.textContent = d.health_status || 'Unknown';
  hBadge.className = 'health-badge ' + (d.health_status || 'unknown').toLowerCase();

  document.getElementById('diseaseName').textContent =
    d.disease_name || (d.health_status === 'Healthy' ? 'No disease detected' : 'Unknown condition');
  document.getElementById('plantName').textContent =
    d.plant_name ? 'Plant: ' + d.plant_name : '';
  document.getElementById('summaryText').textContent = d.summary || '';

  const pct = Math.max(0, Math.min(100, d.confidence || 0));
  const offset = 113 - (pct / 100) * 113;
  const arc = document.getElementById('confidenceArc');
  arc.style.strokeDashoffset = 113;
  document.getElementById('confidenceNum').textContent = pct + '%';
  document.documentElement.style.setProperty('--ring-color',
    pct >= 70 ? '#1D9E75' : pct >= 40 ? '#F59E0B' : '#EF4444');
  requestAnimationFrame(() => {
    arc.style.transition = 'stroke-dashoffset 0.8s ease';
    arc.style.strokeDashoffset = offset;
  });

  const grid = document.getElementById('resultGrid');
  grid.innerHTML = '';
  [['Symptoms', d.symptoms], ['Causes', d.causes], ['Treatment', d.treatment], ['Prevention', d.prevention]]
    .forEach(([title, items]) => {
      if (!items || !items.length) return;
      const sec = document.createElement('div');
      sec.className = 'result-section';
      sec.innerHTML = `<p class="result-section-title">${title}</p>
        <ul class="result-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
      grid.appendChild(sec);
    });

  document.getElementById('resultsPanel').classList.remove('hidden');
}

/* ── Helpers ── */
function showError(msg) {
  document.getElementById('errorText').textContent = msg;
  document.getElementById('errorBanner').classList.remove('hidden');
}

function setStatus(state) {
  const badge = document.getElementById('statusBadge');
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

// Close modal on backdrop click
document.addEventListener('click', e => {
  if (e.target.id === 'cameraModal') closeCamera();
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCamera();
});
