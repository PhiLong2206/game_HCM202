// src/utils/audio.js
// Procedural Web Audio API sound generator for "ĐẤU TRƯỜNG ĐẠI ĐOÀN KẾT"
// Classroom Game Show Sound Design: Crowd Cheer & Applause, Comedy Trombone "Téo tèo teo", Victory Roar

let audioCtx = null;
let isMuted = false;
let currentVolume = 0.6; // Default 60%
let cachedNoiseBuffer = null;

// Initialize from localStorage if available
try {
  const savedEnabled = localStorage.getItem('gameSoundEnabled');
  if (savedEnabled !== null) {
    isMuted = savedEnabled === 'false';
  }
  const savedVol = localStorage.getItem('gameSoundVolume');
  if (savedVol !== null) {
    const v = parseFloat(savedVol);
    if (!isNaN(v) && v >= 0 && v <= 1) {
      currentVolume = v;
    }
  }
} catch {}

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
  try {
    localStorage.setItem('gameSoundEnabled', String(!muted));
  } catch {}
}

export function getMuted() {
  return isMuted;
}

export function setVolume(vol) {
  currentVolume = Math.max(0, Math.min(1, vol));
  try {
    localStorage.setItem('gameSoundVolume', String(currentVolume));
  } catch {}
}

export function getVolume() {
  return currentVolume;
}

// Low-level helper to scale volume relative to baseline
function getGainMultiplier() {
  if (isMuted || currentVolume <= 0) return 0;
  return currentVolume / 0.6;
}

// Noise buffer generator for realistic applause synthesis
function getNoiseBuffer(ctx) {
  if (cachedNoiseBuffer && cachedNoiseBuffer.sampleRate === ctx.sampleRate) {
    return cachedNoiseBuffer;
  }
  const bufferSize = ctx.sampleRate * 5.0; // 5 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  cachedNoiseBuffer = buffer;
  return buffer;
}

// Procedural Crowd Applause (Realistic clapping hands chorus)
function createCrowdApplause(ctx, now, duration = 2.4, peakVol = 0.22) {
  const noise = ctx.createBufferSource();
  noise.buffer = getNoiseBuffer(ctx);

  // Bandpass filter centered at 1400Hz for hand-clap acoustics
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1400, now);
  filter.Q.setValueAtTime(1.8, now);

  // Overall amplitude envelope (rapid rise, sustained cheers, smooth taper)
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.001, now);
  masterGain.gain.exponentialRampToValueAtTime(peakVol, now + 0.35);
  masterGain.gain.setValueAtTime(peakVol * 0.9, now + duration * 0.6);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  // Clapping density amplitude flutter
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sawtooth';
  lfo.frequency.setValueAtTime(15, now); // ~15 claps per second texture
  lfoGain.gain.setValueAtTime(peakVol * 0.45, now);

  noise.connect(filter);
  filter.connect(masterGain);
  masterGain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration + 0.05);
}

// Procedural Human Vocal Cheer ("Woooo!")
function createCrowdVocalCheer(ctx, now, duration = 2.2, startFreq = 250, endFreq = 390, peakVol = 0.18) {
  // Dual detuned oscillators for chorus/crowd feel
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();

  osc1.type = 'sawtooth';
  osc2.type = 'triangle';
  osc3.type = 'sine';

  // Pitch sweep up (enthusiastic upward human inflection)
  [osc1, osc2, osc3].forEach((osc, idx) => {
    const detuneCents = (idx - 1) * 12; // -12, 0, +12 cents
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.6);
    osc.frequency.exponentialRampToValueAtTime(endFreq * 0.92, now + duration);
    osc.detune.setValueAtTime(detuneCents, now);
  });

  // Human vocal formant filter ("Woo" sound: center around 1100Hz with high resonance)
  const formantFilter = ctx.createBiquadFilter();
  formantFilter.type = 'bandpass';
  formantFilter.frequency.setValueAtTime(950, now);
  formantFilter.frequency.exponentialRampToValueAtTime(1250, now + 0.5);
  formantFilter.frequency.exponentialRampToValueAtTime(900, now + duration);
  formantFilter.Q.setValueAtTime(3.2, now);

  // Vibrato LFO for realistic cheering wobble
  const vibrato = ctx.createOscillator();
  const vibratoGain = ctx.createGain();
  vibrato.frequency.setValueAtTime(5.5, now); // 5.5Hz vibrato
  vibratoGain.gain.setValueAtTime(14, now);
  vibrato.connect(osc1.frequency);
  vibrato.connect(osc2.frequency);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peakVol, now + 0.3);
  gain.gain.exponentialRampToValueAtTime(peakVol * 0.85, now + duration * 0.65);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc1.connect(formantFilter);
  osc2.connect(formantFilter);
  osc3.connect(formantFilter);
  formantFilter.connect(gain);
  gain.connect(ctx.destination);

  vibrato.start(now);
  osc1.start(now);
  osc2.start(now);
  osc3.start(now);

  vibrato.stop(now + duration + 0.05);
  osc1.stop(now + duration + 0.05);
  osc2.stop(now + duration + 0.05);
  osc3.stop(now + duration + 0.05);
}

