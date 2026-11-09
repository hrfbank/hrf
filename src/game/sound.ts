// أصوات حروف: كلها مولّدة بـ Web Audio (بدون ملفات صوت، وبدون حقوق لأحد).
// المتصفح ما يسمح بالصوت إلا بعد تفاعل المستخدم، فأول استدعاء لازم يكون من ضغطة زر.

type Wave = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;

const settings = { muted: false, music: 0.35, sfx: 0.8 };

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.connect(ctx.destination);
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    musicBus.connect(master);
    sfxBus.connect(master);
    applySettings();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function applySettings() {
  if (!master || !musicBus || !sfxBus || !ctx) return;
  const t = ctx.currentTime;
  master.gain.setTargetAtTime(settings.muted ? 0 : 1, t, 0.02);
  musicBus.gain.setTargetAtTime(settings.music, t, 0.05);
  sfxBus.gain.setTargetAtTime(settings.sfx, t, 0.02);
}

export function setMuted(muted: boolean) {
  settings.muted = muted;
  applySettings();
}

export function setVolume(kind: "music" | "sfx", value: number) {
  settings[kind] = Math.max(0, Math.min(1, value));
  applySettings();
}

/** نغمة واحدة بغلاف صوتي (attack / decay) */
function tone(
  freq: number,
  start: number,
  dur: number,
  { wave = "sine" as Wave, gain = 0.3, attack = 0.005, slideTo, bus }: {
    wave?: Wave; gain?: number; attack?: number; slideTo?: number; bus?: GainNode | null;
  } = {},
) {
  const ac = audio();
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(bus ?? sfxBus!);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

/** نقرة ضوضاء قصيرة (للإيقاع والتكتكة) */
function noise(start: number, dur: number, { gain = 0.2, filter = 2000, type = "bandpass" as BiquadFilterType, bus }: {
  gain?: number; filter?: number; type?: BiquadFilterType; bus?: GainNode | null;
} = {}) {
  const ac = audio();
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const f = ac.createBiquadFilter();
  f.type = type;
  f.frequency.value = filter;
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(bus ?? sfxBus!);
  src.start(start);
}

const now = () => audio().currentTime;

// ---------------- المؤثرات ----------------
export type Team = "red" | "green";

export const sfx = {
  /** جرس الفريق: لكل فريق نغمة مختلفة عشان الكل يعرف من ضغط بدون ما يشوف */
  buzz(team: Team) {
    const t = now();
    const base = team === "red" ? 392 : 523.25; // صول / دو
    tone(base, t, 0.55, { wave: "square", gain: 0.22 });
    tone(base * 1.5, t, 0.55, { wave: "square", gain: 0.12 });
    tone(base * 2, t + 0.02, 0.35, { wave: "triangle", gain: 0.15 });
  },

  /** تكتكة الساعة (تُستخدم في آخر ٤ ثواني) */
  tick(urgent = false) {
    const t = now();
    noise(t, 0.04, { gain: urgent ? 0.5 : 0.35, filter: urgent ? 3200 : 2400 });
    tone(urgent ? 1760 : 1320, t, 0.06, { wave: "triangle", gain: urgent ? 0.18 : 0.12 });
  },

  /** انتهاء الوقت */
  timeUp() {
    const t = now();
    tone(220, t, 0.8, { wave: "sawtooth", gain: 0.18, slideTo: 140 });
    tone(110, t, 0.8, { wave: "square", gain: 0.1 });
  },

  /** إجابة صحيحة */
  correct() {
    const t = now();
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, t + i * 0.08, 0.35, { wave: "triangle", gain: 0.22 }),
    );
  },

  /** إجابة خاطئة */
  wrong() {
    const t = now();
    tone(311, t, 0.22, { wave: "square", gain: 0.16 });
    tone(233, t + 0.2, 0.4, { wave: "square", gain: 0.16 });
  },

  /** كشف تلميح جديد */
  clue() {
    const t = now();
    tone(880, t, 0.25, { gain: 0.15 });
    tone(1318.5, t + 0.07, 0.3, { gain: 0.1 });
  },

  /** كشف الجواب */
  reveal() {
    const t = now();
    [659.25, 830.61, 987.77].forEach((f, i) => tone(f, t + i * 0.05, 0.9, { wave: "sine", gain: 0.12 }));
  },

  /** اختيار خلية / حرف */
  select() {
    const t = now();
    tone(660, t, 0.08, { wave: "triangle", gain: 0.15, slideTo: 990 });
  },

  /** الفوز بالجولة */
  roundWin() {
    const t = now();
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    notes.forEach((f, i) => tone(f, t + i * 0.12, i === notes.length - 1 ? 1.2 : 0.3, { wave: "square", gain: 0.12 }));
    notes.forEach((f, i) => tone(f / 2, t + i * 0.12, 0.3, { wave: "triangle", gain: 0.12 }));
    noise(t + 0.6, 0.6, { gain: 0.15, filter: 6000, type: "highpass" });
  },
};

