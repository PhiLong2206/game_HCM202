// src/utils/audioManager.js
// Central Audio Manager for "ĐẤU TRƯỜNG ĐẠI ĐOÀN KẾT"
// Classroom Game Show Sound Design: Crowd Cheer, Comedy Trombone, Victory Roar

import * as synth from './audio';

// 6 Core Classroom Sound Names + Fate & Auxiliaries
export const SOUND_NAMES = {
  CORRECT_CHEER: 'correct-cheer',
  WRONG_SAD: 'wrong-sad',
  TIMEOUT: 'timeout',
  TEAM_CHEER: 'team-cheer',
  UNITY_SUCCESS: 'unity-success',
  VICTORY_CROWD: 'victory-crowd',

  // Fate sounds
  FATE_REVEAL: 'fate-reveal',
  REWARD: 'reward',
  JACKPOT: 'jackpot',
  ALLY: 'ally',
  TEAM_UP: 'team-up',
  SHIELD: 'shield',
  SHIELD_BLOCK: 'shield-block',
  BAD_LUCK: 'bad-luck',
  MYSTERY: 'mystery'
};

const SOUND_PATHS = {
  'correct-cheer': '/sounds/correct-cheer.mp3',
  'wrong-sad': '/sounds/wrong-sad.mp3',
  'timeout': '/sounds/timeout.mp3',
  'team-cheer': '/sounds/team-cheer.mp3',
  'unity-success': '/sounds/unity-success.mp3',
  'victory-crowd': '/sounds/victory-crowd.mp3',

  // Fate paths
  'fate-reveal': '/sounds/fate-reveal.mp3',
  'reward': '/sounds/reward.mp3',
  'jackpot': '/sounds/jackpot.mp3',
  'ally': '/sounds/ally.mp3',
  'team-up': '/sounds/team-up.mp3',
  'shield': '/sounds/shield.mp3',
  'shield-block': '/sounds/shield-block.mp3',
  'bad-luck': '/sounds/bad-luck.mp3',
  'mystery': '/sounds/mystery.mp3',

  // Aliases for seamless backward compatibility
  'correct': '/sounds/correct-cheer.mp3',
  'wrong': '/sounds/wrong-sad.mp3',
  'rescue-success': '/sounds/team-cheer.mp3',
  'final-success': '/sounds/unity-success.mp3',
  'victory': '/sounds/victory-crowd.mp3'
};

// Preset volume weights per sound type (Classroom speaker optimized)
const SOUND_VOLUME_WEIGHTS = {
  'correct-cheer': 0.55,
  'wrong-sad': 0.55,
  'timeout': 0.55,
  'team-cheer': 0.55,
  'unity-success': 0.60,
  'victory-crowd': 0.65,

  'correct': 0.55,
  'wrong': 0.55,
  'rescue-success': 0.55,
  'final-success': 0.60,
  'victory': 0.65,

  'fate-reveal': 0.55,
  'reward': 0.55,
  'jackpot': 0.60,
  'ally': 0.55,
  'team-up': 0.55,
  'shield': 0.55,
  'shield-block': 0.58,
  'bad-luck': 0.55,
  'mystery': 0.55
};

// Procedural synthesizer fallbacks from audio.js
const SYNTH_FALLBACKS = {
  'correct-cheer': synth.playCorrectCheerSound,
  'wrong-sad': synth.playWrongSadSound,
  'timeout': synth.playTimeoutSound,
  'team-cheer': synth.playTeamCheerSound,
  'unity-success': synth.playUnitySuccessSound,
  'victory-crowd': synth.playVictoryCrowdSound,

  // Aliases
  'correct': synth.playCorrectCheerSound,
  'wrong': synth.playWrongSadSound,
  'rescue-success': synth.playTeamCheerSound,
  'final-success': synth.playUnitySuccessSound,
  'victory': synth.playVictoryCrowdSound,

  // Fate sounds
  'fate-reveal': synth.playFateRevealSound,
  'reward': synth.playRewardSound,
  'jackpot': synth.playJackpotSound,
  'ally': synth.playAllySound,
  'team-up': synth.playTeamUpSound,
  'shield': synth.playShieldSound,
  'shield-block': synth.playShieldBlockSound,
  'bad-luck': synth.playBadLuckSound,
  'mystery': synth.playMysterySound,

  // Auxiliaries
  'tick': () => synth.playTickSound(false),
  'warning-tick': () => synth.playTickSound(true),
  'lock': synth.playLockSound,
  'reveal': synth.playRevealSound,
  'glitch': synth.playGlitchSound,
  'top4': synth.playTop4Sound,
  'top3': synth.playTop3Sound,
  'top2': synth.playTop2Sound,
  'top1': synth.playVictoryCrowdSound
};

