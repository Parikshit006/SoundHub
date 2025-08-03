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

mediaRecorder.ondataavailable = e => chunks.push(e.data);
mediaRecorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'audio/webm' });
  const url = URL.createObjectURL(blob);
  document.getElementById("audioPlayer").src = url;
  document.getElementById("downloadLink").href = url;
  document.getElementById("downloadLink").download = "drumpad-recording.webm";
};

function getRandomRGB() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 0.6)`;
}

function playSound(key) {
  if (!isPowerOn) return;
  const k = key.toUpperCase();
  const audioSrc = soundMap[k];
  const pad = document.querySelector(`.pad[data-key="${k}"]`);
  if (!audioSrc || !pad) return;

  fetch(audioSrc)
    .then(res => res.arrayBuffer())
    .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
    .then(decoded => {
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
}

function triggerRGBPulse(pad) {
  const pulse = document.createElement("div");
  pulse.classList.add("rgb-pulse");
  pulse.style.background = getRandomRGB();
  pulse.style.left = "40px";
  pulse.style.top = "40px";
  pad.appendChild(pulse);
  setTimeout(() => pulse.remove(), 400);
}

function triggerBackgroundPulse() {
  document.body.classList.add("bass-pulse");
  setTimeout(() => document.body.classList.remove("bass-pulse"), 300);
}

const pads = document.querySelectorAll(".pad");
pads.forEach(pad => {
  pad.addEventListener("click", () => {
    playSound(pad.getAttribute("data-key"));
  });
});

window.addEventListener("keydown", (e) => {
  playSound(e.key);
});

const toggleBtn = document.getElementById("toggle");
if (isPowerOn) toggleBtn.classList.add("toggle-on");

function updatePadState() {
  pads.forEach(pad => {
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

// Recording controls
const controls = document.createElement("div");
controls.className = "controls";
controls.innerHTML = `
  <button id="startRec">Start Recording</button>
  <button id="stopRec">Stop Recording</button>
  <button id="replay">Replay</button>
  <a id="downloadLink">Download</a>
  <audio id="audioPlayer" controls></audio>
`;
document.querySelector(".machine-panel").appendChild(controls);

document.getElementById("startRec").addEventListener("click", () => {
  chunks = [];
  mediaRecorder.start();
});

document.getElementById("stopRec").addEventListener("click", () => {
  mediaRecorder.stop();
});

document.getElementById("replay").addEventListener("click", () => {
  document.getElementById("audioPlayer").play();
});
