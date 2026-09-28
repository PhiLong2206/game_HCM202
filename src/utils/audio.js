// src/utils/audio.js
// Procedural Web Audio API sound generator for "ALL-IN: QUY TẮC ĐẠI ĐOÀN KẾT"

let audioCtx = null;
let isMuted = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setMuted(muted) {
  isMuted = muted;
}

export function getMuted() {
  return isMuted;
}

// Low-level beep/tone builder
function playTone({ freq, type = 'sine', duration = 0.2, gain = 0.15, attack = 0.01, decay = 0.1, detune = 0 }) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (detune) osc.detune.setValueAtTime(detune, ctx.currentTime);

    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(gain, now + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // audio context might be blocked prior to user interaction
  }
}

// 1. Countdown tick (analog clock pulse)
export function playTickSound(isWarning = false) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isWarning ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isWarning ? 880 : 440, now);
    osc.frequency.exponentialRampToValueAtTime(isWarning ? 330 : 220, now + 0.08);

    gain.gain.setValueAtTime(isWarning ? 0.2 : 0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch {}
}

// 2. Lock Bet (deep mechanical metallic click + thud)
export function playLockSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Sub thump
    const oscSub = ctx.createOscillator();
    const gainSub = ctx.createGain();
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(140, now);
    oscSub.frequency.exponentialRampToValueAtTime(45, now + 0.25);
    gainSub.gain.setValueAtTime(0.3, now);
    gainSub.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    oscSub.connect(gainSub);
    gainSub.connect(ctx.destination);
    oscSub.start(now);
    oscSub.stop(now + 0.25);

    // High metal snap
    const oscMetal = ctx.createOscillator();
    const gainMetal = ctx.createGain();
    oscMetal.type = 'square';
    oscMetal.frequency.setValueAtTime(750, now);
    oscMetal.frequency.exponentialRampToValueAtTime(180, now + 0.12);
    gainMetal.gain.setValueAtTime(0.12, now);
    gainMetal.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    oscMetal.connect(gainMetal);
    gainMetal.connect(ctx.destination);
    oscMetal.start(now);
    oscMetal.stop(now + 0.12);
  } catch {}
}

// 3. Question reveal (ominous dramatic suspense swell)
export function playRevealSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const chords = [130.81, 164.81, 196.00, 246.94]; // C-E-G-B
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      
      gain.gain.setValueAtTime(0.0001, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.2 + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + 0.95);
    });
  } catch {}
}

// 4. Correct answer (resonant triumphant chord)
export function playCorrectSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0.001, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + 0.75);
    });
  } catch {}
}

// 5. Wrong answer (heavy dull dissonant buzzer)
export function playWrongSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [150, 158]; // harsh beating dissonance
    freqs.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.48);
    });
  } catch {}
}

// 6. Warning / Jackpot alarm
export function playWarningAlarm() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(680, now + 0.15);
    osc.frequency.linearRampToValueAtTime(320, now + 0.3);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch {}
}

// 7. Final Round Glitch / Rule Detect sound
export function playGlitchSound() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Sub bass drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.6);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);

    // Random stutter beeps
    for (let i = 0; i < 6; i++) {
      const bOsc = ctx.createOscillator();
      const bGain = ctx.createGain();
      bOsc.type = 'square';
      bOsc.frequency.setValueAtTime(400 + Math.random() * 800, now + i * 0.07);
      bGain.gain.setValueAtTime(0.08, now + i * 0.07);
      bGain.gain.exponentialRampToValueAtTime(0.0001, now + (i + 1) * 0.07);
      bOsc.connect(bGain);
      bGain.connect(ctx.destination);
      bOsc.start(now + i * 0.07);
      bOsc.stop(now + (i + 1) * 0.07);
    }
  } catch {}
}

// 8. Winner Fanfare (Triumphant victory sequence)
export function playWinnerFanfare() {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const chords = [
      { t: 0.0, freqs: [261.63, 329.63, 392.00] }, // C4
      { t: 0.25, freqs: [293.66, 369.99, 440.00] }, // D4
      { t: 0.50, freqs: [329.63, 415.30, 493.88] }, // E4
      { t: 0.85, freqs: [523.25, 659.25, 783.99, 1046.50] } // C5 Grand
    ];

    chords.forEach(({ t, freqs }, idx) => {
      const dur = idx === chords.length - 1 ? 1.4 : 0.22;
      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + t);
        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.exponentialRampToValueAtTime(0.18, now + t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + dur);
      });
    });
  } catch {}
}