// Procedural Comedy Trombone Fail ("TÉO TÈO TEO..." / "Wah-Wah-Waaaaah")
function createComedyTrombone(ctx, now, mult = 1.0) {
  // 4 notes: Eb4 (311Hz) -> D4 (293Hz) -> Db4 (277Hz) -> C4 (261Hz) sliding to B3 (246Hz)
  const notes = [
    { t: 0.00, dur: 0.32, freq: 311.13, slideTo: 311.13, wah: true }, // Téo
    { t: 0.36, dur: 0.32, freq: 293.66, slideTo: 293.66, wah: true }, // Tèo
    { t: 0.72, dur: 0.32, freq: 277.18, slideTo: 277.18, wah: true }, // Teo
    { t: 1.08, dur: 0.85, freq: 261.63, slideTo: 246.94, wah: true, vibrato: true } // Tèoooo...
  ];

  notes.forEach(({ t, dur, freq, slideTo, vibrato }) => {
    const noteStart = now + t;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const wahFilter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, noteStart);
    if (slideTo !== freq) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, noteStart + dur);
    }

    // Vibrato on the long final note for extra comedic effect
    if (vibrato) {
      const vibOsc = ctx.createOscillator();
      const vibGain = ctx.createGain();
      vibOsc.frequency.setValueAtTime(5.0, noteStart + 0.2);
      vibGain.gain.setValueAtTime(10, noteStart + 0.2);
      vibOsc.connect(osc.frequency);
      vibOsc.start(noteStart + 0.2);
      vibOsc.stop(noteStart + dur + 0.05);
    }

    // Plunger Mute "Wah" Filter (Lowpass sweep from dark to bright and back)
    wahFilter.type = 'lowpass';
    wahFilter.Q.setValueAtTime(5.5, noteStart);
    wahFilter.frequency.setValueAtTime(350, noteStart);
    wahFilter.frequency.exponentialRampToValueAtTime(1600, noteStart + dur * 0.35); // Open "Wah"
    wahFilter.frequency.exponentialRampToValueAtTime(400, noteStart + dur); // Close

    // Envelope
    gain.gain.setValueAtTime(0.001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.22 * mult, noteStart + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur);

    osc.connect(wahFilter);
    wahFilter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteStart);
    osc.stop(noteStart + dur + 0.05);
  });
}

// =========================================================================
// 1. TRẢ LỜI ĐÚNG: CROWD CHEER (correct-cheer.mp3)
// Tiếng vỗ tay + hò reo "Wooo!" sôi động của khán giả lớp học (2–3 giây)
// =========================================================================
export function playCorrectCheerSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Warm major brass accent at start [C5, E5, G5]
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);
      gain.gain.setValueAtTime(0.001, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.14 * mult, now + i * 0.04 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + 0.75);
    });

    // 2. Realistic crowd applause (2.4s)
    createCrowdApplause(ctx, now, 2.4, 0.20 * mult);

    // 3. Human crowd vocal cheer "Woooo!" (2.2s)
    createCrowdVocalCheer(ctx, now + 0.08, 2.2, 260, 410, 0.16 * mult);
  } catch {}
}

export const playCorrectSound = playCorrectCheerSound;

// =========================================================================
// 2. TRẢ LỜI SAI: "TÉO TÈO TEO..." (wrong-sad.mp3)
// Gameshow/comedy fail sound plunger trombone (1.8s)
// =========================================================================
export function playWrongSadSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Comedic "TÉO TÈO TEO..." plunger trombone fail sound
    createComedyTrombone(ctx, now, mult);
  } catch {}
}

export const playWrongSound = playWrongSadSound;