class AudioManager {
  constructor() {
    this.audioCache = new Map();
    this.missingFiles = new Set();
    this.lastPlayTime = new Map();
    this.activeAudioElements = new Set();

    // Volume & Mute state
    this.isMuted = synth.getMuted();
    this.volume = synth.getVolume(); // Master slider scale (default 0.6)

    this.preloadPrimarySounds();
  }

  preloadPrimarySounds() {
    if (typeof window === 'undefined') return;
    const keysToPreload = [
      'correct-cheer',
      'wrong-sad',
      'timeout',
      'team-cheer',
      'unity-success',
      'victory-crowd'
    ];
    keysToPreload.forEach(name => {
      this.getAudioElement(name);
    });
  }

  getAudioElement(name) {
    if (typeof window === 'undefined') return null;
    const path = SOUND_PATHS[name];
    if (!path) return null;

    if (this.missingFiles.has(name)) {
      return null;
    }

    if (!this.audioCache.has(name)) {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        const weight = SOUND_VOLUME_WEIGHTS[name] || 0.6;
        audio.volume = Math.max(0, Math.min(1, this.volume * (weight / 0.6)));

        // On error (e.g. 404 missing mp3), register into missingFiles and fallback
        audio.addEventListener('error', () => {
          this.missingFiles.add(name);
        }, { once: true });

        audio.src = path;
        this.audioCache.set(name, audio);
      } catch {
        this.missingFiles.add(name);
        return null;
      }
    }

    return this.audioCache.get(name);
  }

  playSound(name) {
    if (this.isMuted || this.volume <= 0) return;

    // Prevent rapid duplicate spam (< 50ms)
    const now = Date.now();
    const last = this.lastPlayTime.get(name) || 0;
    if (now - last < 50) return;
    this.lastPlayTime.set(name, now);

    // If file known to be missing, use procedural synth immediately
    if (this.missingFiles.has(name) || !SOUND_PATHS[name]) {
      this.playSynthFallback(name);
      return;
    }

    const audio = this.getAudioElement(name);
    if (!audio) {
      this.playSynthFallback(name);
      return;
    }

    try {
      const weight = SOUND_VOLUME_WEIGHTS[name] || 0.6;
      audio.volume = Math.max(0, Math.min(1, this.volume * (weight / 0.6)));
      audio.currentTime = 0;
      this.activeAudioElements.add(audio);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audio.onended = () => {
              this.activeAudioElements.delete(audio);
            };
          })
          .catch(() => {
            // Audio file missing or blocked -> Fallback to Web Audio synthesis!
            this.missingFiles.add(name);
            this.activeAudioElements.delete(audio);
            this.playSynthFallback(name);
          });
      }
    } catch {
      this.missingFiles.add(name);
      this.playSynthFallback(name);
    }
  }

  playSynthFallback(name) {
    const fn = SYNTH_FALLBACKS[name];
    if (typeof fn === 'function') {
      try {
        fn();
      } catch {}
    }
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    synth.setMuted(this.isMuted);

    this.activeAudioElements.forEach(audio => {
      audio.muted = this.isMuted;
      if (this.isMuted) {
        audio.pause();
      }
    });

    try {
      localStorage.setItem('gameSoundEnabled', String(!this.isMuted));
    } catch {}
  }

  getMuted() {
    return this.isMuted;
  }

  setVolume(vol) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volume = clamped;
    synth.setVolume(clamped);

    this.audioCache.forEach((audio, name) => {
      const weight = SOUND_VOLUME_WEIGHTS[name] || 0.6;
      audio.volume = Math.max(0, Math.min(1, this.volume * (weight / 0.6)));
    });

    try {
      localStorage.setItem('gameSoundVolume', String(clamped));
    } catch {}
  }

  getVolume() {
    return this.volume;
  }

  stopAll() {
    this.activeAudioElements.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    });
    this.activeAudioElements.clear();
  }
}

// Global Singleton Instance
export const audioManager = new AudioManager();

export const playSound = (name) => audioManager.playSound(name);
export const setSoundMuted = (muted) => audioManager.setMuted(muted);
export const getSoundMuted = () => audioManager.getMuted();
export const setSoundVolume = (vol) => audioManager.setVolume(vol);
export const getSoundVolume = () => audioManager.getVolume();
export const stopAllSounds = () => audioManager.stopAll();

export default audioManager;
