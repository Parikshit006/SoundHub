const pianoKeys = document.querySelectorAll(".piano-keys .key"),
volumeSlider = document.querySelector(".volume-slider input"),
keysCheckbox = document.querySelector(".keys-checkbox input");

let allKeys = [];

// Audio setup for playback + recording
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
  document.getElementById("downloadLink").download = "piano-recording.webm";
};

// Recording controls
function startRecording() {
  chunks = [];
  mediaRecorder.start();
}

function stopRecording() {
  mediaRecorder.stop();
}

// Updated playTune function with recording support
const playTune = (key) => {
  const clickedKey = document.querySelector(`[data-key="${key}"]`);
  clickedKey.classList.add("active");
  setTimeout(() => clickedKey.classList.remove("active"), 150);

  fetch(`tunes/${key}.wav`)
    .then(res => res.arrayBuffer())
    .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
    .then(decoded => {
      const trackSource = audioCtx.createBufferSource();
      trackSource.buffer = decoded;

      const gainNode = audioCtx.createGain();
      gainNode.gain.value = volumeSlider.value;

      trackSource.connect(gainNode);
      gainNode.connect(audioCtx.destination); // speakers
      gainNode.connect(dest);                 // recorder

      trackSource.start();
    });
};

// Key binding logic
pianoKeys.forEach(key => {
  allKeys.push(key.dataset.key);
  key.addEventListener("click", () => playTune(key.dataset.key));
});

const handleVolume = (e) => {
  // Volume handled via gainNode in playTune
};

const showHideKeys = () => {
  pianoKeys.forEach(key => key.classList.toggle("hide"));
};

const pressedKey = (e) => {
  if(allKeys.includes(e.key)) playTune(e.key);
};

keysCheckbox.addEventListener("click", showHideKeys);
volumeSlider.addEventListener("input", handleVolume);
document.addEventListener("keydown", pressedKey);