// =========================================================================
// 3. TIMEOUT: timeout.mp3
// Clock tick -> sudden comedic "téo" pitch-drop dropoff (1 sound duy nhất)
// =========================================================================
export function playTimeoutSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 2 rapid clock ticks
    [0.0, 0.12].forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now + t);
      osc.frequency.exponentialRampToValueAtTime(440, now + t + 0.06);
      gain.gain.setValueAtTime(0.18 * mult, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.07);
    });

    // Comedic slide drop "téo"
    const dropOsc = ctx.createOscillator();
    const dropGain = ctx.createGain();
    const dropFilter = ctx.createBiquadFilter();

    dropOsc.type = 'sawtooth';
    dropOsc.frequency.setValueAtTime(330, now + 0.28);
    dropOsc.frequency.exponentialRampToValueAtTime(95, now + 0.85);

    dropFilter.type = 'lowpass';
    dropFilter.frequency.setValueAtTime(1200, now + 0.28);
    dropFilter.frequency.exponentialRampToValueAtTime(250, now + 0.85);

    dropGain.gain.setValueAtTime(0.001, now + 0.28);
    dropGain.gain.exponentialRampToValueAtTime(0.22 * mult, now + 0.32);
    dropGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    dropOsc.connect(dropFilter);
    dropFilter.connect(dropGain);
    dropGain.connect(ctx.destination);

    dropOsc.start(now + 0.28);
    dropOsc.stop(now + 0.95);
  } catch {}
}

// =========================================================================
// 4. ROUND 3 TƯƠNG TRỢ THÀNH CÔNG: team-cheer.mp3
// Vỗ tay ngắn + crowd cheer nhẹ (1.6s)
// =========================================================================
export function playTeamCheerSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Upward partnership chord [F4, A4, C5]
    [349.23, 440.00, 523.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.001, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.15 * mult, now + idx * 0.05 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + 0.7);
    });

    createCrowdApplause(ctx, now, 1.6, 0.18 * mult);
    createCrowdVocalCheer(ctx, now + 0.05, 1.5, 290, 420, 0.14 * mult);
  } catch {}
}

// =========================================================================
// 5. FINAL ĐẠI ĐOÀN KẾT THÀNH CÔNG: unity-success.mp3
// Crowd cheer + applause + triumphant fanfare (+300 PTS CHO TẤT CẢ) (3.2s)
// =========================================================================
export function playUnitySuccessSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Triumphant Fanfare Brass Chords
    const chords = [
      { t: 0.00, freqs: [261.63, 329.63, 392.00] }, // C4
      { t: 0.22, freqs: [329.63, 392.00, 523.25] }, // E4
      { t: 0.48, freqs: [523.25, 659.25, 783.99, 1046.50] } // Grand C5
    ];

    chords.forEach(({ t, freqs }, idx) => {
      const dur = idx === chords.length - 1 ? 1.8 : 0.2;
      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + t);
        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.exponentialRampToValueAtTime(0.16 * mult, now + t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + dur + 0.05);
      });
    });

    // Grand Crowd Applause & Cheering
    createCrowdApplause(ctx, now + 0.3, 3.0, 0.24 * mult);
    createCrowdVocalCheer(ctx, now + 0.35, 2.8, 250, 440, 0.20 * mult);
  } catch {}
}

export const playFinalSuccessSound = playUnitySuccessSound;

// =========================================================================
// 6. ĐỘI VÔ ĐỊCH TOP 1: victory-crowd.mp3
// Hoành tráng nhất game: Victory Fanfare + Roaring Crowd Cheering + Dense Applause (4.5s)
// =========================================================================
export function playVictoryCrowdSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Stage 1: Grand Olympic / Game Show Fanfare
    const fanfare = [
      { t: 0.00, freqs: [392.00] },             // G4
      { t: 0.12, freqs: [392.00] },             // G4
      { t: 0.24, freqs: [392.00] },             // G4
      { t: 0.38, freqs: [523.25, 659.25] },     // C5 - E5
      { t: 0.62, freqs: [587.33, 739.99] },     // D5 - F#5
      { t: 0.90, freqs: [523.25, 659.25, 783.99, 1046.50] } // GRAND C MAJOR CHORD
    ];

    fanfare.forEach(({ t, freqs }, idx) => {
      const isGrand = idx === fanfare.length - 1;
      const dur = isGrand ? 2.5 : 0.16;
      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isGrand ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + t);
        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.exponentialRampToValueAtTime((isGrand ? 0.22 : 0.16) * mult, now + t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + dur + 0.1);
      });
    });

    // Stage 2: Deep Sub Bass Timpani Thud
    const timpaniOsc = ctx.createOscillator();
    const timpaniGain = ctx.createGain();
    timpaniOsc.type = 'sine';
    timpaniOsc.frequency.setValueAtTime(130.81, now + 0.9);
    timpaniOsc.frequency.exponentialRampToValueAtTime(45, now + 1.8);
    timpaniGain.gain.setValueAtTime(0.35 * mult, now + 0.9);
    timpaniGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    timpaniOsc.connect(timpaniGain);
    timpaniGain.connect(ctx.destination);
    timpaniOsc.start(now + 0.9);
    timpaniOsc.stop(now + 1.85);

    // Stage 3: Roaring Crowd Cheering & Thunderous Applause (4.5 seconds)
    createCrowdApplause(ctx, now + 0.7, 4.2, 0.28 * mult);
    createCrowdVocalCheer(ctx, now + 0.8, 3.8, 230, 460, 0.25 * mult);

    // Stage 4: Celebration Fireworks Chimes Glissando
    const chimeNotes = [1046.50, 1318.51, 1567.98, 2093.00, 2637.02];
    chimeNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 1.2 + idx * 0.09);
      gain.gain.setValueAtTime(0.001, now + 1.2 + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.14 * mult, now + 1.2 + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 1.2 + idx * 0.09);
      osc.stop(now + 2.55);
    });
  } catch {}
}

