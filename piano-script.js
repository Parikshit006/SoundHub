// =====================
//  ELEMENT SELECTORS
// =====================
const pianoKeys = document.querySelectorAll('.piano-keys .key'); // All piano key elements
const volumeSlider = document.getElementById('volume-slider'); // Volume slider input
const keysCheckbox = document.getElementById('show-keys'); // Checkbox to toggle showing key labels
const musicIcon = document.querySelector('.music-icon'); // Icon that follows volume slider
const wrapper = document.querySelector('.wrapper'); // Wrapper for the piano UI

// Recording-related elements
const recordToggleBtn = document.getElementById('record-toggle');
const recordIcon = document.getElementById('record-icon');
const recordTimerEl = document.getElementById('record-timer');
const previewAudio = document.getElementById('record-preview');
const downloadLink = document.getElementById('download-link');
const replayBtn = document.getElementById('replay-btn');

// Hide recording UI elements initially
recordTimerEl.style.display = 'none';
previewAudio.style.display = 'none';
downloadLink.style.display = 'none';
replayBtn.style.display = 'none';

// Recording state variables
let mediaRecorder,
    chunks = [],              // Stores raw recorded audio data
    isRecording = false,      // Tracks if currently recording
    timerInterval = null,     // Interval for recording timer
    recordStartTime = 0,      // Timestamp when recording started
    recordedNotes = [];       // Notes + timing captured during recording

// =====================
//  AUDIO CONTEXT SETUP
// =====================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // Create audio context
const dest = audioCtx.createMediaStreamDestination(); // Output destination for recording
mediaRecorder = new MediaRecorder(dest.stream); // MediaRecorder to save audio stream

// When data is available, store it
mediaRecorder.ondataavailable = e => chunks.push(e.data);

// When recording stops, prepare playback + download
mediaRecorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'audio/webm' });
  const url = URL.createObjectURL(blob);
  previewAudio.src = url;
  downloadLink.href = url;
  downloadLink.download = 'piano-recording.webm';

  previewAudio.style.display = 'block';
  downloadLink.style.display = 'inline-block';
  replayBtn.style.display = recordedNotes.length ? 'inline-block' : 'none';
};

// =====================
//  TOGGLE RECORDING
// =====================
function toggleRecording() {
  if (!isRecording) {
    // Start recording
    chunks = [];
    recordedNotes = [];
    isRecording = true;
    mediaRecorder.start();
    recordStartTime = Date.now();

    // Change UI to recording mode
    recordIcon.classList.replace('fa-circle', 'fa-stop');
    recordTimerEl.style.display = 'inline-block';
    previewAudio.style.display = 'none';
    downloadLink.style.display = 'none';
    replayBtn.style.display = 'none';
    recordTimerEl.textContent = '00:00';

    // Start recording timer
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - recordStartTime) / 1000);
      const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const secs = String(elapsed % 60).padStart(2, '0');
      recordTimerEl.textContent = `${mins}:${secs}`;
    }, 1000);

  } else {
    // Stop recording
    isRecording = false;
    mediaRecorder.stop();
    recordIcon.classList.replace('fa-stop', 'fa-circle');
    clearInterval(timerInterval);
    recordTimerEl.style.display = 'none';
  }
}

// Listen for record button click
recordToggleBtn.addEventListener('click', toggleRecording);

// =====================
//  KEY MAPPING
// =====================
const keyToFileMap = {
  'a': 'A.wav', 'w': 'W.wav', 's': 'S.wav', 'd': 'D.wav', 'f': 'F.wav',
  't': 'T.wav', 'g': 'G.wav', 'y': 'Y.wav', 'h': 'H.wav', 'j': 'J.wav',
  'k': 'K.wav', 'o': 'O.wav', 'l': 'L.wav', 'p': 'D.wav', ';': 'L.wav',
  'z': 'Z.wav', 'x': 'X.wav', 'c': 'C.wav', 'v': 'V.wav', 'b': 'B.wav',
  'n': 'N.wav', 'm': 'M.wav', '1': '1.wav', '2': '2.wav', '4': '4.wav'
};