// ---------------- العدّاد ----------------
/**
 * عدّاد بثواني الإجابة (١٠ / ٢٠ / ٣٠). يتكتك في آخر ٤ ثواني، ويطلق صوت انتهاء الوقت.
 * يرجّع دالة للإيقاف.
 */
export function startCountdown(seconds: number, onTick: (left: number) => void, onEnd: () => void) {
  let left = seconds;
  onTick(left);
  const id = setInterval(() => {
    left -= 1;
    onTick(left);
    if (left > 0 && left <= 4) sfx.tick(left <= 2);
    if (left <= 0) {
      clearInterval(id);
      sfx.timeUp();
      onEnd();
    }
  }, 1000);
  return () => clearInterval(id);
}

// ---------------- الموسيقى ----------------
// لحن أصلي بمقام الحجاز على إيقاع «مقسوم» مبسّط (دُم - تَك).
// المقام: دو، ريb، مي، فا، صول، لاb، سيb
const HIJAZ = [261.63, 277.18, 329.63, 349.23, 392.0, 415.3, 466.16, 523.25];
// [درجة المقام، عدد النبضات] — 8 نبضات لكل مازورة، 4 مازورات
const MELODY: [number | null, number][] = [
  [4, 1], [5, 0.5], [4, 0.5], [2, 1], [3, 1], [4, 2], [null, 2],
  [3, 1], [2, 0.5], [1, 0.5], [2, 1], [3, 1], [2, 2], [null, 2],
  [4, 1], [5, 0.5], [6, 0.5], [7, 1], [6, 1], [5, 1], [4, 1], [null, 2],
  [3, 1], [2, 1], [1, 1], [2, 1], [0, 2], [null, 2],
];
const BASS = [0, 0, 3, 0]; // جذر كل مازورة
// إيقاع المقسوم: D = دُم، T = تَك، . = سكتة (بالثُّمن)
const RHYTHM = "D.TD..T.";

let musicTimer: ReturnType<typeof setInterval> | null = null;

export function startMusic(bpm = 104) {
  if (musicTimer) return;
  const ac = audio();
  const beat = 60 / bpm;
  const barLen = beat * 4;
  let nextBar = ac.currentTime + 0.1;
  let bar = 0;

  // نجهّز النوتات مقسّمة على المازورات
  const bars: { degree: number; at: number; dur: number }[][] = [[], [], [], []];
  let pos = 0;
  for (const [degree, beats] of MELODY) {
    const b = Math.floor(pos / 4);
    if (degree !== null && b < 4) bars[b].push({ degree, at: (pos % 4) * beat, dur: beats * beat });
    pos += beats;
  }

  const scheduleBar = (start: number, i: number) => {
    for (const n of bars[i]) tone(HIJAZ[n.degree] * 2, start + n.at, n.dur * 0.95, { wave: "triangle", gain: 0.1, attack: 0.02, bus: musicBus });
    tone(HIJAZ[BASS[i]] / 2, start, barLen * 0.9, { wave: "sine", gain: 0.16, attack: 0.03, bus: musicBus });
    [...RHYTHM].forEach((s, k) => {
      const t = start + (k * beat) / 2;
      if (s === "D") { tone(110, t, 0.25, { gain: 0.35, slideTo: 55, bus: musicBus }); }
      if (s === "T") noise(t, 0.06, { gain: 0.22, filter: 3500, bus: musicBus });
    });
  };

  // جدولة مسبقة بسيطة: كل ٢٠٠ ملّي ثانية نجهّز المازورة الجاية
  const pump = () => {
    while (nextBar < ac.currentTime + 0.5) {
      scheduleBar(nextBar, bar % 4);
      nextBar += barLen;
      bar += 1;
    }
  };
  pump();
  musicTimer = setInterval(pump, 200);
}

export function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  if (musicBus && ctx) {
    // نخفي الذيل بسرعة
    const g = musicBus.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setTargetAtTime(0, ctx.currentTime, 0.05);
    setTimeout(applySettings, 700);
  }
}

export const isMusicPlaying = () => musicTimer !== null;