export const playVictorySound = playVictoryCrowdSound;
export const playWinnerFanfare = playVictoryCrowdSound;
export const playTop1Sound = playVictoryCrowdSound;

// =========================================================================
// AUXILIARY & FATE SOUNDS
// =========================================================================

// 1. Countdown tick
export function playTickSound(isWarning = false) {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isWarning ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isWarning ? 880 : 440, now);
    osc.frequency.exponentialRampToValueAtTime(isWarning ? 330 : 220, now + 0.08);

    gain.gain.setValueAtTime((isWarning ? 0.2 : 0.09) * mult, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch {}
}

// 2. Lock Bet / Lock Answer
export function playLockSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const oscSub = ctx.createOscillator();
    const gainSub = ctx.createGain();
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(140, now);
    oscSub.frequency.exponentialRampToValueAtTime(45, now + 0.25);
    gainSub.gain.setValueAtTime(0.3 * mult, now);
    gainSub.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    oscSub.connect(gainSub);
    gainSub.connect(ctx.destination);
    oscSub.start(now);
    oscSub.stop(now + 0.25);

    const oscMetal = ctx.createOscillator();
    const gainMetal = ctx.createGain();
    oscMetal.type = 'square';
    oscMetal.frequency.setValueAtTime(750, now);
    oscMetal.frequency.exponentialRampToValueAtTime(180, now + 0.12);
    gainMetal.gain.setValueAtTime(0.12 * mult, now);
    gainMetal.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    oscMetal.connect(gainMetal);
    gainMetal.connect(ctx.destination);
    oscMetal.start(now);
    oscMetal.stop(now + 0.12);
  } catch {}
}

// 3. Question / Card reveal
export function playRevealSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const chords = [130.81, 164.81, 196.00, 246.94];
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.12 * mult, now + 0.2 + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + 0.95);
    });
  } catch {}
}

// 4. Fate reveal whoosh
export function playFateRevealSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.2 * mult, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  } catch {}
}

// 5. Reward / Lucky
export function playRewardSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [987.77, 1318.51].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.22 * mult, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.7);
    });
  } catch {}
}

// 6. Jackpot
export function playJackpotSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const stages = [
      { t: 0.00, freqs: [261.63, 329.63, 392.00] },
      { t: 0.18, freqs: [329.63, 392.00, 523.25] },
      { t: 0.36, freqs: [392.00, 523.25, 659.25, 783.99] },
      { t: 0.58, freqs: [523.25, 659.25, 783.99, 1046.50] }
    ];
    stages.forEach(({ t, freqs }, idx) => {
      const isGrand = idx === stages.length - 1;
      const dur = isGrand ? 1.2 : 0.18;
      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + t);
        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.exponentialRampToValueAtTime((isGrand ? 0.22 : 0.14) * mult, now + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + dur + 0.05);
      });
    });
  } catch {}
}

// 7. Ally
export function playAllySound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [
      { freq: 349.23, t: 0.00 },
      { freq: 440.00, t: 0.08 },
      { freq: 523.25, t: 0.18 }
    ].forEach(({ freq, t }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + t);
      gain.gain.setValueAtTime(0.001, now + t);
      gain.gain.exponentialRampToValueAtTime(0.18 * mult, now + t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.85);
    });
  } catch {}
}

