// Âm thanh tổng hợp bằng WebAudio — không cần file asset (PLAN §14.3, giải F1 tạm thời).
// Mọi âm đều ngắn, nhỏ tiếng, và tôn trọng autoplay policy (chỉ kêu sau cử chỉ đầu tiên).

const KEY = 'masoi_sound';
let muted = typeof localStorage !== 'undefined' && localStorage.getItem(KEY) === 'off';
let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

// Trình duyệt chỉ cho mở audio sau cử chỉ người dùng
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', () => void ac(), { once: true });
}

export function isMuted(): boolean {
  return muted;
}

export function toggleMuted(): boolean {
  muted = !muted;
  localStorage.setItem(KEY, muted ? 'off' : 'on');
  return muted;
}

interface ToneOpts {
  freq: number;
  end?: number;
  at?: number; // giây, tính từ "bây giờ"
  dur: number;
  type?: OscillatorType;
  gain?: number;
}

function tone({ freq, end, at = 0, dur, type = 'sine', gain = 0.12 }: ToneOpts): void {
  const c = ac();
  if (!c || muted) return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (end && end !== freq) osc.frequency.exponentialRampToValueAtTime(end, t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function thud(at = 0, gain = 0.4): void {
  const c = ac();
  if (!c || muted) return;
  const t0 = c.currentTime + at;
  const len = Math.floor(c.sampleRate * 0.2);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 180;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t0);
}

export const sfx = {
  /** Màn đêm buông — hai quãng trầm trượt xuống. */
  night(): void {
    tone({ freq: 220, end: 110, dur: 1.1, type: 'sawtooth', gain: 0.05 });
    tone({ freq: 330, end: 165, dur: 1.1, type: 'sine', gain: 0.06, at: 0.05 });
  },
  /** Bình minh — rải ba nốt sáng dần. */
  day(): void {
    tone({ freq: 392, dur: 0.25, gain: 0.09 });
    tone({ freq: 494, dur: 0.25, gain: 0.09, at: 0.13 });
    tone({ freq: 587, dur: 0.45, gain: 0.1, at: 0.26 });
  },
  /** Nhịp trống công bố cái chết. */
  drum(): void {
    thud(0);
    tone({ freq: 90, end: 50, dur: 0.3, gain: 0.35 });
    thud(0.4, 0.3);
  },
  /** Chuông làng — hai hồi khi treo cổ. */
  bell(): void {
    for (const at of [0, 0.7]) {
      tone({ freq: 660, dur: 1.1, gain: 0.1, at });
      tone({ freq: 1320, dur: 0.6, gain: 0.04, at });
    }
  },
  /** Tick 5 giây cuối đồng hồ. */
  tick(): void {
    tone({ freq: 1050, dur: 0.05, type: 'square', gain: 0.04 });
  },
  /** Chime "tới lượt bạn". */
  turn(): void {
    tone({ freq: 880, dur: 0.14, gain: 0.1 });
    tone({ freq: 1318, dur: 0.22, gain: 0.1, at: 0.15 });
  },
  /** Tin nhắn mới. */
  pop(): void {
    tone({ freq: 620, end: 900, dur: 0.07, gain: 0.05 });
  },
  win(): void {
    tone({ freq: 523, dur: 0.2, gain: 0.11 });
    tone({ freq: 659, dur: 0.2, gain: 0.11, at: 0.18 });
    tone({ freq: 784, dur: 0.55, gain: 0.12, at: 0.36 });
  },
  lose(): void {
    tone({ freq: 392, end: 185, dur: 0.9, type: 'sawtooth', gain: 0.07 });
  },
};
