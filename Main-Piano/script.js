const pianoKeys = document.querySelectorAll('.piano-keys .key');
const volumeSlider = document.getElementById('volume-slider');
const keysCheckbox = document.getElementById('show-keys');
const musicIcon = document.querySelector('.music-icon');
const wrapper = document.querySelector('.wrapper');

// Mapping keys to file names
const keyToFileMap = {
  'a': 'A.wav', 'w': 'W.wav', 's': 'S.wav', 'd': 'D.wav', 'f': 'F.wav',
  't': 'T.wav', 'g': 'G.wav', 'y': 'Y.wav', 'h': 'H.wav', 'j': 'J.wav',
  'k': 'K.wav', 'o': 'O.wav', 'l': 'L.wav', 'p': 'D.wav', ';': 'L.wav',
  'z': 'Z.wav', 'x': 'X.wav', 'c': 'C.wav', 'v': 'V.wav', 'b': 'B.wav',
  'n': 'N.wav', 'm': 'M.wav', '1': '1.wav', '2': '2.wav', '4': '4.wav'
};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const dest = audioCtx.createMediaStreamDestination();
const mediaRecorder = new MediaRecorder(dest.stream);
let chunks = [];

mediaRecorder.ondataavailable = e => chunks.push(e.data);
mediaRecorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'audio/webm' });
  const url = URL.createObjectURL(blob);
  document.getElementById('record-preview').src = url;
  document.getElementById('download-link').href = url;
  document.getElementById('download-link').download = 'piano-recording.webm';
};

function startRecording() {
  chunks = [];
  mediaRecorder.start();
}

function stopRecording() {
  mediaRecorder.stop();
}

let audioMap = {};
pianoKeys.forEach(key => {
  const keyChar = key.dataset.key;
  let fileName = keyToFileMap[keyChar] || 'A.wav';

  const audio = new Audio(`tunes/${fileName}`);
  audio.volume = volumeSlider.value;
  audioMap[keyChar] = audio;

  key.addEventListener('click', () => playTune(keyChar));
});

function playTune(keyChar) {
  const keyEl = document.querySelector(`.key[data-key="${keyChar}"]`);
  const fileName = keyToFileMap[keyChar] || 'A.wav';

  fetch(`tunes/${fileName}`)
    .then(res => res.arrayBuffer())
    .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
    .then(decoded => {
      const src = audioCtx.createBufferSource();
      const gainNode = audioCtx.createGain();

      src.buffer = decoded;
      gainNode.gain.value = volumeSlider.value;

      src.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      gainNode.connect(dest); // Send to recorder too

      src.start();
    });

  keyEl?.classList.add('active');
  setTimeout(() => keyEl?.classList.remove('active'), 300);

  const rect = keyEl?.getBoundingClientRect();
  if (rect) createRipple(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

// Keyboard interaction
let pressed = new Set();
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (pressed.has(k) || !audioMap[k]) return;
  pressed.add(k);
  playTune(k);
});
document.addEventListener('keyup', e => {
  pressed.delete(e.key.toLowerCase());
});

function updateMusicIconPosition() {
  const value = parseFloat(volumeSlider.value);
  const sliderWidth = volumeSlider.offsetWidth;
  const iconOffset = sliderWidth * value;
  musicIcon.style.left = `calc(${iconOffset}px - 9px)`;
}
function updateSliderBackground() {
  const value = volumeSlider.value * 100;
  volumeSlider.style.background = `linear-gradient(to right, #d6770b ${value}%, #444 ${value}%)`;
}
volumeSlider.addEventListener("input", () => {
  updateMusicIconPosition();
  updateSliderBackground();
});
updateMusicIconPosition();
updateSliderBackground();

keysCheckbox.addEventListener('change', () => {
  pianoKeys.forEach(key => key.classList.toggle('hide'));
});
window.addEventListener('load', () => wrapper.classList.add('loaded'));

// Ripple canvas
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
    if (r.alpha <= 0) {
      ripples.splice(idx, 1);
    } else {
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