// Preload audio for each key
let audioMap = {};
pianoKeys.forEach(key => {
  const k = key.dataset.key;
  const file = keyToFileMap[k] || 'A.wav';
  const a = new Audio(`../assets/sounds/${file}`);
  a.volume = volumeSlider.value;
  audioMap[k] = a;

  key.addEventListener('click', () => playTune(k));
});

// =====================
//  PLAY NOTE FUNCTION
// =====================
function playTune(k) {
  const keyEl = document.querySelector(`.key[data-key="${k}"]`);
  const file = keyToFileMap[k] || 'A.wav';

  // Fetch and decode audio so it can also be recorded
  fetch(`../assets/sounds/${file}`)
    .then(res => res.arrayBuffer())
    .then(buf => audioCtx.decodeAudioData(buf))
    .then(decoded => {
      const src = audioCtx.createBufferSource();
      const gainNode = audioCtx.createGain();
      src.buffer = decoded;
      gainNode.gain.value = volumeSlider.value;
      src.connect(gainNode);
      gainNode.connect(audioCtx.destination); // Play through speakers
      gainNode.connect(dest); // Send to recorder
      src.start();
    });

  // Visual feedback (key press animation)
  keyEl.classList.add('active');
  setTimeout(() => keyEl.classList.remove('active'), 300);

  // Ripple effect at key location
  const rect = keyEl.getBoundingClientRect();
  if (rect) createRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);

  // Save note timing if recording
  if (isRecording) {
    const time = Date.now() - recordStartTime;
    recordedNotes.push({ key: k, time });
  }
}

// =====================
//  KEYBOARD EVENTS
// =====================
let pressed = new Set();
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (pressed.has(k) || !audioMap[k]) return;
  pressed.add(k);
  playTune(k);
});
document.addEventListener('keyup', e => pressed.delete(e.key.toLowerCase()));

// =====================
//  VOLUME SLIDER UPDATES
// =====================
function updateMusicIconPosition() {
  const val = parseFloat(volumeSlider.value);
  const w = volumeSlider.offsetWidth;
  musicIcon.style.left = `calc(${w * val}px - 9px)`;
}
function updateSliderBackground() {
  const pct = volumeSlider.value * 100;
  volumeSlider.style.background = `linear-gradient(to right, #d6770b ${pct}%, #444 ${pct}%)`;
}
volumeSlider.addEventListener('input', () => {
  updateMusicIconPosition();
  updateSliderBackground();
});
updateMusicIconPosition();
updateSliderBackground();

// =====================
//  TOGGLE KEY LABELS
// =====================
keysCheckbox.addEventListener('change', () =>
  pianoKeys.forEach(key => key.classList.toggle('hide'))
);

// =====================
//  RIPPLE EFFECT
// =====================
const canvas = document.getElementById('ripple-canvas');
const ctx = canvas.getContext('2d');
let ripples = [];

// Keep canvas full-screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Create ripple data
function createRipple(x, y, color = '#8a2be2') {
  for (let i = 0; i < 3; i++) {
    ripples.push({
      x, y,
      radius: 0,
      alpha: 0.2 + i * 0.1,
      color,
      speed: 2 + i,
      wave: 0.05 + i * 0.01
    });
  }
}

// Draw ripple animation
function animateRipples() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ripples.forEach((r, idx) => {
    r.radius += r.speed;
    r.alpha -= 0.005;
    r.wave += 0.001;
    if (r.alpha <= 0) ripples.splice(idx, 1);
    else {
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(138,43,226,${r.alpha})`;
      ctx.lineWidth = Math.sin(r.wave * 50) * 2 + 2;
      ctx.stroke();
    }
  });
  requestAnimationFrame(animateRipples);
}
animateRipples();

// =====================
//  REPLAY RECORDING
// =====================
replayBtn.addEventListener('click', () => {
  if (!recordedNotes.length) return;
  replayBtn.disabled = true;
  replayBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Replaying`;

  const startTime = Date.now();

  recordedNotes.forEach(note => {
    setTimeout(() => playTune(note.key), note.time);
  });

  setTimeout(() => {
    replayBtn.disabled = false;
    replayBtn.innerHTML = `<i class="fas fa-redo"></i> Replay`;
  }, recordedNotes[recordedNotes.length - 1].time + 500);
});

// =====================
//  PAGE LOAD ANIMATION
// =====================
window.addEventListener('load', () => wrapper.classList.add('loaded'));
