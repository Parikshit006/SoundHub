let isPowerOn = true;

const soundMap = {
  Q: "sounds/Q.mp3",
  W: "sounds/W.mp3",
  E: "sounds/E.mp3",
  A: "sounds/A.mp3",
  S: "sounds/S.mp3",
  D: "sounds/D.mp3",
  Z: "sounds/Z.mp3",
  X: "sounds/X.mp3",
  C: "sounds/C.mp3"
};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const dest = audioCtx.createMediaStreamDestination();
const mediaRecorder = new MediaRecorder(dest.stream);
let chunks = [];
let isRecording = false;
let audioBlobUrl = null;
let recordedEvents = [];
let recordingStartTime = null;

const recordBtn = document.getElementById("recordBtn");
const replayBtn = document.getElementById("replayBtn");
const downloadLink = document.getElementById("downloadLink");

mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

mediaRecorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'audio/webm' });
  audioBlobUrl = URL.createObjectURL(blob);
  downloadLink.href = audioBlobUrl;
  downloadLink.download = "drumpad-recording.webm";

  // Show controls
  replayBtn.style.display = "inline-block";
  downloadLink.style.display = "inline-block";
  recordBtn.style.display = "inline-block";
  recordBtn.innerHTML = `<i class="fas fa-circle"></i>`;
  recordBtn.classList.remove("recording");
};

function getRandomRGB() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 0.6)`;
}

// Play sound
function playSound(key, isReplay = false) {
  if (!isPowerOn) return;
  const k = key.toUpperCase();
  const audioSrc = soundMap[k];
  const pad = document.querySelector(`.pad[data-key="${k}"]`);
  if (!audioSrc || !pad) return;

  fetch(audioSrc)
    .then((res) => res.arrayBuffer())
    .then((arrayBuffer) => audioCtx.decodeAudioData(arrayBuffer))
    .then((decoded) => {
      const trackSource = audioCtx.createBufferSource();
      trackSource.buffer = decoded;
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 1;
      trackSource.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      gainNode.connect(dest);
      trackSource.start();
    });

  pad.classList.add("active");
  triggerRGBPulse(pad);
  triggerBackgroundPulse();
  setTimeout(() => pad.classList.remove("active"), 150);

  if (isRecording && !isReplay) {
    const time = Date.now() - recordingStartTime;
    recordedEvents.push({ key: k, time });
  }
}

// RGB effect
function triggerRGBPulse(pad) {
  const pulse = document.createElement("div");
  pulse.classList.add("rgb-pulse");
  pulse.style.background = getRandomRGB();
  pulse.style.left = "40px";
  pulse.style.top = "40px";
  pad.appendChild(pulse);
  setTimeout(() => pulse.remove(), 400);
}

// Background effect
function triggerBackgroundPulse() {
  document.body.classList.add("bass-pulse");
  setTimeout(() => document.body.classList.remove("bass-pulse"), 300);
}

// Pad click
const pads = document.querySelectorAll(".pad");
pads.forEach((pad) => {
  pad.addEventListener("click", () => {
    playSound(pad.getAttribute("data-key"));
  });
});

// Keyboard press
window.addEventListener("keydown", (e) => {
  playSound(e.key);
});

// Power toggle
const toggleBtn = document.getElementById("toggle");
if (isPowerOn) toggleBtn.classList.add("toggle-on");

function updatePadState() {
  pads.forEach((pad) => {
    pad.style.opacity = isPowerOn ? "1" : "0.3";
    pad.style.pointerEvents = isPowerOn ? "auto" : "none";
  });
}

toggleBtn.addEventListener("click", () => {
  isPowerOn = !isPowerOn;
  toggleBtn.classList.toggle("toggle-on", isPowerOn);
  updatePadState();
});

updatePadState();

// Record toggle
recordBtn.addEventListener("click", () => {
  if (!isRecording) {
    chunks = [];
    recordedEvents = [];
    recordingStartTime = Date.now();
    mediaRecorder.start();
    isRecording = true;
    recordBtn.innerHTML = `<i class="fas fa-pause"></i>`;
    recordBtn.classList.add("recording");
    replayBtn.style.display = "none";
    downloadLink.style.display = "none";
  } else {
    mediaRecorder.stop();
    isRecording = false;
  }
});

// Replay
replayBtn.addEventListener("click", () => {
  if (audioBlobUrl && recordedEvents.length > 0) {
    const audio = new Audio(audioBlobUrl);
    const baseTime = recordedEvents[0].time;
    audio.play();
    recordedEvents.forEach(({ key, time }) => {
      const delay = time - baseTime;
      setTimeout(() => {
        playSound(key, true);
      }, delay);
    });
  }

  recordBtn.style.display = "inline-block";
  recordBtn.innerHTML = `<i class="fas fa-circle"></i>`;
  recordBtn.classList.remove("recording");
});
