import { state } from '../core/State';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let droneOsc: OscillatorNode | null = null;
let droneGain: GainNode | null = null;

export function ensureAudio(): void {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    masterGain.gain.value = state.soundVolume / 100;
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

export function setVolume(val: number): void {
  if (masterGain) masterGain.gain.value = val / 100;
}

export function playTone(freq: number, type: OscillatorType = 'sine', duration = 0.3, vol = 0.15): void {
  if (!state.sound) return;
  ensureAudio();
  if (!audioCtx || !masterGain) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

export function playNotification(): void {
  if (!state.sound) return;
  const theme = state.soundTheme;
  if (theme === 'classic') {
    playTone(880, 'sine', 0.12, 0.12);
    setTimeout(() => playTone(1100, 'sine', 0.18, 0.1), 80);
  } else if (theme === 'retro') {
    playTone(1200, 'square', 0.08, 0.06);
    setTimeout(() => playTone(900, 'square', 0.12, 0.06), 60);
  } else {
    playTone(600, 'sawtooth', 0.15, 0.05);
    setTimeout(() => playTone(900, 'sawtooth', 0.2, 0.05), 100);
  }
}

export function playHDD(): void {
  if (!state.sound) return;
  playTone(200 + Math.random() * 800, 'sine', 0.05, 0.05);
}

export function startDrone(): void {
  if (!state.sound || droneOsc) return;
  ensureAudio();
  if (!audioCtx || !masterGain) return;
  droneOsc = audioCtx.createOscillator();
  droneGain = audioCtx.createGain();
  droneOsc.type = 'sine';
  droneOsc.frequency.setValueAtTime(50, audioCtx.currentTime);
  droneGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
  droneOsc.connect(droneGain);
  droneGain.connect(masterGain);
  droneOsc.start();
}

export function stopDrone(): void {
  if (droneOsc) { droneOsc.stop(); droneOsc = null; }
  droneGain = null;
}

export function playGlitchSound(): void {
  if (!state.sound) return;
  playTone(100 + Math.random() * 2000, 'sawtooth', 0.1, 0.08);
}

export function playTestSound(): void {
  playNotification();
  setTimeout(() => playNotification(), 300);
}

export function playClick(): void {
  if (!state.sound) return;
  playTone(2000, 'sine', 0.05, 0.03);
}
