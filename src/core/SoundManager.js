/**
 * SoundManager.js
 * High-performance Web Audio API procedural synthesizer for dark-fantasy combat SFX & dynamic BGM.
 * Zero external asset dependencies, zero loading latency, 100% reliable across browsers.
 */

export class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.isMuted = false;
    this.masterVolume = 0.8;
    this.sfxVolume = 0.9;
    this.bgmVolume = 0.5;

    this.isBgmPlaying = false;
    this.bgmLoopId = null;
    this.combatIntensity = 1; // 1 = normal, 2 = boss, 3 = boss enraged
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
  }

  setSFXVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  setBGMVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // Helper: create white noise buffer
  _createNoiseBuffer(duration = 1.0) {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // --- SOUND EFFECTS ---

  playSlash(type = 'light') {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Noise layer for blade swoosh
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.25);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(type === 'heavy' ? 450 : 900, t);
    filter.frequency.exponentialRampToValueAtTime(type === 'heavy' ? 2200 : 3500, t + 0.15);
    filter.Q.setValueAtTime(3, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(type === 'heavy' ? 0.8 : 0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (type === 'heavy' ? 0.28 : 0.18));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.3);

    // Tonal metallic ring layer
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(type === 'heavy' ? 240 : 480, t);
    osc.frequency.exponentialRampToValueAtTime(type === 'heavy' ? 80 : 160, t + 0.2);

    oscGain.gain.setValueAtTime(0.3, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  playHit(element = 'none') {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Solid impact thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);

    // Metallic clink
    const clink = this.ctx.createOscillator();
    const clinkGain = this.ctx.createGain();
    clink.type = 'sine';
    clink.frequency.setValueAtTime(1200 + Math.random() * 400, t);
    clinkGain.gain.setValueAtTime(0.4, t);
    clinkGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    clink.connect(clinkGain);
    clinkGain.connect(this.sfxGain);
    clink.start(t);
    clink.stop(t + 0.1);

    // Elemental hit accent
    if (element === 'FIRE') {
      this._playFlameBurst(t, 0.15, 600);
    } else if (element === 'ICE') {
      this._playIceCrack(t, 0.2);
    } else if (element === 'STORM') {
      this._playSparkZap(t, 0.15);
    }
  }

  _playFlameBurst(t, duration, freq) {
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(duration);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq, t);
    filter.frequency.linearRampToValueAtTime(200, t + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
  }

  _playIceCrack(t, duration) {
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800 + i * 800 + Math.random() * 300, t + i * 0.03);
      gain.gain.setValueAtTime(0.3, t + i * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.03 + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.03);
      osc.stop(t + i * 0.03 + 0.09);
    }
  }

  _playSparkZap(t, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800 + Math.random() * 600, t);
    osc.frequency.linearRampToValueAtTime(150, t + duration);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + duration);
  }

  playDodge() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.3);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(1600, t + 0.15);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.3);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
  }

  playSwitchElement(element) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (element === 'FIRE') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(550, t + 0.25);
      this._playFlameBurst(t, 0.3, 800);
    } else if (element === 'ICE') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, t);
      osc.frequency.exponentialRampToValueAtTime(1040, t + 0.3);
      this._playIceCrack(t, 0.25);
    } else { // STORM
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(330, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.2);
      this._playSparkZap(t, 0.25);
    }

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  playSkill(element) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    if (element === 'FIRE') {
      // Flame Wave Roar
      this._playFlameBurst(t, 0.6, 1200);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(380, t + 0.3);
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.5);
    } else if (element === 'ICE') {
      // Frost Spikes Launch
      this._playIceCrack(t, 0.4);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.4);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.45);
    } else {
      // Thunder Dash Shockwave
      this._playSparkZap(t, 0.4);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.35);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.4);
    }
  }

  playUltimate(element) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Massive sub-bass boom for all ultimates
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(120, t);
    sub.frequency.exponentialRampToValueAtTime(25, t + 1.2);
    subGain.gain.setValueAtTime(0.9, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(t);
    sub.stop(t + 1.25);

    if (element === 'FIRE') {
      // Magma eruption detonation
      this._playFlameBurst(t, 1.4, 1800);
    } else if (element === 'ICE') {
      // Glacial nova shatter
      this._playIceCrack(t, 0.8);
      this._playIceCrack(t + 0.15, 0.7);
    } else {
      // Massive lightning thunderclaps
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          if (!this.ctx) return;
          this._playSparkZap(this.ctx.currentTime, 0.35);
          const clap = this.ctx.createOscillator();
          const cg = this.ctx.createGain();
          clap.type = 'sawtooth';
          clap.frequency.setValueAtTime(150, this.ctx.currentTime);
          cg.gain.setValueAtTime(0.6, this.ctx.currentTime);
          cg.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
          clap.connect(cg);
          cg.connect(this.sfxGain);
          clap.start(this.ctx.currentTime);
          clap.stop(this.ctx.currentTime + 0.4);
        }, i * 180);
      }
    }
  }

  playBossRoar() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.linearRampToValueAtTime(95, t + 0.6);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.8);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(68, t); // Slight detune for menacing chorus
    osc2.frequency.linearRampToValueAtTime(99, t + 0.6);
    osc2.frequency.exponentialRampToValueAtTime(42, t + 1.8);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 1.85);
    osc2.stop(t + 1.85);
  }

  playBossSlam() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(90, t);
    sub.frequency.exponentialRampToValueAtTime(20, t + 0.8);
    subGain.gain.setValueAtTime(1.0, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(t);
    sub.stop(t + 0.85);

    this._playFlameBurst(t, 0.6, 500);
  }

  playFootstep() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._createNoiseBuffer(0.08);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(240, t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
  }

  playClueInspect() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [520, 650, 780, 980].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.2, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.45);
    });
  }

  playPuzzleSolve() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [330, 440, 554, 660].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);
      gain.gain.setValueAtTime(0.35, t + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 1.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 1.25);
    });
  }

  playVictory() {
    if (!this.ctx) return;
    const notes = [220, 277.18, 329.63, 440, 554.37, 659.25, 880];
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.16);

      gain.gain.setValueAtTime(0.35, t + idx * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.16 + (idx === notes.length - 1 ? 1.5 : 0.4));

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.16);
      osc.stop(t + idx * 0.16 + 1.6);
    });
  }

  playGameOver() {
    if (!this.ctx) return;
    const notes = [330, 311, 293, 261, 220, 164];
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.28);

      gain.gain.setValueAtTime(0.35, t + idx * 0.28);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.28 + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.28);
      osc.stop(t + idx * 0.28 + 0.8);
    });
  }

  // --- DYNAMIC PROCEDURAL DARK FANTASY BGM ---

  startBGM() {
    if (!this.ctx) this.init();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this._runBgmLoop();
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmLoopId) {
      clearTimeout(this.bgmLoopId);
      this.bgmLoopId = null;
    }
  }

  setCombatIntensity(intensity) {
    this.combatIntensity = intensity;
  }

  _runBgmLoop() {
    if (!this.isBgmPlaying || !this.ctx) return;

    // D minor / Phrygian dark fantasy chord progression: Dm -> Bb -> Gm -> A / C#dim
    const progressions = [
      [146.83, 174.61, 220.00], // Dm (D3, F3, A3)
      [116.54, 146.83, 174.61], // Bb (Bb2, D3, F3)
      [98.00, 116.54, 146.83],  // Gm (G2, Bb2, D3)
      [110.00, 138.59, 164.81], // A / C#dim (A2, C#3, E3)
    ];

    const currentChord = progressions[Math.floor(Math.random() * progressions.length)];
    const t = this.ctx.currentTime;
    const chordDuration = this.combatIntensity >= 3 ? 2.5 : (this.combatIntensity >= 2 ? 3.5 : 5.0);

    // Deep drone bass
    const bass = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bass.type = 'sawtooth';
    bass.frequency.setValueAtTime(currentChord[0] * 0.5, t);

    const bassFilter = this.ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(180, t);

    bassGain.gain.setValueAtTime(0.01, t);
    bassGain.gain.linearRampToValueAtTime(0.25, t + 0.8);
    bassGain.gain.setValueAtTime(0.25, t + chordDuration - 0.8);
    bassGain.gain.linearRampToValueAtTime(0.001, t + chordDuration);

    bass.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.bgmGain);
    bass.start(t);
    bass.stop(t + chordDuration);

    // Atmosphere pad
    currentChord.forEach((f, i) => {
      const pad = this.ctx.createOscillator();
      const padGain = this.ctx.createGain();
      pad.type = 'sine';
      pad.frequency.setValueAtTime(f, t);

      padGain.gain.setValueAtTime(0.01, t);
      padGain.gain.linearRampToValueAtTime(0.12, t + 1.2);
      padGain.gain.setValueAtTime(0.12, t + chordDuration - 1.0);
      padGain.gain.linearRampToValueAtTime(0.001, t + chordDuration);

      pad.connect(padGain);
      padGain.connect(this.bgmGain);
      pad.start(t);
      pad.stop(t + chordDuration);
    });

    // Intense battle percussion pulses when in combat or boss phase
    if (this.combatIntensity >= 2) {
      const beatInterval = chordDuration / 4;
      for (let b = 0; b < 4; b++) {
        const beatTime = t + b * beatInterval;
        const drum = this.ctx.createOscillator();
        const dGain = this.ctx.createGain();
        drum.type = 'triangle';
        drum.frequency.setValueAtTime(80, beatTime);
        drum.frequency.exponentialRampToValueAtTime(30, beatTime + 0.15);

        dGain.gain.setValueAtTime(0.35, beatTime);
        dGain.gain.exponentialRampToValueAtTime(0.001, beatTime + 0.2);

        drum.connect(dGain);
        dGain.connect(this.bgmGain);
        drum.start(beatTime);
        drum.stop(beatTime + 0.22);
      }
    }

    this.bgmLoopId = setTimeout(() => {
      this._runBgmLoop();
    }, (chordDuration - 0.3) * 1000);
  }
}

export const soundManager = new SoundManager();
