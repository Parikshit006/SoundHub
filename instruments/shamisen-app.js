let mediaRecorder;
let recordedChunks = [];
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let dest = audioContext.createMediaStreamDestination();

let isRecording = false;
let timerInterval;
let secondsElapsed = 0;

// Audio playback function
function play(file) {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const audio = new Audio(file);
  audio.addEventListener('canplaythrough', () => {
    const source = audioContext.createMediaElementSource(audio);
    source.connect(audioContext.destination);
    source.connect(dest);
    audio.play();
  });
}

document.addEventListener('click', () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}, { once: true });

// DOM Elements
const startBtn = document.getElementById('startRecording');
const replayBtn = document.getElementById('replayAudio');
const audioPreview = document.getElementById('audioPreview');
const downloadLink = document.getElementById('downloadLink');
const timerDisplay = document.getElementById('recordingTimer');

// Start/Stop toggle logic
startBtn.addEventListener('click', () => {
  if (!isRecording) {
    // START RECORDING
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(dest.stream);

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'audio/wav' });
      const audioURL = URL.createObjectURL(blob);
      audioPreview.src = audioURL;

      downloadLink.href = audioURL;
      downloadLink.style.display = 'inline-block';
      replayBtn.style.display = 'inline-block';

      startBtn.innerHTML = `<i class="fas fa-circle"></i> <span>Record</span>`;
      startBtn.classList.remove('active-button');

      clearInterval(timerInterval);
      timerDisplay.style.display = 'none';
    };

    mediaRecorder.start();

    isRecording = true;
    startBtn.innerHTML = `<i class="fas fa-stop"></i> <span>Stop</span>`;
    startBtn.classList.add('active-button');

    // Start timer
    secondsElapsed = 0;
    timerDisplay.style.display = 'block';
    timerDisplay.textContent = 'Recording: 0s';

    timerInterval = setInterval(() => {
      secondsElapsed++;
      timerDisplay.textContent = `Recording: ${secondsElapsed}s`;
    }, 1000);

    replayBtn.style.display = 'none';
    downloadLink.style.display = 'none';
  } else {
    // STOP RECORDING
    mediaRecorder.stop();
    isRecording = false;
  }
});

// Replay
replayBtn.addEventListener('click', () => {
  if (audioPreview.src) {
    audioPreview.currentTime = 0;
    audioPreview.play();
  }
});

// Keyboard to audio mapping
const shamisenKeyMap = {
  a: '../assets/sounds/music_lute01.mp3',
  s: '../assets/sounds/music_lute02.mp3',
  d: '../assets/sounds/music_lute03.mp3',
  f: '../assets/sounds/music_lute04.mp3',
  g: '../assets/sounds/music_lute05.mp3',
};

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  const file = shamisenKeyMap[key];
  if (file) {
    play(file);

    const index = Object.keys(shamisenKeyMap).indexOf(key) + 1;
    const vline = document.getElementById(`vline${index}`);
    if (vline) {
      vline.classList.add('active-key');
      setTimeout(() => vline.classList.remove('active-key'), 200);
    }
  }
});