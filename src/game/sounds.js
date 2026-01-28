// Web Audio API sound generation for cat-friendly gentle sounds
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function playChime(pitch = 0) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle frequencies in a pentatonic scale
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0];
    osc.frequency.value = notes[pitch % notes.length];

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Audio not available, silently skip
  }
}

export function tryVibrate() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  } catch {
    // Vibration not available
  }
}
