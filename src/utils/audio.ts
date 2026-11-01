// Web Audio API synthesized casino sound effects & Native Khmer Voiceover Audio

let audioCtx: AudioContext | null = null;
let isMuted = false;

export const KHMER_COUNTDOWN_WORDS: Record<number, { text: string; phonetic: string; english: string }> = {
  10: { text: 'ដប់', phonetic: 'Dop', english: '10' },
  9: { text: 'ប្រាំបួន', phonetic: 'Pram Boun', english: '9' },
  8: { text: 'ប្រាំបី', phonetic: 'Pram Bei', english: '8' },
  7: { text: 'ប្រាំពីរ', phonetic: 'Pram Pir', english: '7' },
  6: { text: 'ប្រាំមួយ', phonetic: 'Pram Mouy', english: '6' },
  5: { text: 'ប្រាំ', phonetic: 'Pram', english: '5' },
  4: { text: 'បួន', phonetic: 'Boun', english: '4' },
  3: { text: 'បី', phonetic: 'Bei', english: '3' },
  2: { text: 'ពីរ', phonetic: 'Pir', english: '2' },
  1: { text: 'មួយ', phonetic: 'Mouy', english: '1' },
};

export const KHMER_BLESSING = {
  text: 'សូមសំណាងល្អ',
  phonetic: 'Som samnang laor',
  english: 'Good luck!',
};

// Authentic Native Khmer Human Voice MP3 paths (100% human native speaker)
export const KHMER_AUDIO_FILES: Record<number | string, string> = {
  10: '/audio/khmer/count_10.mp3?v=khmer_user_custom_v1',
  9: '/audio/khmer/count_9.mp3?v=khmer_user_custom_v1',
  8: '/audio/khmer/count_8.mp3?v=khmer_user_custom_v1',
  7: '/audio/khmer/count_7.mp3?v=khmer_user_custom_v1',
  6: '/audio/khmer/count_6.mp3?v=khmer_user_custom_v1',
  5: '/audio/khmer/count_5.mp3?v=khmer_user_custom_v1',
  4: '/audio/khmer/count_4.mp3?v=khmer_user_custom_v1',
  3: '/audio/khmer/count_3.mp3?v=khmer_user_custom_v1',
  2: '/audio/khmer/count_2.mp3?v=khmer_user_custom_v1',
  1: '/audio/khmer/count_1.mp3?v=khmer_user_custom_v1',
  blessing: '/audio/khmer/blessing.mp3?v=khmer_user_custom_v1',
};

// In-memory cache for decoded AudioBuffers and HTMLAudioElement fallbacks
const khmerAudioBuffers: Map<number | string, AudioBuffer> = new Map();
const khmerAudioElements: Map<number | string, HTMLAudioElement> = new Map();
let isPreloaded = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function preloadKhmerVoiceAudio() {
  if (typeof window === 'undefined' || isPreloaded) return;
  isPreloaded = true;

  const ctx = getAudioContext();

  Object.entries(KHMER_AUDIO_FILES).forEach(([key, url]) => {
    // 1. Audio element preload for immediate fallback
    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      khmerAudioElements.set(key, audio);
      if (!isNaN(Number(key))) {
        khmerAudioElements.set(Number(key), audio);
      }
    } catch {
      // ignore
    }

    // 2. Decode into Web Audio buffer for instant 0ms latency playback
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.arrayBuffer();
      })
      .then((arrayBuf) => {
        if (ctx) {
          return ctx.decodeAudioData(arrayBuf);
        }
        return null;
      })
      .then((decoded) => {
        if (decoded) {
          khmerAudioBuffers.set(key, decoded);
          if (!isNaN(Number(key))) {
            khmerAudioBuffers.set(Number(key), decoded);
          }
        }
      })
      .catch(() => {
        // Fallback to HTML Audio elements
      });
  });
}

