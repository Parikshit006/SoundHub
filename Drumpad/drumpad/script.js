let isPowerOn = true;

const soundMap = {
  Q: "https://s3.amazonaws.com/freecodecamp/drums/RP4_KICK_1.mp3",
  W: "https://s3.amazonaws.com/freecodecamp/drums/Brk_Snr.mp3",
  E: "https://s3.amazonaws.com/freecodecamp/drums/Cev_H2.mp3",
  A: "https://s3.amazonaws.com/freecodecamp/drums/Heater-6.mp3",
  S: "https://s3.amazonaws.com/freecodecamp/drums/side_stick_1.mp3",
  D: "https://s3.amazonaws.com/freecodecamp/drums/Dsc_Oh.mp3",
  Z: "https://s3.amazonaws.com/freecodecamp/drums/Kick_n_Hat.mp3",
  X: "https://s3.amazonaws.com/freecodecamp/drums/Chord_1.mp3",
  C: "https://s3.amazonaws.com/freecodecamp/drums/Give_us_a_light.mp3"
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
  const audio = new Audio(audioSrc);
 audio.volume = 1.0;
audio.currentTime = 0;
  audio.play();

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
