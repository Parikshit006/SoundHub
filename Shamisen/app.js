let mediaRecorder;
let recordedChunks = [];
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let dest = audioContext.createMediaStreamDestination();

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

document.getElementById('startRecording').addEventListener('click', () => {
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(dest.stream);

  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'audio/wav' });
    const audioURL = URL.createObjectURL(blob);
    const audioPreview = document.getElementById('audioPreview');
    const downloadLink = document.getElementById('downloadLink');

    audioPreview.src = audioURL;
    audioPreview.style.display = 'block';

    downloadLink.href = audioURL;
    downloadLink.style.display = 'inline-block';
  };

  mediaRecorder.start();
});

document.getElementById('stopRecording').addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
});

document.getElementById('replayAudio').addEventListener('click', () => {
  const audio = document.getElementById('audioPreview');
  if (audio.src) {
    audio.currentTime = 0;
    audio.play();
  }
});
const shamisenKeyMap = {
  a: 'music_lute01.mp3',
  s: 'music_lute02.mp3',
  d: 'music_lute03.mp3',
  f: 'music_lute04.mp3',
  g: 'music_lute05.mp3',
};

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  const file = shamisenKeyMap[key];
  if (file) {
    play(file);

    // Highlight the string like hover
    const index = Object.keys(shamisenKeyMap).indexOf(key) + 1;
    const vline = document.getElementById(`vline${index}`);
    if (vline) {
      vline.classList.add('active-key');
      setTimeout(() => {
        vline.classList.remove('active-key');
      }, 200); // Highlight duration
    }
  }
});