// Auto preload on script init and user interaction
if (typeof window !== 'undefined') {
  preloadKhmerVoiceAudio();
  const unlockAudio = () => {
    getAudioContext();
    preloadKhmerVoiceAudio();
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

export function setSoundMuted(muted: boolean) {
  isMuted = muted;
}

export function getSoundMuted(): boolean {
  return isMuted;
}

/**
 * Play authentic, 100% native human Khmer voice audio file
 */
export function playKhmerVoiceAudio(key: number | string) {
  if (isMuted) return;

  const ctx = getAudioContext();
  const buffer = khmerAudioBuffers.get(key) ?? khmerAudioBuffers.get(Number(key));

  // 1. High-fidelity Web Audio buffer playback (0ms latency, pure human voice)
  if (ctx && buffer) {
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(1.0, ctx.currentTime);
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
      return;
    } catch (e) {
      console.warn('WebAudio buffer playback fallback:', e);
    }
  }

  // 2. Instant HTML5 Audio fallback
  const cachedAudio = khmerAudioElements.get(key) ?? khmerAudioElements.get(Number(key));
  if (cachedAudio) {
    try {
      const clone = cachedAudio.cloneNode(true) as HTMLAudioElement;
      clone.volume = 1.0;
      clone.play().catch(() => {});
      return;
    } catch {
      // fallback to new Audio
    }
  }

  // 3. Direct new Audio element
  const url = KHMER_AUDIO_FILES[key] ?? KHMER_AUDIO_FILES[Number(key)];
  if (url) {
    try {
      const audio = new Audio(url);
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch {
      // ignore
    }
  }
}

/**
 * Rising percussive musical scale frequencies from 10 down to 1
 * Builds rising sonic tension as the round closes
 */
const COUNTDOWN_PITCHES: Record<number, number> = {
  10: 440.0,  // A4
  9: 493.88,  // B4
  8: 523.25,  // C5
  7: 587.33,  // D5
  6: 659.25,  // E5
  5: 698.46,  // F5
  4: 783.99,  // G5
  3: 880.0,   // A5
  2: 987.77,  // B5
  1: 1046.5,  // C6 (Peak tension)
};

/**
 * Khmer countdown voiceover during final 10 seconds (10 to 1)
 * Synchronized with authentic native Khmer voice and rising percussive audio cues
 */
export function playKhmerCountdownSound(num: number) {
  if (isMuted) return;

  // 1. Synthesize multi-layered rising percussive audio cue
  const ctx = getAudioContext();
  if (ctx) {
    const now = ctx.currentTime;

    // Gentle acoustic kick/percussion tap (subtle pulse under human voice)
    const kickOsc = ctx.createOscillator();
    const kickGain = ctx.createGain();
    kickOsc.type = 'sine';
    kickOsc.frequency.setValueAtTime(120 + (10 - num) * 8, now);
    kickOsc.frequency.exponentialRampToValueAtTime(32, now + 0.06);

    kickGain.gain.setValueAtTime(0.12, now);
    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    kickOsc.connect(kickGain);
    kickGain.connect(ctx.destination);
    kickOsc.start(now);
    kickOsc.stop(now + 0.07);

    // Subtle rim snap for rhythmic definition
    const rimOsc = ctx.createOscillator();
    const rimGain = ctx.createGain();
    rimOsc.type = 'triangle';
    rimOsc.frequency.setValueAtTime(1000 + (10 - num) * 80, now);
    rimOsc.frequency.exponentialRampToValueAtTime(350, now + 0.025);

    rimGain.gain.setValueAtTime(0.08, now);
    rimGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    rimOsc.connect(rimGain);
    rimGain.connect(ctx.destination);
    rimOsc.start(now);
    rimOsc.stop(now + 0.03);

    // Soft subtle tension ping
    const toneFreq = COUNTDOWN_PITCHES[num] || 520;
    const toneOsc = ctx.createOscillator();
    const toneGain = ctx.createGain();
    toneOsc.type = 'sine';
    toneOsc.frequency.setValueAtTime(toneFreq, now);

    toneGain.gain.setValueAtTime(0.1, now);
    toneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    toneOsc.connect(toneGain);
    toneGain.connect(ctx.destination);
    toneOsc.start(now);
    toneOsc.stop(now + 0.1);
  }

  // 2. Play AUTHENTIC native human Khmer voice recording (10: «ដប់», 9: «ប្រាំបួន», ..., 1: «មួយ»)
  playKhmerVoiceAudio(num);
}

/**
 * Khmer blessing voiceover after round closes: «សូមសំណាងល្អ»
 * Synchronized with gong resonance, celebration fanfare, and native Khmer human voice!
 */
export function playKhmerGoodLuckSound() {
  if (isMuted) return;

  const ctx = getAudioContext();
  if (ctx) {
    const now = ctx.currentTime;

    // Resonant gong / singing bowl chime
    const gong = ctx.createOscillator();
    const gongGain = ctx.createGain();
    gong.type = 'sine';
    gong.frequency.setValueAtTime(329.63, now); // E4 warm gong
    gongGain.gain.setValueAtTime(0.4, now);
    gongGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    gong.connect(gongGain);
    gongGain.connect(ctx.destination);
    gong.start(now);
    gong.stop(now + 1.2);

    // Celebratory casino arpeggio fanfare
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.28, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.45);
    });
  }

  // Play AUTHENTIC native human Khmer blessing audio: «សូមសំណាងល្អ»
  playKhmerVoiceAudio('blessing');
}

export function playChipSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

export function playTickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, ctx.currentTime);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.04);
}

export function playRevealSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

    gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.08);
    osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
  });
}

export function playWinSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);

    gain.gain.setValueAtTime(0.3, ctx.currentTime + index * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + index * 0.1);
    osc.stop(ctx.currentTime + index * 0.1 + 0.4);
  });
}

export function playClickSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.03);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.03);
}

