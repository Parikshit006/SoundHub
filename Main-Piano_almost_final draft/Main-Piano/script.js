// Selectors
const pianoKeys = document.querySelectorAll('.piano-keys .key');
const volumeSlider = document.getElementById('volume-slider');
const keysCheckbox = document.getElementById('show-keys');
const musicIcon = document.querySelector('.music-icon');
const wrapper = document.querySelector('.wrapper');

const recordToggleBtn = document.getElementById('record-toggle');
const recordIcon = document.getElementById('record-icon');
const recordTimerEl = document.getElementById('record-timer');
const previewAudio = document.getElementById('record-preview');
const downloadLink = document.getElementById('download-link');
const replayBtn = document.getElementById('replay-btn');

// Hide timer, preview & download & replay on load
recordTimerEl.style.display = 'none';
previewAudio.style.display = 'none';
downloadLink.style.display = 'none';
replayBtn.style.display = 'none';

let mediaRecorder,
    chunks = [],
    isRecording = false,
    timerInterval = null,
    recordStartTime = 0,
    recordedNotes = [];

// Setup Web Audio context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const dest = audioCtx.createMediaStreamDestination();
mediaRecorder = new MediaRecorder(dest.stream);

// MediaRecorder events
mediaRecorder.ondataavailable = e => chunks.push(e.data);
mediaRecorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'audio/webm' });
  const url = URL.createObjectURL(blob);
  previewAudio.src = url;
  downloadLink.href = url;
  downloadLink.download = 'piano-recording.webm';

  // Show preview and download
  previewAudio.style.display = 'block';
  downloadLink.style.display = 'inline-block';
  replayBtn.style.display = recordedNotes.length ? 'inline-block' : 'none';
};

// Toggle recording
function toggleRecording() {
  if (!isRecording) {
    chunks = [];
    recordedNotes = [];
    isRecording = true;

    mediaRecorder.start();
    recordStartTime = Date.now();
    recordIcon.classList.replace('fa-microphone', 'fa-stop');
    recordTimerEl.style.display = 'inline-block';
    previewAudio.style.display = 'none';
    downloadLink.style.display = 'none';
    replayBtn.style.display = 'none';
    recordTimerEl.textContent = '00:00';

    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - recordStartTime) / 1000);
      const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const secs = String(elapsed % 60).padStart(2, '0');
      recordTimerEl.textContent = `${mins}:${secs}`;
    }, 1000);
  } else {
    isRecording = false;
    mediaRecorder.stop();
    recordIcon.classList.replace('fa-stop', 'fa-microphone');
    clearInterval(timerInterval);
    recordTimerEl.style.display = 'none';
  }
}

recordToggleBtn.addEventListener('click', toggleRecording);

// Key-to-file mapping
const keyToFileMap = {
  'a': 'A.wav', 'w': 'W.wav', 's': 'S.wav', 'd': 'D.wav', 'f': 'F.wav',
  't': 'T.wav', 'g': 'G.wav', 'y': 'Y.wav', 'h': 'H.wav', 'j': 'J.wav',
  'k': 'K.wav', 'o': 'O.wav', 'l': 'L.wav', 'p': 'D.wav', ';': 'L.wav',
  'z': 'Z.wav', 'x': 'X.wav', 'c': 'C.wav', 'v': 'V.wav', 'b': 'B.wav',
  'n': 'N.wav', 'm': 'M.wav', '1': '1.wav', '2': '2.wav', '4': '4.wav'
};

let audioMap = {};
pianoKeys.forEach(key => {
  const k = key.dataset.key;
  const file = keyToFileMap[k] || 'A.wav';
  const a = new Audio(`tunes/${file}`);
  a.volume = volumeSlider.value;
  audioMap[k] = a;

  key.addEventListener('click', () => playTune(k));
});

// Play note
function playTune(k) {
  const keyEl = document.querySelector(`.key[data-key="${k}"]`);
  const file = keyToFileMap[k] || 'A.wav';

  fetch(`tunes/${file}`)
    .then(res => res.arrayBuffer())
    .then(buf => audioCtx.decodeAudioData(buf))
    .then(decoded => {
      const src = audioCtx.createBufferSource();
      const gainNode = audioCtx.createGain();
      src.buffer = decoded;
      gainNode.gain.value = volumeSlider.value;
      src.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      gainNode.connect(dest);
      src.start();
    });

  // Visual effect
  keyEl.classList.add('active');
  setTimeout(() => keyEl.classList.remove('active'), 300);

  // Ripple
  const rect = keyEl.getBoundingClientRect();
  if (rect) createRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);

  if (isRecording) {
    const time = Date.now() - recordStartTime;
    recordedNotes.push({ key: k, time });
  }
}

// Keyboard support
let pressed = new Set();
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (pressed.has(k) || !audioMap[k]) return;
  pressed.add(k);
  playTune(k);
});
document.addEventListener('keyup', e => pressed.delete(e.key.toLowerCase()));

// Volume slider visuals
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

// Show/hide labels
keysCheckbox.addEventListener('change', () =>
  pianoKeys.forEach(key => key.classList.toggle('hide'))
);

// Ripple Canvas
const canvas = document.getElementById('ripple-canvas');
const ctx = canvas.getContext('2d');
let ripples = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

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

// Replay Button
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

// Load animation
window.addEventListener('load', () => wrapper.classList.add('loaded'));
