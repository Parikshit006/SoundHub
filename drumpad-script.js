// ===============================
// DRUMPAD SCRIPT (Fully Commented)
// ===============================

// -------------------------------
// Power State & Sound Mapping
// -------------------------------
let isPowerOn = true; // Controls whether the drum pad is active

// Mapping keys to their respective audio file paths
const soundMap = {
  Q: "../assets/sounds/Q.mp3",
  W: "../assets/sounds/W.mp3",
  E: "../assets/sounds/E.mp3",
  A: "../assets/sounds/A.mp3",
  S: "../assets/sounds/S.mp3",
  D: "../assets/sounds/D.mp3",
  Z: "../assets/sounds/Z.mp3",
  X: "../assets/sounds/X.mp3",
  C: "../assets/sounds/C.mp3"
};

// -------------------------------
// Timer Variables (currently unused in UI)
// -------------------------------
let timerInterval;
let timerSeconds = 0;
const timerDisplay = document.getElementById("timer");

// -------------------------------
// Audio Recording Setup
// -------------------------------
const audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // Web Audio API context
const dest = audioCtx.createMediaStreamDestination(); // Destination node for recording
const mediaRecorder = new MediaRecorder(dest.stream); // MediaRecorder for capturing audio
let chunks = []; // Stores audio data chunks
let isRecording = false; // Tracks if currently recording
let audioBlobUrl = null; // Stores recorded audio URL for playback/download
let recordedEvents = []; // Stores key events during recording
let recordingStartTime = null; // Timestamp when recording starts

// -------------------------------
// Control Button References
// -------------------------------
const recordBtn = document.getElementById("recordBtn");
const replayBtn = document.getElementById("replayBtn");
const downloadLink = document.getElementById("downloadLink");

// -------------------------------
// MediaRecorder Event Handlers
// -------------------------------

// Collect audio chunks when available
mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

// Process recorded data when recording stops
mediaRecorder.onstop = () => {
  // Create a Blob from the recorded chunks
  const blob = new Blob(chunks, { type: 'audio/webm' });
  audioBlobUrl = URL.createObjectURL(blob);

  // Prepare download link
  downloadLink.href = audioBlobUrl;
  downloadLink.download = "drumpad-recording.webm";

  // Show replay & download buttons
  replayBtn.style.display = "inline-block";
  downloadLink.style.display = "inline-block";
  recordBtn.style.display = "inline-block";
  recordBtn.innerHTML = '<i class="fas fa-circle"></i>'; // Record icon
  recordBtn.classList.remove("recording");
};

// -------------------------------
// Utility Functions
// -------------------------------

// Generate a random RGB color with transparency
function getRandomRGB() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 0.6)`;
}

// Play sound for a given key
function playSound(key, isReplay = false) {
  if (!isPowerOn) return; // Do nothing if power is off

  const k = key.toUpperCase();
  const audioSrc = soundMap[k];
  const pad = document.querySelector(`.pad[data-key="${k}"]`);

  // Exit if the key doesn't match a sound
  if (!audioSrc || !pad) return;

  // Fetch and decode audio, then play it
  fetch(audioSrc)
    .then((res) => res.arrayBuffer())
    .then((arrayBuffer) => audioCtx.decodeAudioData(arrayBuffer))
    .then((decoded) => {
      const trackSource = audioCtx.createBufferSource();
      trackSource.buffer = decoded;

      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 1;

      trackSource.connect(gainNode);
      gainNode.connect(audioCtx.destination); // For live playback
      gainNode.connect(dest); // For recording
      trackSource.start();
    });

  // Visual feedback on pad
  pad.classList.add("active");
  triggerRGBPulse(pad);
  triggerBackgroundPulse();
  setTimeout(() => pad.classList.remove("active"), 150);

  // Save event if recording (but not during replay)
  if (isRecording && !isReplay) {
    const time = Date.now() - recordingStartTime;
    recordedEvents.push({ key: k, time });
  }
}

// Create a temporary RGB pulse effect on the pad
function triggerRGBPulse(pad) {
  const pulse = document.createElement("div");
  pulse.classList.add("rgb-pulse");
  pulse.style.background = getRandomRGB();
  pulse.style.left = "40px";
  pulse.style.top = "40px";
  pad.appendChild(pulse);

  // Remove pulse after animation
  setTimeout(() => pulse.remove(), 400);
}

// Flash the background for a bass hit effect
function triggerBackgroundPulse() {
  document.body.classList.add("bass-pulse");
  setTimeout(() => document.body.classList.remove("bass-pulse"), 300);
}

// -------------------------------
// Event Listeners
// -------------------------------

// Pad click events
const pads = document.querySelectorAll(".pad");
pads.forEach((pad) => {
  pad.addEventListener("click", () => {
    playSound(pad.getAttribute("data-key"));
  });
});

// Keyboard keydown events
window.addEventListener("keydown", (e) => {
  playSound(e.key);
});

// -------------------------------
// Power Toggle
// -------------------------------
const toggleBtn = document.getElementById("toggle");

// Set initial toggle state
if (isPowerOn) toggleBtn.classList.add("toggle-on");

// Enable/disable pads based on power state
function updatePadState() {
  pads.forEach((pad) => {
    pad.style.opacity = isPowerOn ? "1" : "0.3";
    pad.style.pointerEvents = isPowerOn ? "auto" : "none";
  });
}

// Toggle power when button is clicked
toggleBtn.addEventListener("click", () => {
  isPowerOn = !isPowerOn;
  toggleBtn.classList.toggle("toggle-on", isPowerOn);
  updatePadState();
});

updatePadState(); // Initial state update

// -------------------------------
// Recording Controls
// -------------------------------

// Start/stop recording
recordBtn.addEventListener("click", () => {
  if (!isRecording) {
    // Start recording
    chunks = [];
    recordedEvents = [];
    recordingStartTime = Date.now();
    mediaRecorder.start();
    isRecording = true;

    // Update button states
    recordBtn.innerHTML = '<i class="fas fa-pause"></i>';
    recordBtn.classList.add("recording");
    replayBtn.style.display = "none";
    downloadLink.style.display = "none";
  } else {
    // Stop recording
    mediaRecorder.stop();
    isRecording = false;
  }
});

// Replay recorded sequence
replayBtn.addEventListener("click", () => {
  if (recordedEvents.length > 0) {
    replayBtn.disabled = true;
    replayBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    // Schedule each recorded note
    recordedEvents.forEach(({ key, time }) => {
      setTimeout(() => {
        playSound(key, true);
      }, time);
    });

    // Re-enable replay button after sequence finishes
    const totalDuration = recordedEvents[recordedEvents.length - 1].time + 500;
    setTimeout(() => {
      replayBtn.disabled = false;
      replayBtn.innerHTML = '<i class="fas fa-redo"></i>';
    }, totalDuration);
  }

  // Reset record button state
  recordBtn.style.display = "inline-block";
  recordBtn.innerHTML = '<i class="fas fa-circle"></i>';
  recordBtn.classList.remove("recording");
});