// 8. Team-up
export function playTeamUpSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const chords = [
      { t: 0.00, freqs: [261.63, 392.00] },
      { t: 0.15, freqs: [349.23, 440.00, 523.25, 698.46] }
    ];
    chords.forEach(({ t, freqs }, idx) => {
      const dur = idx === 1 ? 0.9 : 0.14;
      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + t);
        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.exponentialRampToValueAtTime(0.2 * mult, now + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t);
        osc.stop(now + t + dur + 0.05);
      });
    });
  } catch {}
}

// 9. Shield
export function playShieldSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [587.33, 880.00, 1174.66, 1760.00].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.001, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.14 * mult, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + 0.95);
    });
  } catch {}
}

// 10. Shield block
export function playShieldBlockSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const oscAnvil = ctx.createOscillator();
    const gainAnvil = ctx.createGain();
    oscAnvil.type = 'sawtooth';
    oscAnvil.frequency.setValueAtTime(620, now);
    oscAnvil.frequency.exponentialRampToValueAtTime(280, now + 0.2);
    gainAnvil.gain.setValueAtTime(0.3 * mult, now);
    gainAnvil.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    oscAnvil.connect(gainAnvil);
    gainAnvil.connect(ctx.destination);
    oscAnvil.start(now);
    oscAnvil.stop(now + 0.25);

    const oscBell = ctx.createOscillator();
    const gainBell = ctx.createGain();
    oscBell.type = 'sine';
    oscBell.frequency.setValueAtTime(1480, now + 0.05);
    gainBell.gain.setValueAtTime(0.001, now + 0.05);
    gainBell.gain.exponentialRampToValueAtTime(0.2 * mult, now + 0.07);
    gainBell.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    oscBell.connect(gainBell);
    gainBell.connect(ctx.destination);
    oscBell.start(now + 0.05);
    oscBell.stop(now + 0.85);
  } catch {}
}

// 11. Bad luck
export function playBadLuckSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(95, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.55);
    subGain.gain.setValueAtTime(0.28 * mult, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.58);
  } catch {}
}

// 12. Mystery gift
export function playMysterySound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 622.25, 783.99, 932.33, 1174.66].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.001, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.18 * mult, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.4);
    });
  } catch {}
}

// 13. Unity Unlock
export function playUnityUnlockSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [261.63, 329.63, 392.00, 493.88].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.001, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.18 * mult, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.2);
    });

    [523.25, 659.25, 783.99, 1046.50].forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.55);
      gain.gain.setValueAtTime(0.001, now + 0.55);
      gain.gain.exponentialRampToValueAtTime(0.22 * mult, now + 0.58);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.55);
      osc.stop(now + 1.85);
    });
  } catch {}
}

// Top 4 Announcement gong
export function playTop4Sound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(110, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
    subGain.gain.setValueAtTime(0.28 * mult, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.38);

    [196.00, 293.66, 392.00].forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.05);
      gain.gain.setValueAtTime(0.001, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.14 * mult, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.05);
      osc.stop(now + 1.0);
    });
  } catch {}
}

// Top 3 Bronze Medal Fanfare
export function playTop3Sound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [
      { t: 0.0, freq: 233.08 },
      { t: 0.12, freq: 293.66 },
      { t: 0.24, freq: 349.23 },
      { t: 0.38, freq: 466.16 }
    ].forEach(({ t, freq }, idx) => {
      const dur = idx === 3 ? 0.75 : 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + t);
      gain.gain.setValueAtTime(0.001, now + t);
      gain.gain.exponentialRampToValueAtTime(0.16 * mult, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + dur + 0.05);
    });
  } catch {}
}

// Top 2 Silver Medal Fanfare
export function playTop2Sound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [
      { t: 0.0, freq: 293.66 },
      { t: 0.10, freq: 369.99 },
      { t: 0.20, freq: 440.00 },
      { t: 0.32, freq: 587.33 }
    ].forEach(({ t, freq }, idx) => {
      const dur = idx === 3 ? 0.95 : 0.2;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + t);
      gain.gain.setValueAtTime(0.001, now + t);
      gain.gain.exponentialRampToValueAtTime(0.20 * mult, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + t);
      osc.stop(now + t + dur + 0.05);
    });
  } catch {}
}

// Glitch / Reset sound
export function playGlitchSound() {
  const mult = getGainMultiplier();
  if (mult <= 0) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.6);
    gain.gain.setValueAtTime(0.35 * mult, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  } catch {}
}
